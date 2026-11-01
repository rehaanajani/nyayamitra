"""Runtime configuration. All keys come from server/.env (or the host's env vars)."""

import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

GNANI_BASE = os.getenv("GNANI_BASE", "https://api.vachana.ai")
GNANI_WS_BASE = GNANI_BASE.replace("https://", "wss://").replace("http://", "ws://")

# The same 17 languages as Zuraksha. Gnani Prisma and Timbre cover ten Indian
# locales; the rest are text-only (the LLM still reads and writes them).
# stt: REST hint list; stream: exactly one locale for realtime; tts: Timbre locale.
def _voice(loc: str) -> dict:
    return {"stt": f"{loc},en-IN" if loc != "en-IN" else loc, "stream": loc, "tts": loc}


LANGS = {
    "en": {"name": "English", "english": "English", **_voice("en-IN")},
    "hi": {"name": "हिन्दी", "english": "Hindi", **_voice("hi-IN")},
    "bn": {"name": "বাংলা", "english": "Bengali", **_voice("bn-IN")},
    "mr": {"name": "मराठी", "english": "Marathi", **_voice("mr-IN")},
    "te": {"name": "తెలుగు", "english": "Telugu", **_voice("te-IN")},
    "ta": {"name": "தமிழ்", "english": "Tamil", **_voice("ta-IN")},
    "gu": {"name": "ગુજરાતી", "english": "Gujarati", **_voice("gu-IN")},
    "ur": {"name": "اردو", "english": "Urdu"},
    "kn": {"name": "ಕನ್ನಡ", "english": "Kannada", **_voice("kn-IN")},
    "or": {"name": "ଓଡ଼ିଆ", "english": "Odia"},
    "ml": {"name": "മലയാളം", "english": "Malayalam", **_voice("ml-IN")},
    "pa": {"name": "ਪੰਜਾਬੀ", "english": "Punjabi", **_voice("pa-IN")},
    "as": {"name": "অসমীয়া", "english": "Assamese"},
    "ks": {"name": "کٲشُر", "english": "Kashmiri"},
    "sat": {"name": "ᱥᱟᱱᱛᱟᱲᱤ", "english": "Santali"},
    "mni": {"name": "ꯃꯤꯇꯩꯂꯣꯟ", "english": "Meitei (Manipuri)"},
    "sa": {"name": "संस्कृतम्", "english": "Sanskrit"},
}


def lang_info(lang: str) -> dict:
    return LANGS.get(lang, LANGS["en"])


def has_voice(lang: str) -> bool:
    return "tts" in lang_info(lang)


def speech_style(lang: str) -> str:
    """How the LLM should write a spoken reply in this language."""
    if lang == "en":
        return "simple Indian English"
    name = lang_info(lang)["english"]
    return (f"simple spoken {name} in its native script; keep common English words "
            "like FIR, notice, salary, UPI, bail, section in English")


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
    hf_token: str = ""
    # backup LLM (e.g. Gemini) used only when Evon is unreachable
    fb_base: str = ""
    fb_key: str = ""
    fb_model: str = ""

    @property
    def has_gnani(self) -> bool:
        return bool(self.gnani_key)

    @property
    def has_llm(self) -> bool:
        return bool(self.llm_base and self.llm_model) or bool(self.hf_token) or bool(self.fb_base and self.fb_model)

    @property
    def model_label(self) -> str:
        if self.llm_base and self.llm_model:
            return self.llm_model
        if self.hf_token:
            return "evon (Hugging Face Space)"
        return self.fb_model


def resolve_keys(_overrides: dict | None = None) -> Keys:
    # Overrides from requests are ignored on purpose: a public server must not
    # let callers point it at arbitrary LLM URLs.
    return Keys(
        gnani_key=os.getenv("GNANI_API_KEY", ""),
        llm_base=os.getenv("LLM_BASE_URL", "").rstrip("/"),
        llm_key=os.getenv("LLM_API_KEY", ""),
        llm_model=os.getenv("LLM_MODEL", ""),
        hf_token=os.getenv("HF_TOKEN", ""),
        fb_base=os.getenv("BACKUP_LLM_BASE_URL", "").rstrip("/"),
        fb_key=os.getenv("BACKUP_LLM_API_KEY", ""),
        fb_model=os.getenv("BACKUP_LLM_MODEL", ""),
    )
