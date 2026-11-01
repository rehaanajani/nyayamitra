"""Chat client for Gnani Evon.

Routes, Evon first:
1. LLM_BASE_URL: Evon on any OpenAI-compatible server, e.g. llama.cpp on
   Kaggle's free T4s (deploy/kaggle-evon.ipynb).
2. HF_TOKEN: Evon on the free Hugging Face Space (see evon_space.py).
3. BACKUP_LLM_*: Gemini on Vertex AI.
Each route races the next after a short head start (see _race), so a slow or
dead route never stalls a spoken reply.
"""

import asyncio
import json
import re
import time

import httpx
import logging

from . import evon_space
from .config import Keys


log = logging.getLogger("nyayamitra.llm")


class NoLLM(Exception):
    pass


# A route that just failed is skipped for a while, so a dead Kaggle tunnel or an
# exhausted Space costs one slow turn, not every turn.
_COOLDOWN = {"kaggle": 120, "space": 900, "backup": 60}
_failed_at: dict[str, float] = {}
# Evon gets this long on its own before the next route starts racing it.
HEDGE_AFTER = 2.5


async def chat(keys: Keys, messages: list[dict], *, max_tokens: int = 300,
               temperature: float = 0.5, want_json: bool = False) -> str:
    if not keys.has_llm:
        raise NoLLM()
    routes = []  # (name, start, hard timeout in seconds), Evon first
    if keys.llm_base and keys.llm_model:
        routes.append(("kaggle", lambda: _openai_chat(keys.llm_base, keys.llm_key, keys.llm_model,
                                                      messages, max_tokens, temperature, want_json), 20))
    if keys.hf_token:
        routes.append(("space", lambda: _space_chat(keys.hf_token, messages, max_tokens), 25))
    if keys.fb_base and keys.fb_model:
        routes.append(("backup", lambda: _openai_chat(keys.fb_base, keys.fb_key, keys.fb_model,
                                                      messages, max_tokens, temperature, want_json), 30))
    now = time.time()
    live = [r for r in routes if now - _failed_at.get(r[0], 0) > _COOLDOWN[r[0]]] or routes[-1:]
    return await _race(live)


async def _race(routes: list) -> str:
    """Evon routes start together; the backup joins after HEDGE_AFTER seconds, or
    at once if every Evon route has already failed. The first good answer wins.
    Losers are left to finish in the background so their failures still count."""
    evon = [r for r in routes if r[0] != "backup"]
    backup = [r for r in routes if r[0] == "backup"]
    pending: dict[asyncio.Task, str] = {}
    last_err: Exception | None = None

    def record(task: asyncio.Task, name: str):
        if task.cancelled():
            return
        err = task.exception()
        if err is not None or not task.result():
            _failed_at[name] = time.time()
            log.warning("llm route %s failed: %s: %s", name, type(err).__name__, str(err)[:200])

    def launch(name, start, limit):
        task = asyncio.create_task(asyncio.wait_for(start(), limit))
        task.add_done_callback(lambda t, n=name: record(t, n))
        pending[task] = name

    for r in evon or backup:
        launch(*r)
    queue = backup if evon else []
    while pending:
        done, _ = await asyncio.wait(pending, timeout=HEDGE_AFTER if queue else None,
                                     return_when=asyncio.FIRST_COMPLETED)
        for task in done:
            pending.pop(task)
            if not task.exception() and task.result():
                return task.result()
            last_err = task.exception() or RuntimeError("empty reply")
        if queue and (not done or not pending):
            launch(*queue.pop(0))  # Evon is slow or gone: let the backup race it
    raise last_err or NoLLM()


async def _space_chat(token: str, messages: list[dict], max_tokens: int) -> str:
    out = await evon_space.chat(token, messages, max_tokens)
    return re.sub(r"<think>.*?</think>", "", out, flags=re.S).strip()


async def _openai_chat(base: str, key: str, model: str, messages: list[dict], max_tokens: int,
                       temperature: float, want_json: bool) -> str:
    if key and "aiplatform.googleapis.com" in base:
        return await _vertex_chat(base, key, model, messages, max_tokens, temperature, want_json)
    body: dict = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    if "evon" in model.lower():
        # Evon is a reasoning model; spoken replies need speed, not visible thinking
        body["chat_template_kwargs"] = {"enable_thinking": False}
    if want_json:
        body["response_format"] = {"type": "json_object"}
    if not key and "aiplatform.googleapis.com" in base:
        key = await _vertex_token()
    headers = {"Authorization": f"Bearer {key}"} if key else {}
    async with httpx.AsyncClient(timeout=45) as client:
        r = await client.post(f"{base}/chat/completions", json=body, headers=headers)
        if r.status_code == 400 and want_json:
            # some servers reject response_format; the prompt already asks for JSON
            body.pop("response_format", None)
            r = await client.post(f"{base}/chat/completions", json=body, headers=headers)
    if r.status_code != 200:
        raise RuntimeError(f"LLM {r.status_code}: {r.text[:300]}")
    content = r.json()["choices"][0]["message"].get("content") or ""
    # strip any leaked reasoning block
    return re.sub(r"<think>.*?</think>", "", content, flags=re.S).strip()


def parse_json(text: str) -> dict | None:
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return None


_vertex = {"token": "", "exp": 0.0}


async def _vertex_token() -> str:
    """Short-lived OAuth token for Vertex AI from the runtime's own identity
    (the Cloud Run service account, or `gcloud auth application-default login`
    locally), so no long-lived key exists anywhere."""
    if time.time() < _vertex["exp"] - 60:
        return _vertex["token"]
    import google.auth
    from google.auth.transport.requests import Request

    def refresh() -> str:
        creds, _ = google.auth.default(scopes=["https://www.googleapis.com/auth/cloud-platform"])
        creds.refresh(Request())
        _vertex["exp"] = creds.expiry.timestamp() if creds.expiry else time.time() + 1800
        return creds.token

    _vertex["token"] = await asyncio.to_thread(refresh)
    return _vertex["token"]


async def _vertex_chat(base: str, key: str, model: str, messages: list[dict], max_tokens: int,
                       temperature: float, want_json: bool) -> str:
    """Gemini on Vertex AI with an API key (native generateContent; the
    OpenAI-compatible Vertex endpoint only takes OAuth tokens)."""
    system = "\n\n".join(m["content"] for m in messages if m["role"] == "system")
    contents = [{"role": "user" if m["role"] == "user" else "model", "parts": [{"text": m["content"]}]}
                for m in messages if m["role"] != "system"]
    body: dict = {
        "contents": contents,
        # Gemini 3.x always thinks first and counts it against the output limit,
        # so leave room for the thinking on top of the spoken reply
        # no temperature: Gemini 3.x is tuned for its default and can loop below it
        "generationConfig": {"maxOutputTokens": max_tokens + 1024,
                             # low thinking answers in ~4 s instead of 15-30 s
                             "thinkingConfig": {"thinkingLevel": "LOW"}},
    }
    if system:
        body["systemInstruction"] = {"parts": [{"text": system}]}
    # want_json is not passed on: Gemini 3.x JSON mode stalls; the prompts ask
    # for JSON and parse_json() pulls it out of the reply
    url = f"{base}/publishers/google/models/{model.removeprefix('google/')}:generateContent"
    async with httpx.AsyncClient(timeout=45) as client:
        r = await client.post(url, json=body, headers={"x-goog-api-key": key})
    if r.status_code != 200:
        raise RuntimeError(f"Vertex {r.status_code}: {r.text[:300]}")
    parts = r.json()["candidates"][0].get("content", {}).get("parts", [])
    return "".join(p.get("text", "") for p in parts if not p.get("thought")).strip()
