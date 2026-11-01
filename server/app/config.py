"""Runtime configuration.

Keys come from server/.env by default. The web app's Settings panel can override
them per request (headers on HTTP, the `start` message on WebSockets), so keys can
be swapped without restarting the server or committing anything.
"""

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

GNANI_BASE = os.getenv("GNANI_BASE", "https://api.vachana.ai")
GNANI_WS_BASE = GNANI_BASE.replace("https://", "wss://").replace("http://", "ws://")

# language code used by the app -> Gnani codes and default voices
# REST accepts a list of locale hints; realtime takes exactly one locale.
LANGS = {
    "hi": {"stt": "hi-IN,en-IN", "stream": "hi-IN", "tts": "hi-IN", "name": "हिंदी"},
    "ta": {"stt": "ta-IN,en-IN", "stream": "ta-IN", "tts": "ta-IN", "name": "தமிழ்"},
    "en": {"stt": "en-IN", "stream": "en-IN", "tts": "en-IN", "name": "English"},
}

# "transcribe" keeps English words in Latin script and writes numbers as digits,
# so "section 438 CrPC" stays matchable ("codemix" spells numbers out in words).
STT_FORMAT = "transcribe"

VOICES = {
    "sahay": os.getenv("VOICE_SAHAY", "Lakshmi"),
    "judge": os.getenv("VOICE_JUDGE", "Prakash"),
    "opponent": os.getenv("VOICE_OPPONENT", "Devansh"),
}


@dataclass
class Keys:
    gnani_key: str
    llm_base: str
    llm_key: str
    llm_model: str

    @property
    def has_gnani(self) -> bool:
        return bool(self.gnani_key)

    @property
    def has_llm(self) -> bool:
        return bool(self.llm_base and self.llm_model)


def resolve_keys(overrides: dict | None = None) -> Keys:
    o = {k.lower(): v for k, v in (overrides or {}).items() if v}
    return Keys(
        gnani_key=o.get("x-gnani-key") or os.getenv("GNANI_API_KEY", ""),
        llm_base=(o.get("x-llm-base") or os.getenv("LLM_BASE_URL", "")).rstrip("/"),
        llm_key=o.get("x-llm-key") or os.getenv("LLM_API_KEY", ""),
        llm_model=o.get("x-llm-model") or os.getenv("LLM_MODEL", ""),
    )
