"""Gnani speech APIs: Prisma (speech to text) and Timbre (text to speech).

Docs: https://docs.gnani.ai — base URL api.vachana.ai, auth header X-API-Key-ID.
"""

import httpx

from .config import GNANI_BASE, GNANI_WS_BASE, LANGS, STT_FORMAT

STT_MODEL = "prisma-v3.0"
TTS_MODEL = "timbre-v3.0"


class GnaniError(Exception):
    pass


async def synthesize(text: str, lang: str, voice: str, key: str, sample_rate: int = 24000) -> bytes:
    """Timbre REST inference -> WAV bytes."""
    body = {
        "text": text,
        "model": TTS_MODEL,
        "voice": voice,
        "language": LANGS.get(lang, LANGS["en"])["tts"],
        "speed": 1.0,
        "audio_config": {
            "sample_rate": sample_rate,
            "num_channels": 1,
            "sample_width": 2,
            "encoding": "linear_pcm",
            "container": "wav",
        },
    }
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            f"{GNANI_BASE}/api/v1/tts/inference",
            json=body,
            headers={"X-API-Key-ID": key},
        )
    if r.status_code != 200:
        raise GnaniError(f"Timbre {r.status_code}: {r.text[:300]}")
    return r.content


async def transcribe_file(audio: bytes, filename: str, lang: str, key: str) -> dict:
    """Prisma REST, clips up to 30 s."""
    data = {
        "model": STT_MODEL,
        "language_code": LANGS.get(lang, LANGS["en"])["stt"],
        "format": STT_FORMAT,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            f"{GNANI_BASE}/stt/v3",
            data=data,
            files={"audio_file": (filename, audio)},
            headers={"X-API-Key-ID": key},
        )
    if r.status_code != 200:
        raise GnaniError(f"Prisma {r.status_code}: {r.text[:300]}")
    return r.json()


def stream_url() -> str:
    return f"{GNANI_WS_BASE}/stt/v3/stream"


def stream_headers(lang: str, key: str, sample_rate: int = 16000) -> dict:
    """Prisma realtime config is sent as upgrade headers.

    Audio must be raw PCM s16le mono in exact 1024-byte frames at real-time pace.
    `x-partials` streams interim text every ~450 ms so the bench can cut in mid-sentence.
    """
    return {
        "x-api-key-id": key,
        "model": STT_MODEL,
        "language_code": LANGS.get(lang, LANGS["en"])["stream"],
        "format": STT_FORMAT,
        "x-partials": "true",
        "x-sample-rate": str(sample_rate),
        "x-vad-threshold": "0.7",
        "x-min-silence-ms": "600",
        "x-min-speech-ms": "200" if sample_rate == 8000 else "100",
        "x-idle-timeout-sec": "120",
    }
