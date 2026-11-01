"""सहाय: the citizen helpline.

The LLM listens: it classifies the problem, pulls facts out of messy speech and
phrases the next question in the caller's language. The law shown on the path card
always comes from knowledge/routes.json, never from the model.
"""

import json
import os

from . import llm
from .config import Keys, lang_info, speech_style

with open(os.path.join(os.path.dirname(__file__), "knowledge", "routes.json"), encoding="utf-8") as f:
    ROUTES = json.load(f)

ISSUES = {i["id"]: i for i in ROUTES["issues"]}
HELPLINES = {h["id"]: h for h in ROUTES["helplines"]}

GREETING = {
    # beyond hi/ta/en these need a native speaker's review
    "hi": "नमस्ते, मैं सहाय हूँ। आराम से बताइए, आपके साथ क्या हुआ है?",
    "ta": "வணக்கம், நான் சகாய். என்ன நடந்தது என்று நிதானமாகச் சொல்லுங்கள்.",
    "en": "Hello, I'm Sahay. Take your time and tell me what happened.",
    "bn": "নমস্কার, আমি সহায়। কী হয়েছে, ধীরে ধীরে বলুন।",
    "mr": "नमस्कार, मी सहाय. काय झालं ते शांतपणे सांगा.",
    "te": "నమస్కారం, నేను సహాయ్. ఏం జరిగిందో నెమ్మదిగా చెప్పండి.",
    "gu": "નમસ્તે, હું સહાય છું. શું થયું તે શાંતિથી કહો.",
    "kn": "ನಮಸ್ಕಾರ, ನಾನು ಸಹಾಯ್. ಏನಾಯಿತು ಎಂದು ನಿಧಾನವಾಗಿ ಹೇಳಿ.",
    "ml": "നമസ്കാരം, ഞാൻ സഹായ് ആണ്. എന്താണ് സംഭവിച്ചതെന്ന് സാവധാനം പറയൂ.",
    "pa": "ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਸਹਾਇ ਹਾਂ। ਆਰਾਮ ਨਾਲ ਦੱਸੋ ਕੀ ਹੋਇਆ।",
    "ur": "آداب، میں سہائے ہوں۔ آرام سے بتائیے، کیا ہوا؟",
    "or": "ନମସ୍କାର, ମୁଁ ସହାୟ। କ'ଣ ହେଲା ଧୀରେ କୁହନ୍ତୁ।",
    "as": "নমস্কাৰ, মই সহায়। কি হ'ল লাহে লাহে কওক।",
    "sa": "नमस्ते, अहं सहायः। किम् अभवत् इति शनैः वदतु।",
}

URGENT = {
    "hi": "आप अभी खतरे में हों तो तुरंत 112 पर कॉल करें। महिलाएँ 181 पर भी कॉल कर सकती हैं। मैं यहीं हूँ, जब आप सुरक्षित हों तो आगे बात करेंगे।",
    "ta": "நீங்கள் இப்போது ஆபத்தில் இருந்தால் உடனே 112 அழையுங்கள். பெண்கள் 181 அழைக்கலாம். பாதுகாப்பாக இருக்கும்போது தொடர்ந்து பேசலாம்.",
    "en": "If you are in danger right now, call 112 immediately. Women can also call 181. I'm here, and we can continue once you're safe.",
}


def _pick(options: dict, lang: str) -> str:
    return options.get(lang) or options["en"]


def greeting(lang: str) -> str:
    return _pick(GREETING, lang)


def _is_danger(text: str) -> bool:
    t = text.lower()
    return any(w.lower() in t for w in ROUTES["danger_words"])


def _keyword_issue(text: str) -> str | None:
    t = text.lower()
    best, score = None, 0
    for issue in ROUTES["issues"]:
        s = sum(1 for k in issue["keywords"] if k.lower() in t)
        if s > score:
            best, score = issue["id"], s
    return best


def build_card(issue_id: str, facts: dict) -> dict:
    i = ISSUES[issue_id]
    lines = ["legal_aid", "emergency"]
    if issue_id == "cyber_fraud":
        lines.insert(0, "cyber")
    if issue_id == "consumer":
        lines.insert(0, "consumer")
    return {
        "issue_id": issue_id,
        "title": i["title"],
        "urgent": i.get("urgent", False),
        "forum": i["forum"],
        "steps": i["steps"],
        "documents": i["documents"],
        "deadline": i["deadline"],
        "cost": i["cost"],
        "facts": [{"q": a["q"], "a": facts.get(a["key"], "")} for a in i["ask"] if facts.get(a["key"])],
        "helplines": [HELPLINES[h] for h in lines],
        "legal_aid": ROUTES["legal_aid"],
        "draft": i["draft"],
        "practice_case": i["practice_case"],
        "reviewed": i["reviewed"],
    }


def _next_ask(issue_id: str, facts: dict) -> dict | None:
    i = ISSUES[issue_id]
    # cyber fraud is time-critical: hand over the card after the first answer
    if i.get("urgent") and facts:
        return None
    for a in i["ask"]:
        if not facts.get(a["key"]):
            return a
    return None


async def turn(keys: Keys, lang: str, state: dict, text: str, history: list[dict]) -> dict:
    state = dict(state or {})
    facts = dict(state.get("facts") or {})
    issue_id = state.get("issue_id")

    if _is_danger(text) and not state.get("danger_shown"):
        state["danger_shown"] = True
        return {"reply": URGENT.get(lang, URGENT["en"]), "state": state, "urgent": True}

    try:
        result = await _llm_turn(keys, lang, issue_id, facts, text, history)
    except llm.NoLLM:
        result = None
    except Exception as e:  # keep the call going on a model hiccup
        result = None
        state["llm_error"] = str(e)[:200]

    if result:
        issue_id = result.get("issue_id") or issue_id
        if issue_id not in ISSUES:
            issue_id = None
        for k, v in (result.get("facts") or {}).items():
            if v and str(v).strip().lower() not in ("null", "none", "unknown"):
                facts[k] = str(v)
    else:
        if not issue_id:
            issue_id = _keyword_issue(text)
        elif state.get("pending_key"):
            facts[state["pending_key"]] = text

    state.update({"issue_id": issue_id, "facts": facts})

    if not issue_id:
        reply = (result or {}).get("reply") or _pick({
            "hi": "समझ रही हूँ। थोड़ा और बताइए: पैसे का मामला है, पुलिस का, मकान का, नौकरी का या किसी company का?",
            "ta": "புரிகிறது. கொஞ்சம் கூடச் சொல்லுங்கள்: பணம், போலீஸ், வீடு, வேலை அல்லது ஏதாவது company பற்றியதா?",
            "en": "I understand. Tell me a little more: is it about money, police, a house, a job, or a company?",
        }, lang)
        return {"reply": reply, "state": state}

    nxt = _next_ask(issue_id, facts)
    if nxt:
        state["pending_key"] = nxt["key"]
        reply = (result or {}).get("reply") or nxt.get(f"q_{lang}") or nxt["q"]
        return {"reply": reply, "state": state}

    state["pending_key"] = None
    state["done"] = True
    card = build_card(issue_id, facts)
    reply = (result or {}).get("reply") or _pick({
        "hi": "धन्यवाद। मैंने आपका रास्ता स्क्रीन पर रख दिया है: कहाँ जाना है, क्या ले जाना है, और समय सीमा। मुफ़्त वकील के लिए 15100 पर कॉल कर सकते हैं।",
        "ta": "நன்றி. எங்கு செல்ல வேண்டும், என்ன கொண்டு செல்ல வேண்டும், கால வரம்பு என்ன என்பதை திரையில் வைத்துள்ளேன். இலவச வழக்கறிஞருக்கு 15100 அழையுங்கள்.",
        "en": "Thank you. Your path is on the screen: where to go, what to carry and the deadline. For a free lawyer, call 15100.",
    }, lang)
    return {"reply": reply, "state": state, "card": card}


async def _llm_turn(keys: Keys, lang: str, issue_id: str | None, facts: dict, text: str,
                    history: list[dict]) -> dict | None:
    if not keys.llm_base:
        # On the free Hugging Face Space the daily GPU quota is tiny, so it's kept
        # for the courtroom; intake runs on the vetted rules unless a full Evon
        # server (LLM_BASE_URL) is configured.
        raise llm.NoLLM()
    issue_list = "\n".join(f'- {i["id"]}: {i["title"]}' for i in ROUTES["issues"])
    if issue_id:
        asks = ISSUES[issue_id]["ask"]
    else:
        asks = []
    missing = [a for a in asks if not facts.get(a["key"])]
    style = speech_style(lang)
    system = f"""You are Sahay, a calm legal-help intake assistant on a voice call in India. Callers are often scared, speak in mixed languages, and the audio may be noisy.
Your job each turn: (1) identify which problem this is, (2) extract facts from what the caller said, (3) write ONE short spoken reply.

Problems (issue_id):
{issue_list}

Current issue_id: {issue_id or "unknown"}
Facts already known: {json.dumps(facts, ensure_ascii=False)}
Facts still needed (key: question): {json.dumps({a["key"]: a["q"] for a in missing}, ensure_ascii=False)}

Rules for "reply":
- Write it in {style}. Maximum 2 short sentences, as if spoken on a phone.
- If facts are still needed after this turn, briefly acknowledge what they said and ask ONLY the next missing question.
- If no facts are missing after this turn, say you have understood and their path is on the screen. Do not list steps.
- Never give legal conclusions or promise outcomes. Never invent laws, sections or phone numbers.
- If the issue is unclear, ask what kind of problem it is.

Return ONLY JSON: {{"issue_id": "<id or null>", "facts": {{"<key>": "<short value>"}}, "reply": "<spoken reply>"}}
Fact keys must come from the needed list of the chosen issue. If you change issue_id, use that issue's keys: {json.dumps({i["id"]: [a["key"] for a in i["ask"]] for i in ROUTES["issues"]})}"""
    msgs = [{"role": "system", "content": system}]
    for h in history[-8:]:
        msgs.append({"role": "assistant" if h["role"] == "sahay" else "user", "content": h["text"]})
    # small models drift to Hinglish; restate the hard rules right next to the turn
    script = "English" if lang == "en" else f"{lang_info(lang)['english']} written in its own script"
    msgs.append({"role": "user", "content": f"{text}\n\n[Rules: the reply must be in {script}. Ask at most ONE question. Output JSON only.]"})
    out = await llm.chat(keys, msgs, max_tokens=350, temperature=0.3, want_json=True)
    return llm.parse_json(out)


DRAFT_SHAPES = {
    "legal_notice_salary": "a legal notice to the employer demanding unpaid salary within 15 days",
    "legal_notice_deposit": "a legal notice to the landlord demanding return of the security deposit within 15 days",
    "consumer_notice": "a notice to the company demanding refund or replacement within 15 days, mentioning the Consumer Protection Act, 2019",
    "sp_complaint": "a written complaint to the Superintendent of Police under Section 173(4) BNSS because the police station refused to register an FIR",
    "cheque_notice": "a demand notice under Section 138 of the Negotiable Instruments Act, 1881 giving 15 days to pay the cheque amount",
}


async def draft(keys: Keys, issue_id: str, facts: dict, name: str, lang: str) -> dict:
    i = ISSUES.get(issue_id)
    if not i or not i["draft"]:
        return {"title": "", "body": ""}
    shape = DRAFT_SHAPES[i["draft"]]
    facts_txt = "\n".join(f"- {a['q']} {facts.get(a['key'], '[to fill]')}" for a in i["ask"])
    try:
        body = await llm.chat(keys, [
            {"role": "system", "content": "You draft short, formal Indian legal letters in plain English. Use [square brackets] for anything unknown such as addresses or dates. No commentary before or after the letter. Do not invent case law."},
            {"role": "user", "content": f"Draft {shape}.\nSender: {name or '[Your name]'}\nFacts from the caller:\n{facts_txt}\nKeep it under 250 words. End with a line saying it is sent without prejudice to other remedies."},
        ], max_tokens=600, temperature=0.2)
    except Exception:
        body = (
            f"To,\n[Name and address of the other party]\n\nSubject: {shape[0].upper() + shape[1:]}\n\n"
            f"I, {name or '[Your name]'}, write regarding the following:\n{facts_txt}\n\n"
            "You are called upon to resolve this within 15 days of receiving this notice, failing which I will take "
            "appropriate legal action before the competent authority, entirely at your risk as to costs.\n\n"
            "This notice is sent without prejudice to my other rights and remedies.\n\n"
            f"Date: [date]\nPlace: [place]\n\n{name or '[Your name]'}"
        )
    return {"title": shape[0].upper() + shape[1:], "body": body}
