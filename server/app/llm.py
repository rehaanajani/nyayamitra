"""Chat client for Gnani Evon.

Two ways to reach it, first match wins:
1. LLM_BASE_URL: any OpenAI-compatible server running Evon, e.g. llama.cpp
   on Kaggle's free T4s (deploy/kaggle-evon.ipynb) or vLLM on a rented GPU.
2. HF_TOKEN: Evon on the free Hugging Face Space (see evon_space.py).
If one is unreachable the next takes over: Kaggle Evon, then BACKUP_LLM_*
(Gemini), then the Evon Space.
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


async def chat(keys: Keys, messages: list[dict], *, max_tokens: int = 300,
               temperature: float = 0.5, want_json: bool = False) -> str:
    if not keys.has_llm:
        raise NoLLM()
    routes = []
    if keys.llm_base and keys.llm_model:
        routes.append(lambda: _openai_chat(keys.llm_base, keys.llm_key, keys.llm_model,
                                           messages, max_tokens, temperature, want_json))
    # the backup answers in seconds; the free Space can stall for most of a minute
    # once its daily quota is gone, so it goes last
    if keys.fb_base and keys.fb_model:
        routes.append(lambda: _openai_chat(keys.fb_base, keys.fb_key, keys.fb_model,
                                           messages, max_tokens, temperature, want_json))
    if keys.hf_token:
        routes.append(lambda: _space_chat(keys.hf_token, messages, max_tokens))
    for i, route in enumerate(routes):
        try:
            return await route()
        except Exception as e:
            log.warning("llm route %d failed: %s: %s", i, type(e).__name__, str(e)[:200])
            if i == len(routes) - 1:
                raise
    raise NoLLM()


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
