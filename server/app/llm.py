"""OpenAI-compatible chat client.

Point it at Gnani Evon served by vLLM/SGLang (`vllm serve gnani/gnani-evon-v3.3-30B-A3B --served-model-name evon ...`),
or any OpenAI-compatible provider while Evon is not hosted yet.
"""

import json
import re

import httpx

from .config import Keys


class NoLLM(Exception):
    pass


async def chat(keys: Keys, messages: list[dict], *, max_tokens: int = 300,
               temperature: float = 0.5, want_json: bool = False) -> str:
    if not keys.has_llm:
        raise NoLLM()
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
