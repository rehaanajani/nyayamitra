"""Chat client for Gnani Evon.

Two ways to reach it, first match wins:
1. LLM_BASE_URL: any OpenAI-compatible server running Evon, e.g. llama.cpp
   on Kaggle's free T4s (deploy/kaggle-evon.ipynb) or vLLM on a rented GPU.
2. HF_TOKEN: Evon on the free Hugging Face Space (see evon_space.py).
If one is unreachable (a Kaggle session ended, the Space is out of quota),
the next takes over, then BACKUP_LLM_* (e.g. Gemini) as the last resort.
"""

import json
import re

import httpx

from . import evon_space
from .config import Keys


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
    if keys.hf_token:
        routes.append(lambda: _space_chat(keys.hf_token, messages, max_tokens))
    if keys.fb_base and keys.fb_model:
        routes.append(lambda: _openai_chat(keys.fb_base, keys.fb_key, keys.fb_model,
                                           messages, max_tokens, temperature, want_json))
    for i, route in enumerate(routes):
        try:
            return await route()
        except Exception:
            if i == len(routes) - 1:
                raise
    raise NoLLM()


async def _space_chat(token: str, messages: list[dict], max_tokens: int) -> str:
    out = await evon_space.chat(token, messages, max_tokens)
    return re.sub(r"<think>.*?</think>", "", out, flags=re.S).strip()


async def _openai_chat(base: str, key: str, model: str, messages: list[dict], max_tokens: int,
                       temperature: float, want_json: bool) -> str:
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
