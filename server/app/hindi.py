"""Normalise Prisma's live partials for citation matching.

Realtime partials come in Devanagari with numbers spoken as words
("सेक्शन चार सौ अड़तीस सीआरपीसी"); final transcripts use digits and Latin
("section 438 CrPC"). This turns the first into the second so the bench can
catch a repealed section while the advocate is still speaking.
"""

import re

_ONES = (
    "एक दो तीन चार पांच छह सात आठ नौ दस ग्यारह बारह तेरह चौदह पंद्रह सोलह सत्रह अठारह उन्नीस बीस "
    "इक्कीस बाईस तेईस चौबीस पच्चीस छब्बीस सत्ताईस अट्ठाईस उनतीस तीस इकतीस बत्तीस तैंतीस चौंतीस पैंतीस "
    "छत्तीस सैंतीस अड़तीस उनतालीस चालीस इकतालीस बयालीस तैंतालीस चवालीस पैंतालीस छियालीस सैंतालीस अड़तालीस "
    "उनचास पचास इक्यावन बावन तिरेपन चौवन पचपन छप्पन सत्तावन अट्ठावन उनसठ साठ इकसठ बासठ तिरेसठ चौंसठ "
    "पैंसठ छियासठ सड़सठ अड़सठ उनहत्तर सत्तर इकहत्तर बहत्तर तिहत्तर चौहत्तर पचहत्तर छिहत्तर सतहत्तर अठहत्तर "
    "उनासी अस्सी इक्यासी बयासी तिरासी चौरासी पचासी छियासी सत्तासी अट्ठासी नवासी नब्बे इक्यानवे बानवे "
    "तिरानवे चौरानवे पंचानवे छियानवे सत्तानवे अट्ठानवे निन्यानवे"
).split()


def _fold(s: str) -> str:
    # spelling variants: nukta, chandrabindu vs anusvara, छः/छह
    return s.replace("़", "").replace("ँ", "ं").replace("छः", "छह")


WORD_NUM = {_fold(w): i + 1 for i, w in enumerate(_ONES)}
WORD_NUM.update({_fold("शून्य"): 0, _fold("छे"): 6, _fold("पाँच"): 5})

TRANSLIT = [
    ("सीआरपीसी", "CrPC"), ("सी आर पी सी", "CrPC"),
    ("आईपीसी", "IPC"), ("आई पी सी", "IPC"),
    ("बीएनएसएस", "BNSS"), ("बी एन एस एस", "BNSS"),
    ("बीएनएस", "BNS"), ("बी एन एस", "BNS"),
    ("बीएसए", "BSA"),
    ("एविडेंस एक्ट", "Evidence Act"),
    ("सेक्शन", "section"), ("धारा", "section"),
]


def to_digits(text: str) -> str:
    t = _fold(text)
    for a, b in TRANSLIT:
        t = t.replace(_fold(a), b)
    tokens = re.split(r"(\s+)", t)
    out, i = [], 0
    while i < len(tokens):
        word = tokens[i].strip("।,.!?…")
        n = WORD_NUM.get(word)
        if n is None:
            out.append(tokens[i]); i += 1; continue
        # "<n> सौ <m>" -> n*100 + m
        value, j = n, i + 1
        if j + 1 < len(tokens) and tokens[j + 1].strip("।,.!?…") == "सौ":
            value, j = n * 100, j + 2
            if j + 1 < len(tokens) and tokens[j + 1].strip("।,.!?…") in WORD_NUM:
                value += WORD_NUM[tokens[j + 1].strip("।,.!?…")]
                j += 2
        out.append(str(value))
        i = j
    # "498 ए" / "41 ए" -> 498A / 41A
    return re.sub(r"(\d+)\s*ए(?=\s|$|[।,.])", r"\1A", "".join(out))
