"""अभ्यास: courtroom practice against an AI bench that interrupts.

Repealed-law citations (CrPC/IPC/Evidence Act) are caught deterministically from
knowledge/statutes.json, so the bench's corrections are always right. The LLM
plays the judge and the opponent and writes the debrief.
"""

import json
import os
import re
import uuid

from . import llm
from .config import Keys, lang_info, speech_style
from .hindi import to_digits

_dir = os.path.join(os.path.dirname(__file__), "knowledge")
with open(os.path.join(_dir, "cases.json"), encoding="utf-8") as f:
    CASES = {c["id"]: c for c in json.load(f)["cases"]}
with open(os.path.join(_dir, "statutes.json"), encoding="utf-8") as f:
    STATUTE_MAP = json.load(f)["map"]

CUSTOM_CASES: dict[str, dict] = {}

FILLERS = {
    "en": ["umm", "uh", "basically", "like", "you know", "actually", "so yeah"],
    "hi": ["matlab", "मतलब", "woh", "वो", "basically", "actually", "umm", "toh", "तो"],
    "ta": ["vandhu", "வந்து", "adhu", "அது", "basically", "actually", "umm"],
}

OPENING = {
    "hi": "हाँ counsel, बोलिए। समय कम है, सीधे मुद्दे पर आइए।",
    "ta": "சரி counsel, சொல்லுங்கள். நேரம் குறைவு, நேரடியாக விஷயத்துக்கு வாருங்கள்.",
    "en": "Yes, counsel. Go ahead, and please come straight to the point.",
}

_OLD_RE = re.compile(
    r"\b(crpc|cr\.?\s*p\.?\s*c\.?|ipc|i\.?\s*p\.?\s*c\.?|evidence act|सीआरपीसी|आईपीसी)\b",
    re.I,
)


def list_cases() -> list[dict]:
    return [_public(c) for c in list(CASES.values()) + list(CUSTOM_CASES.values())]


ROUNDS = 5  # like the original Supreme: five submissions, then the verdict


def get_case(case_id: str, side: str | None = None) -> dict | None:
    case = CASES.get(case_id) or CUSTOM_CASES.get(case_id)
    if not case:
        return None
    if "sides" not in case:
        return case | {"their_args": case.get("opponent_points", [])}
    # landmark cases: the user argues one side, the AI argues the other
    mine = side if side in ("petitioner", "respondent") else "petitioner"
    theirs = "respondent" if mine == "petitioner" else "petitioner"
    me, them = case["sides"][mine], case["sides"][theirs]
    return case | {
        "side": mine,
        "you_are": f"Counsel for the {mine}, {me['name']} ({me['position']})",
        "opponent": f"Senior counsel for the {theirs}, {them['name']}",
        "my_args": me["key_args"],
        "their_args": them["key_args"],
    }


def _public(c: dict) -> dict:
    keys = ("id", "title", "court", "language", "stage", "you_are", "facts", "bench_focus", "opponent",
            "kind", "year", "summary", "articles", "sides", "historic")
    return {k: c[k] for k in keys if k in c} | {"custom": c["id"] in CUSTOM_CASES, "rounds": ROUNDS}


def opening(lang: str) -> str:
    return OPENING.get(lang, OPENING["en"])


def find_old_citations(text: str) -> list[dict]:
    """Return repealed sections cited in `text`, with their replacements."""
    norm = re.sub(r"[.\s]+", " ", to_digits(text).lower())
    norm = norm.replace("सीआरपीसी", "crpc").replace("आईपीसी", "ipc").replace("cr p c", "crpc").replace("i p c", "ipc")
    hits = []
    for m in STATUTE_MAP:
        act, sec = m["old"].rsplit(" ", 1)
        act_l = act.lower()
        sec_l = sec.lower()
        # allow a couple of joining words: "IPC की section 498A", "438 of the CrPC"
        gap = r"(?:\s*\S+){0,2}?\s*"
        patterns = [
            rf"\b{act_l}{gap}(?:section|sec)?\s*{sec_l}(?![\d])",
            rf"(?<![\d]){sec_l}{gap}{act_l}\b",
        ]
        if any(re.search(p, norm) for p in patterns):
            hits.append(m)
    return hits


def correction(hits: list[dict], lang: str) -> str:
    h = hits[0]
    old, new, topic = h["old"], h["new"], h["topic"]
    lines = {
        "hi": f"रुकिए counsel। {old}? वो अब लागू नहीं है। एक जुलाई दो हज़ार चौबीस से {topic} के लिए {new} है। सही धारा से दोबारा बोलिए।",
        "ta": f"நில்லுங்கள் counsel. {old}? அது இப்போது செல்லாது. 2024 ஜூலை முதல் {topic} க்கு {new} தான். சரியான பிரிவுடன் மீண்டும் சொல்லுங்கள்.",
        "en": f"Stop there, counsel. {old}? That has been repealed. Since July 2024, {topic} is under {new}. Restate it with the correct section.",
    }
    return lines.get(lang) or lines["en"]


def interject(lang: str, partial: str, seconds: float, case_id: str | None = None) -> dict | None:
    """Called while the user is still speaking. Returns a bench interruption or None."""
    case = get_case(case_id) if case_id else None
    # historic matters were argued under the IPC/CrPC, so those citations are correct there
    hits = [] if case and case.get("historic") else find_old_citations(partial)
    if hits:
        return {"speaker": "judge", "text": correction(hits, lang), "flags": [{"type": "old_citation", **hits[0]}]}
    if seconds > 45:
        lines = {
            "hi": "Counsel, यह भाषण नहीं है। एक लाइन में बताइए, आपका मुख्य तर्क क्या है?",
            "ta": "Counsel, இது பேச்சு அல்ல. ஒரே வரியில் உங்கள் முக்கிய வாதம் என்ன?",
            "en": "Counsel, this is not a speech. In one line, what is your main submission?",
        }
        return {"speaker": "judge", "text": lines.get(lang) or lines["en"],
                "flags": [{"type": "monologue", "seconds": round(seconds)}]}
    return None


def _fallback_bench(case: dict, lang: str, turn_no: int, speaker: str = "judge") -> dict:
    """Rule-based turn for when no model is available (or the free quota is spent)."""
    if speaker == "opponent" and case.get("their_args"):
        arg = case["their_args"][(turn_no // 2) % len(case["their_args"])]
        return {"speaker": "opponent", "text": f"My Lords, with respect to my learned friend: {arg}", "flags": []}
    focus = case["bench_focus"][turn_no % len(case["bench_focus"])].rstrip("?")
    text = {
        "hi": f"ठीक है। लेकिन यह बताइए: {focus}?",
        "ta": f"சரி. ஆனால் இதைச் சொல்லுங்கள்: {focus}?",
        "en": f"All right. But tell me this: {focus}?",
    }.get(lang) or f"All right. But tell me this: {focus}?"
    return {"speaker": "judge", "text": text, "flags": []}


async def bench_turn(keys: Keys, case_id: str, lang: str, temperament: str,
                     history: list[dict], text: str, side: str | None = None) -> dict:
    case = get_case(case_id, side)
    if not case:
        raise ValueError("unknown case")
    historic = case.get("historic", False)
    hits = [] if historic else find_old_citations(text)
    if hits:
        return {"speaker": "judge", "text": correction(hits, lang), "flags": [{"type": "old_citation", **h} for h in hits]}

    user_turns = sum(1 for h in history if h["role"] == "user")
    if "sides" in case:
        # Supreme-style: opposing counsel answers first, then the bench presses
        speaker = "opponent" if user_turns % 2 == 0 else "judge"
    else:
        # district court: the bench leads, opposing counsel rebuts every third turn
        speaker = "opponent" if user_turns % 3 == 2 else "judge"
    tone = {
        "strict": "impatient and sharp; interrupts weak points; asks for authority",
        "fair": "firm but fair; probes the weakest point",
        "kind": "patient, like a senior guiding a junior, but still tests the argument",
    }.get(temperament, "firm but fair; probes the weakest point")
    role = (
        f"You are the presiding officer in {case['court']}. Temperament: {tone}."
        if speaker == "judge" else
        f"You are {case['opponent']} in {case['court']}, opposing the user. Rebut their last point using the case facts."
        + (f" Your side's strongest arguments: {json.dumps(case['their_args'], ensure_ascii=False)}" if case.get("their_args") else "")
    )
    law_rule = (
        "This is a historic case: argue it under the law as it stood before judgment (IPC, CrPC and older citations are correct here). "
        "Stay strictly neutral and respectful about religion, community and identity; argue law and evidence only."
        if historic else
        "Use only BNS, BNSS and BSA section numbers (the IPC, CrPC and Evidence Act are repealed)."
    )
    court_style = "the Supreme Court of India" if "sides" in case else "a real Indian district court"
    system = f"""{role}
Matter: {case['title']}. Stage: {case['stage']}.
The user is: {case['you_are']}.
Case facts: {json.dumps(case['facts'], ensure_ascii=False)}
Points the bench cares about: {json.dumps(case['bench_focus'], ensure_ascii=False)}

Speak in {speech_style(lang)}. If that language is not Hindi, Tamil or English, still speak it the way a local district court would.
Reply with ONE or TWO short spoken sentences, like {court_style}: no greetings, no lists, no markdown.
{"Ask exactly one pointed question that tests the user's last submission." if speaker == "judge" else "End by pointing at the gap in their argument."}
Address the advocate respectfully as "counsel" (in Hindi use आप, never तुम or तू). {law_rule} Never invent case names; if you need authority, ask the user for it."""
    msgs = [{"role": "system", "content": system}]
    for h in history[-10:]:
        msgs.append({"role": "user" if h["role"] == "user" else "assistant", "content": h["text"]})
    script = "English" if lang == "en" else f"{lang_info(lang)['english']} in its own script, with English legal terms"
    msgs.append({"role": "user", "content": f"{text}\n\n[Reply in {script}. One or two sentences. Call the advocate 'counsel'.]"})
    try:
        out = await llm.chat(keys, msgs, max_tokens=160, temperature=0.6)
        if out:
            return {"speaker": speaker, "text": out, "flags": []}
    except Exception:  # no model, quota spent or timeout: keep the hearing going
        pass
    return _fallback_bench(case, lang, user_turns, speaker)


def _count_fillers(lang: str, texts: list[str]) -> dict:
    joined = " " + " ".join(texts).lower() + " "
    counts = {}
    for f in FILLERS.get(lang, FILLERS["en"]):
        n = len(re.findall(rf"(?<!\w){re.escape(f.lower())}(?!\w)", joined))
        if n:
            counts[f] = n
    return counts


async def debrief(keys: Keys, case_id: str, lang: str, history: list[dict], side: str | None = None) -> dict:
    case = get_case(case_id, side) or {}
    user_texts = [h["text"] for h in history if h["role"] == "user"]
    old = []
    if not case.get("historic"):
        for t in user_texts:
            old += find_old_citations(t)
    fillers = _count_fillers(lang, user_texts)
    words = sum(len(t.split()) for t in user_texts)

    result = {
        "scores": None,
        "notes": [],
        "old_citations": old,
        "fillers": fillers,
        "turns": len(user_texts),
        "words": words,
    }
    if not user_texts:
        return result
    transcript = "\n".join(f"{h['role'].upper()}: {h['text']}" for h in history)
    try:
        out = await llm.chat(keys, [
            {"role": "system", "content": "You are a senior advocate reviewing a junior's oral argument in an Indian district court. Be specific and honest. Return ONLY JSON."},
            {"role": "user", "content": f"""Matter: {case.get('title')}. The junior was: {case.get('you_are')}.
Key facts: {json.dumps(case.get('facts', []), ensure_ascii=False)}
Transcript:
{transcript}

Score 0-100 on: law (correct provisions and legal tests), facts (used the record accurately), bench_handling (answered the judge's actual question), delivery (clear, concise, confident).
Give 3 notes in English: what worked, the biggest miss, and one line they should have said.
JSON: {{"scores": {{"law": n, "facts": n, "bench_handling": n, "delivery": n}}, "notes": ["...", "...", "..."], "verdict": "one sentence the judge might say at the end"}}"""},
        ], max_tokens=500, temperature=0.2, want_json=True)
        data = llm.parse_json(out) or {}
        if isinstance(data.get("scores"), dict):
            result["scores"] = {k: max(0, min(100, int(v))) for k, v in data["scores"].items() if isinstance(v, (int, float))}
        result["notes"] = [str(n) for n in data.get("notes", [])][:3]
        result["verdict"] = data.get("verdict", "")
    except Exception:
        # heuristic scores keep the screen useful without a model
        base = min(80, 35 + words // 8)
        result["scores"] = {
            "law": max(10, base - 15 * len(old)),
            "facts": base,
            "bench_handling": base - 5,
            "delivery": max(10, base - 3 * sum(fillers.values())),
        }
        result["notes"] = ["The written review could not be prepared this time. Your scores above still stand; try another hearing for a full review."]
    return result


async def case_from_text(keys: Keys, text: str, lang: str) -> dict:
    """Turn a pasted story, FIR text or judgment summary into a practice case."""
    out = await llm.chat(keys, [
        {"role": "system", "content": "You convert a legal problem into a practice hearing for an Indian district or consumer court. Use BNS/BNSS/BSA, never IPC/CrPC. Return ONLY JSON."},
        {"role": "user", "content": f"""Source:
{text[:6000]}

Return JSON with keys: title, court, stage, you_are, opponent, facts (5 short strings), bench_focus (5 short strings: questions a judge would press on).
Replace real names of private people with invented ones."""},
    ], max_tokens=700, temperature=0.3, want_json=True)
    data = llm.parse_json(out)
    if not data or not data.get("facts"):
        raise ValueError("could not build a case from that text")
    case = {
        "id": "custom-" + uuid.uuid4().hex[:8],
        "title": str(data.get("title", "Custom matter")),
        "court": str(data.get("court", "District Court")),
        "language": lang,
        "stage": str(data.get("stage", "Hearing")),
        "you_are": str(data.get("you_are", "Counsel")),
        "opponent": str(data.get("opponent", "Opposing counsel")),
        "facts": [str(x) for x in data["facts"]][:8],
        "bench_focus": [str(x) for x in data.get("bench_focus", [])][:8] or ["What is your strongest point?"],
    }
    CUSTOM_CASES[case["id"]] = case
    return _public(case)


AXES = ("law", "facts", "bench_handling", "delivery")


def _heuristic_scores(text: str, case: dict, round_no: int) -> tuple[dict, dict]:
    """Rough scores when no model is available: length, citations and use of the record."""
    t = text.lower()
    words = len(text.split())
    cites = len(re.findall(r"\b(section|article|act|bns|bnss|bsa|ni act|v\.|vs\.?)\b", t))
    record = sum(1 for f in case.get("facts", []) + case.get("my_args", []) for w in re.findall(r"[a-z]{6,}", f.lower())[:4] if w in t)
    base = 38 + min(30, words // 3)
    you = {
        "law": min(95, base + 6 * cites),
        "facts": min(95, base + 4 * record),
        "bench_handling": min(95, base + (8 if "?" not in text and words > 12 else 0)),
        "delivery": min(95, base + (6 if 15 <= words <= 90 else -6)),
    }
    them = {k: 62 + ((round_no * 7 + i * 5) % 14) for i, k in enumerate(AXES)}
    return you, them


async def round_turn(keys: Keys, case_id: str, side: str | None, lang: str, temperament: str,
                     history: list[dict], text: str, round_no: int,
                     stage: str = "both", opponent: str = "") -> dict:
    """One Supreme-style round: your submission, opposing counsel's reply, then the bench.

    stage="opponent" returns counsel's reply alone so it can be spoken at once;
    stage="bench" then scores it (pass the reply as `opponent`) while counsel talks."""
    case = get_case(case_id, side)
    if not case:
        raise ValueError("unknown case")
    if not case.get("historic"):
        hits = find_old_citations(text)
        if hits:
            # the bench stops you; the round does not count until you restate it
            return {"correction": {"speaker": "judge", "text": correction(hits, lang), "flags": [{"type": "old_citation", **h} for h in hits]}}

    hist = history + [{"role": "user", "text": text}]
    if stage == "bench":
        hist = hist + [{"role": "opponent", "text": opponent}]
        return {"bench": await bench_remark(keys, case, lang, temperament, hist, text, opponent, round_no)}
    opp = await bench_turn_as(keys, case, lang, temperament, hist, "opponent", round_no)
    if stage == "opponent":
        return {"opponent": {"speaker": "opponent", "text": opp}}
    hist = hist + [{"role": "opponent", "text": opp}]
    bench = await bench_remark(keys, case, lang, temperament, hist, text, opp, round_no)
    return {"opponent": {"speaker": "opponent", "text": opp}, "bench": bench}


async def bench_turn_as(keys: Keys, case: dict, lang: str, temperament: str, history: list[dict],
                        speaker: str, round_no: int) -> str:
    their = case.get("their_args") or []
    historic = case.get("historic", False)
    law_rule = ("This is a historic case: argue it under the law as it stood before judgment. Stay neutral and respectful about religion, community and identity."
                if historic else "Use only BNS, BNSS and BSA section numbers.")
    system = f"""You are {case['opponent']} in {case['court']}, arguing against the user in round {round_no} of {ROUNDS}.
Matter: {case['title']}. The user is: {case['you_are']}.
Facts: {json.dumps(case['facts'], ensure_ascii=False)}
Your side's strongest points: {json.dumps(their, ensure_ascii=False)}
Rebut the user's latest submission in at most 2 short spoken sentences, including one fresh point for your side. Address the bench as "My Lord" (or "My Lords" in the Supreme Court). Speak in {speech_style(lang)}. {law_rule} No lists, no markdown, never invent case names."""
    msgs = [{"role": "system", "content": system}]
    for h in history[-8:]:
        msgs.append({"role": "user" if h["role"] == "user" else "assistant", "content": h["text"]})
    try:
        # kept short, like Supreme: a quick reply feels live, a long one feels like a wait
        out = await llm.chat(keys, msgs, max_tokens=110, temperature=0.6, fast=True)
        if out:
            return out
    except Exception:
        pass
    if their:
        arg = their[(round_no - 1) % len(their)]
        lead = "My Lords" if "sides" in case else "My Lord"
        return f"{lead}, with respect to my learned friend: {arg}"
    return "My Lord, my learned friend has not shown anything on record to support that."


async def bench_remark(keys: Keys, case: dict, lang: str, temperament: str, history: list[dict],
                       you_text: str, opp_text: str, round_no: int) -> dict:
    focus = case["bench_focus"]
    try:
        out = await llm.chat(keys, [
            {"role": "system", "content": f"You are the presiding judge in {case['court']} ({temperament} temperament). Score this round fairly and say one short remark to counsel. Return ONLY JSON."},
            {"role": "user", "content": f"""Matter: {case['title']}. Round {round_no} of {ROUNDS}.
The user ({case['you_are']}) said: {you_text}
Opposing counsel ({case['opponent']}) said: {opp_text}
Points the bench cares about: {json.dumps(focus, ensure_ascii=False)}
Score both 0-100 on law, facts, bench_handling, delivery. The remark: one or two spoken sentences in {speech_style(lang)}, ending with the question the bench wants answered next.
JSON: {{"remark": "...", "you": {{"law": n, "facts": n, "bench_handling": n, "delivery": n}}, "them": {{"law": n, "facts": n, "bench_handling": n, "delivery": n}}}}"""},
        ], max_tokens=320, temperature=0.3, want_json=True)
        data = llm.parse_json(out) or {}
        you, them = data.get("you"), data.get("them")
        if isinstance(you, dict) and isinstance(them, dict) and data.get("remark"):
            clean = lambda d: {k: max(0, min(100, int(d.get(k, 50)))) for k in AXES}
            return {"speaker": "judge", "text": str(data["remark"]), "scores": {"you": clean(you), "them": clean(them)}}
    except Exception:
        pass
    you, them = _heuristic_scores(you_text, case, round_no)
    q = focus[round_no % len(focus)].rstrip("?")
    remark = {
        "hi": f"ठीक है। अगले round में यह साफ़ कीजिए: {q}?",
        "ta": f"சரி. அடுத்த round-ல் இதைத் தெளிவுபடுத்துங்கள்: {q}?",
    }.get(lang) or f"Noted. In the next round, address this: {q}?"
    return {"speaker": "judge", "text": remark, "scores": {"you": you, "them": them}}
