"""Chat client for Gnani Evon.

Two ways to reach it, first match wins:
1. LLM_BASE_URL: any OpenAI-compatible server running Evon, e.g. llama.cpp
   on Kaggle's free T4s (deploy/kaggle-evon.ipynb) or vLLM on a rented GPU.
2. HF_TOKEN: Evon on the free Hugging Face Space (see evon_space.py).
If the first is unreachable (a Kaggle session ended), the second takes over.
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
    if keys.llm_base and keys.llm_model:
        try:
            return await _openai_chat(keys, messages, max_tokens, temperature, want_json)
        except (httpx.HTTPError, RuntimeError):
            if not keys.hf_token:
                raise
    out = await evon_space.chat(keys.hf_token, messages, max_tokens)
    return re.sub(r"<think>.*?</think>", "", out, flags=re.S).strip()


async def _openai_chat(keys: Keys, messages: list[dict], max_tokens: int,
                       temperature: float, want_json: bool) -> str:
    body: dict = {
        "model": keys.llm_model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    if "evon" in keys.llm_model.lower():
        # Evon is a reasoning model; spoken replies need speed, not visible thinking
        body["chat_template_kwargs"] = {"enable_thinking": False}
    if want_json:
        body["response_format"] = {"type": "json_object"}
    headers = {"Authorization": f"Bearer {keys.llm_key}"} if keys.llm_key else {}
    async with httpx.AsyncClient(timeout=45) as client:
        r = await client.post(f"{keys.llm_base}/chat/completions", json=body, headers=headers)
        if r.status_code == 400 and want_json:
            # some servers reject response_format; the prompt already asks for JSON
            body.pop("response_format", None)
            r = await client.post(f"{keys.llm_base}/chat/completions", json=body, headers=headers)
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
