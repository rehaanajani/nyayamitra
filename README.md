<div align="center">

# न्यायमित्र · Nyayamitra

**A friend in court, whichever side of it you're on.**

Voice legal help for people who can't afford a lawyer, and courtroom practice for the lawyers who'll stand up for them, in Hindi, Tamil and English.
Built on Gnani AI's **Prisma** (speech to text), **Timbre** (text to speech) and **Evon** (reasoning).

`#GnaniAI` `#GreatIndianAIInternshipChallenge`

</div>

---

## Two doors, one case

| | सहाय · Sahāya | अभ्यास · Abhyāsa |
|---|---|---|
| **For** | Anyone facing a legal problem | Law students and junior advocates |
| **You say** | *"Boss ne 3 mahine se salary nahi di"* | *"My Lord, under Section 438 CrPC…"* |
| **It does** | Asks one question at a time, then gives a **मार्ग (path) card**: where to go, what to carry, the deadline, the cost, free legal aid, and drafts your **लेख (letter)** | A district bench that **cuts you off** for repealed sections or long speeches, opposing counsel that rebuts, and a **निर्णय (verdict)** scorecard |
| **Bridge** | "Practise this hearing" turns the citizen's problem into a practice matter | "Bring your own case" builds a hearing from a client's story or an FIR |

## Why it's built this way

- **The law comes from a checked book, not the model's memory.** The LLM only classifies the problem, pulls facts out of messy speech and phrases questions. Routes, sections, deadlines and helplines come from [`server/app/knowledge`](server/app/knowledge).
- **Repealed citations are caught deterministically.** Cite CrPC 438 and the bench corrects you to BNSS 482 every time ([`statutes.json`](server/app/knowledge/statutes.json)).
- **Voice is full duplex.** Talk over the AI and it stops. Ramble for 45 seconds or cite a repealed section and the judge talks over you.
- **Language of the court.** Lower courts run in Hindi, Tamil and everything in between. Prisma v3 hears code-mixed speech (`hi-IN,en-IN`, `format=codemix`) and Timbre v3 answers in it.

## Architecture

```
Browser (React + Vite)
  mic ─ AudioWorklet 16 kHz PCM, 1024-byte frames ─▶ /ws/stt ─▶ Prisma v3 realtime
  speaker ◀─ WAV per sentence ◀─ /api/tts ◀─ Timbre v3
  turns ─▶ /api/sahay/* , /api/abhyas/* ─▶ FastAPI ─▶ OpenAI-compatible LLM (Evon on vLLM)
                                              └─▶ knowledge/ (routes, statutes, cases)
```

## Run it

```bash
# backend
cd server
uv venv --python 3.12 .venv && uv pip install --python .venv/bin/python fastapi "uvicorn[standard]" httpx websockets python-dotenv python-multipart
cp .env.example .env   # add keys here, or later in the app's Keys panel
.venv/bin/uvicorn app.main:app --reload --port 8000

# frontend (another terminal)
cd web && npm install && npm run dev   # http://localhost:5173
```

Everything works by typing with no keys at all (rule-based fallbacks). Add a **Gnani key** for voice and an **LLM endpoint** for natural conversation, either in `server/.env` or in the app's **Keys** panel (stored in your browser only).

### Serving Evon

```bash
vllm serve gnani/gnani-evon-v3.3 --max-model-len 131072 --trust-remote-code \
  --enable-auto-tool-choice --tool-call-parser qwen3_coder --reasoning-parser nano_v3
```

Then set the LLM base URL to `http://<host>:8000/v1` and the model to `gnani/gnani-evon-v3.3`. Any OpenAI-compatible endpoint works as a stand-in.

## Status

Legal routes are marked `reviewed: false` until checked by a law faculty member or advocate. Practice matters are synthetic. **Nyayamitra gives legal information, not legal advice.** In danger, call 112. Free legal aid: NALSA 15100.

## License

MIT © Rehaan Ajani
