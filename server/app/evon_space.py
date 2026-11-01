"""Gnani Evon through a Hugging Face Space on free ZeroGPU.

Space: luminenio/gnani-evon-v3.3-chat (Evon v3.3, 4-bit GGUF via llama.cpp,
thinking off, replies capped at 512 tokens). It's a Gradio ChatInterface, so it
takes one message string, not an OpenAI messages list; we flatten the system
prompt and history into that string.

Each call spends the HF_TOKEN owner's free ZeroGPU quota and the Space serves
one request at a time, so callers must keep a fallback ready.
"""

import asyncio
import os
import threading

SPACE = os.getenv("EVON_SPACE", "luminenio/gnani-evon-v3.3-chat")
MAX_TOKENS = 512

_client = None
_api_name = None
_lock = threading.Lock()


def _connect(token: str):
    global _client, _api_name
    if _client is None:
        from gradio_client import Client  # imported lazily: heavy, and optional

        _client = Client(SPACE, token=token, verbose=False)
        endpoints = _client.view_api(print_info=False, return_format="dict") or {}
        named = list((endpoints.get("named_endpoints") or {}).keys())
        _api_name = "/chat" if "/chat" in named else (named[0] if named else "/chat")
    return _client


def _flatten(messages: list[dict]) -> str:
    system = "\n\n".join(m["content"] for m in messages if m["role"] == "system")
    turns = []
    for m in messages:
        if m["role"] == "user":
            turns.append(f"User: {m['content']}")
        elif m["role"] == "assistant":
            turns.append(f"Assistant: {m['content']}")
    return (
        f"Instructions:\n{system}\n\nConversation so far:\n" + "\n".join(turns)
        + "\n\nWrite only the Assistant's next reply, following the instructions exactly."
    )


def _predict(token: str, prompt: str, max_tokens: int) -> str:
    with _lock:  # the Space handles one request at a time
        client = _connect(token)
        try:
            out = client.predict(message=prompt, max_tokens=min(max_tokens, MAX_TOKENS), api_name=_api_name)
        except (TypeError, ValueError):
            # the slider may be named differently; fall back to the message only
            out = client.predict(prompt, api_name=_api_name)
    if isinstance(out, (list, tuple)):
        out = out[-1] if out else ""
    if isinstance(out, dict):
        out = out.get("content") or out.get("text") or ""
    return str(out or "").strip()


async def chat(token: str, messages: list[dict], max_tokens: int, timeout: float = 45) -> str:
    return await asyncio.wait_for(
        asyncio.to_thread(_predict, token, _flatten(messages), max_tokens), timeout
    )
