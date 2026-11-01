import asyncio
import json
import os

import websockets
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import abhyas, gnani, llm, sahay
from .config import LANGS, VOICES, resolve_keys

app = FastAPI(title="Nyayamitra")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


def keys_from(request: Request):
    return resolve_keys(dict(request.headers))


# ---------- status ----------

@app.get("/api/status")
async def status(request: Request):
    k = keys_from(request)
    return {
        "gnani": k.has_gnani,
        "llm": k.has_llm,
        "llm_model": k.llm_model,
        "evon": "evon" in k.llm_model.lower(),
        "languages": {c: v["name"] for c, v in LANGS.items()},
    }


@app.post("/api/check")
async def check(request: Request):
    """Settings panel 'Test' button: tries each service with the given keys."""
    k = keys_from(request)
    out = {"gnani": None, "llm": None}
    if k.has_gnani:
        try:
            wav = await gnani.synthesize("Namaste.", "hi", VOICES["sahay"], k.gnani_key)
            out["gnani"] = f"ok ({len(wav) // 1024} KB audio)"
        except Exception as e:
            out["gnani"] = f"error: {e}"
    if k.has_llm:
        try:
            r = await llm.chat(k, [{"role": "user", "content": "Reply with exactly: OK"}], max_tokens=5)
            out["llm"] = f"ok ({r[:20]})"
        except Exception as e:
            out["llm"] = f"error: {e}"
    return out


# ---------- speech ----------

class TTSReq(BaseModel):
    text: str
    lang: str = "hi"
    role: str = "sahay"


@app.post("/api/tts")
async def tts(req: TTSReq, request: Request):
    k = keys_from(request)
    if not k.has_gnani:
        raise HTTPException(400, "Add a Gnani API key in Settings")
    try:
        wav = await gnani.synthesize(req.text[:900], req.lang, VOICES.get(req.role, VOICES["sahay"]), k.gnani_key)
    except gnani.GnaniError as e:
        raise HTTPException(502, str(e))
    return Response(wav, media_type="audio/wav")


@app.post("/api/stt")
async def stt(request: Request, audio: UploadFile = File(...), lang: str = Form("hi")):
    k = keys_from(request)
    if not k.has_gnani:
        raise HTTPException(400, "Add a Gnani API key in Settings")
    try:
        return await gnani.transcribe_file(await audio.read(), audio.filename or "clip.wav", lang, k.gnani_key)
    except gnani.GnaniError as e:
        raise HTTPException(502, str(e))


@app.websocket("/ws/stt")
async def stt_stream(ws: WebSocket):
    """Proxy browser mic PCM to Prisma realtime. Browsers can't set the auth
    headers Prisma needs, and the key must not live in the page anyway.

    Client: first a JSON text frame {"type":"start","lang":"hi","sample_rate":16000,"keys":{...}},
    then binary 1024-byte PCM s16le frames; {"type":"commit"} closes the current utterance.
    """
    await ws.accept()
    try:
        start = json.loads(await ws.receive_text())
    except Exception:
        await ws.close(1008)
        return
    k = resolve_keys(start.get("keys") or {})
    if not k.has_gnani:
        await ws.send_json({"type": "error", "message": "Add a Gnani API key in Settings"})
        await ws.close()
        return
    lang = start.get("lang", "hi")
    rate = int(start.get("sample_rate", 16000))
    try:
        upstream = await websockets.connect(
            gnani.stream_url(),
            additional_headers=gnani.stream_headers(lang, k.gnani_key, rate),
            max_size=None,
        )
    except Exception as e:
        await ws.send_json({"type": "error", "message": f"Prisma connect failed: {e}"})
        await ws.close()
        return

    async def up():
        while True:
            msg = await ws.receive()
            if msg.get("type") == "websocket.disconnect":
                break
            if msg.get("bytes") is not None:
                await upstream.send(msg["bytes"])
            elif msg.get("text"):
                await upstream.send(msg["text"])

    async def down():
        async for m in upstream:
            if isinstance(m, str):
                await ws.send_text(m)

    tasks = [asyncio.create_task(up()), asyncio.create_task(down())]
    try:
        done, pending = await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)
        for t in pending:
            t.cancel()
        for t in done:
            exc = t.exception()
            if exc and not isinstance(exc, (WebSocketDisconnect, websockets.ConnectionClosed)):
                try:
                    await ws.send_json({"type": "error", "message": str(exc)[:300]})
                except Exception:
                    pass
    finally:
        await upstream.close()
        try:
            await ws.close()
        except Exception:
            pass


# ---------- सहाय ----------

class SahayTurn(BaseModel):
    lang: str = "hi"
    text: str
    state: dict = {}
    history: list[dict] = []


@app.get("/api/sahay/greeting")
async def sahay_greeting(lang: str = "hi"):
    return {"reply": sahay.greeting(lang)}


@app.post("/api/sahay/turn")
async def sahay_turn(req: SahayTurn, request: Request):
    return await sahay.turn(keys_from(request), req.lang, req.state, req.text, req.history)


class DraftReq(BaseModel):
    issue_id: str
    facts: dict = {}
    name: str = ""
    lang: str = "hi"


@app.post("/api/sahay/draft")
async def sahay_draft(req: DraftReq, request: Request):
    return await sahay.draft(keys_from(request), req.issue_id, req.facts, req.name, req.lang)


@app.get("/api/sahay/card/{issue_id}")
async def sahay_card(issue_id: str):
    if issue_id not in sahay.ISSUES:
        raise HTTPException(404)
    return sahay.build_card(issue_id, {})


# ---------- अभ्यास ----------

@app.get("/api/abhyas/cases")
async def cases():
    return abhyas.list_cases()


@app.get("/api/abhyas/opening")
async def abhyas_opening(lang: str = "hi"):
    return {"speaker": "judge", "text": abhyas.opening(lang)}


class BenchTurn(BaseModel):
    case_id: str
    lang: str = "hi"
    temperament: str = "fair"
    text: str
    history: list[dict] = []


@app.post("/api/abhyas/turn")
async def abhyas_turn(req: BenchTurn, request: Request):
    try:
        return await abhyas.bench_turn(keys_from(request), req.case_id, req.lang, req.temperament, req.history, req.text)
    except ValueError as e:
        raise HTTPException(404, str(e))


class Interject(BaseModel):
    lang: str = "hi"
    partial: str
    seconds: float = 0


@app.post("/api/abhyas/interject")
async def abhyas_interject(req: Interject):
    return {"interjection": abhyas.interject(req.lang, req.partial, req.seconds)}


class Debrief(BaseModel):
    case_id: str
    lang: str = "hi"
    history: list[dict] = []


@app.post("/api/abhyas/debrief")
async def abhyas_debrief(req: Debrief, request: Request):
    return await abhyas.debrief(keys_from(request), req.case_id, req.lang, req.history)


class CustomCase(BaseModel):
    text: str
    lang: str = "hi"


@app.post("/api/abhyas/custom")
async def abhyas_custom(req: CustomCase, request: Request):
    try:
        return await abhyas.case_from_text(keys_from(request), req.text, req.lang)
    except llm.NoLLM:
        raise HTTPException(400, "Connect an LLM in Settings to build a case from text")
    except ValueError as e:
        raise HTTPException(422, str(e))


# ---------- web app (production build) ----------

_dist = os.path.join(os.path.dirname(__file__), "..", "..", "web", "dist")
if os.path.isdir(_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(_dist, "assets")), name="assets")

    @app.get("/{path:path}")
    async def spa(path: str):
        f = os.path.join(_dist, path)
        if path and os.path.isfile(f):
            return FileResponse(f)
        return FileResponse(os.path.join(_dist, "index.html"))
