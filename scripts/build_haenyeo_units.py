#!/usr/bin/env python3
"""Pack 10 themes × 10 waves × 10 words = 1000 into src/data/units.json."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path("/workspace")
V4 = json.loads((ROOT / "attachments/jeju_dialect_final_v4.json").read_text())
CURRENT = json.loads((ROOT / "src/data/units.json").read_text())

THEMES = [
    ("people", ["나와 너", "가족과 사람", "사람 2", "호칭", "별칭", "사람 3", "이웃", "일터", "성격", "사람 4"]),
    ("talk", ["인사", "말 걸기", "어찌", "표현", "느낌", "말 2", "어찌 2", "감탄", "연결", "말 3"]),
    ("body", ["몸", "몸 2", "몸 3", "감각", "몸 4", "얼굴", "손발", "병", "몸 5", "몸 6"]),
    ("food", ["밥상", "부엌", "살림그릇", "간식", "바다 음식", "반찬", "해산물", "술", "음식 3", "음식 4"]),
    ("verbs", ["움직임", "움직임 2", "움직임 3", "움직임 4", "움직임 5", "움직임 6", "움직임 7", "움직임 8", "움직임 9", "움직임 10"]),
    ("adj", ["상태", "상태 2", "상태 3", "상태 4", "상태 5", "상태 6", "상태 7", "상태 8", "상태 9", "상태 10"]),
    ("home", ["집", "옷", "살림", "길과 땅", "집 2", "도구", "물건", "밭", "길", "집 3"]),
    ("life", ["때", "풍습", "일상", "일", "문화", "숫자", "일터", "놀이", "신앙", "마을"]),
    ("animals", ["동물", "동물 2", "가축", "새", "동물 3", "바다 생물", "벌레", "가축 2", "짐승", "동물 4"]),
    ("nature", ["날씨", "날씨 2", "바다", "식물", "땅과 농사", "나무", "날씨 3", "바다 2", "농사", "땅"]),
]

CAT_THEME = {
    "인륜": "people",
    "대이름씨": "people",
    "신체": "body",
    "음식": "food",
    "채소": "food",
    "움직씨": "verbs",
    "그림씨": "adj",
    "집": "home",
    "복식": "home",
    "짐승": "animals",
    "날짐승": "animals",
    "물동물": "animals",
    "곤충": "animals",
    "품위 짐승": "animals",
    "초목": "nature",
    "꽃·열매": "nature",
    "농경": "nature",
    "천문": "nature",
    "지리": "nature",
    "곡물": "nature",
    "느낌씨": "talk",
    "어찌씨": "talk",
    "매김씨": "talk",
    "셈씨": "life",
    "무속": "life",
    "잡류": "life",
    "기예": "life",
}

GUESS_THEME = {
    "인륜": "people",
    "신체": "body",
    "음식": "food",
    "용언(추정)": "verbs",
    "집": "home",
    "복식": "home",
    "도구": "home",
    "짐승": "animals",
    "물동물": "animals",
    "곤충": "animals",
    "초목": "nature",
    "꽃·열매": "nature",
    "농경": "nature",
    "곡물": "nature",
    "때·기후": "nature",
    "지리": "nature",
    "어찌씨": "talk",
}


def has_pua(text: str) -> bool:
    return any((0xE000 <= ord(ch) <= 0xF8FF) or (0xF0000 <= ord(ch) <= 0xFFFFD) for ch in text or "")


def clean_jeju(text: str) -> str:
    text = re.sub(r"[¹²³⁴⁵⁶⁷⁸⁹0-9]", "", text or "")
    return re.sub(r"\s+", "", text).strip()


def clean_gloss(text: str) -> str:
    text = (text or "").replace("\n", " ").strip()
    text = re.sub(r"\([^)]*\)", "", text)
    text = re.sub(r"[①②③④⑤⑥⑦⑧⑨]", " ", text)
    if "=" in text or "⇒" in text:
        parts = [part.strip() for part in re.split(r"[=⇒]", text) if re.search(r"[가-힣]{1,}", part)]
        if parts:
            text = parts[-1] if len(parts[-1]) <= 14 else parts[0]
    text = text.split(".")[0]
    text = text.split(",")[0]
    return re.sub(r"\s+", " ", text).strip(" .")


def pos_of(category: str | None, guess: str | None) -> str:
    if category == "움직씨" or guess == "용언(추정)":
        return "verb"
    if category == "그림씨":
        return "adjective"
    if category == "어찌씨":
        return "adverb"
    if category == "대이름씨":
        return "pronoun"
    if category == "셈씨":
        return "number"
    if category == "느낌씨":
        return "interjection"
    return "noun"


def theme_of(item: dict) -> str | None:
    category = item.get("category_name")
    guess = item.get("category_name_guess")
    if category in CAT_THEME:
        return CAT_THEME[category]
    if guess in GUESS_THEME:
        return GUESS_THEME[guess]
    return None


seen_seq: set[str] = set()
seen_jeju: set[str] = set()
buckets: dict[str, list[dict]] = defaultdict(list)


def add(theme: str, seq: str, jeju: str, standard: str, pos: str, max_std: int = 12) -> bool:
    jeju = clean_jeju(jeju)
    standard = clean_gloss(standard)
    if not jeju or not standard:
        return False
    if has_pua(jeju) or has_pua(standard):
        return False
    if len(jeju) > 8 or len(standard) > max_std:
        return False
    if seq in seen_seq or jeju in seen_jeju:
        return False
    seen_seq.add(seq)
    seen_jeju.add(jeju)
    buckets[theme].append(
        {
            "seq": seq,
            "jeju": jeju,
            "standard": standard,
            "soundUrl": f"/audio/{seq}.mp3",
            "partOfSpeech": pos,
        }
    )
    return True


for unit in CURRENT:
    theme = unit["themeId"]
    for word in unit["words"]:
        add(theme, str(word["seq"]), word["jeju"], word["standard"], word.get("partOfSpeech") or "noun")

extras: list[tuple[int, str, dict]] = []
for item in V4:
    if item.get("exclude_reason"):
        continue
    if item.get("confidence") == "low":
        continue
    theme = theme_of(item)
    if not theme:
        continue
    priority = 0 if item.get("confidence") == "high" else 1
    extras.append(
        (
            priority,
            theme,
            {
                "seq": str(item["seq"]),
                "jeju": item["siteName"],
                "standard": item["contents"],
                "pos": pos_of(item.get("category_name"), item.get("category_name_guess")),
            },
        )
    )
extras.sort(key=lambda row: (row[0], len(clean_gloss(row[2]["standard"]))))
for _, theme, word in extras:
    add(theme, word["seq"], word["jeju"], word["standard"], word["pos"])

NEED = 100
overflow: list[tuple[str, dict]] = []
for theme, _titles in THEMES:
    extra = buckets[theme][NEED:]
    buckets[theme] = buckets[theme][:NEED]
    for word in extra:
        overflow.append((theme, word))

short = [theme for theme, _ in THEMES if len(buckets[theme]) < NEED]
print("before steal", {theme: len(buckets[theme]) for theme, _ in THEMES})
for theme in short:
    while len(buckets[theme]) < NEED and overflow:
        _src, word = overflow.pop(0)
        buckets[theme].append(word)
print("after steal", {theme: len(buckets[theme]) for theme, _ in THEMES})

# last-resort: looser v4 leftovers
if any(len(buckets[theme]) < NEED for theme, _ in THEMES):
    for item in extras:
        _, theme_guess, word = item
        for theme, _ in THEMES:
            if len(buckets[theme]) >= NEED:
                continue
            add(theme, word["seq"], word["jeju"], word["standard"], word["pos"], max_std=16)
        if all(len(buckets[t]) >= NEED for t, _ in THEMES):
            break

units = []
order = 1
for theme_id, titles in THEMES:
    words = buckets[theme_id]
    if len(words) < NEED:
        raise SystemExit(f"{theme_id} only {len(words)}")
    for wave, title in enumerate(titles):
        chunk = words[wave * 10 : (wave + 1) * 10]
        units.append(
            {
                "id": f"{theme_id}-{wave}",
                "title": title,
                "themeId": theme_id,
                "rankIndex": wave,
                "order": order,
                "words": chunk,
            }
        )
        order += 1

out = ROOT / "src/data/units.json"
out.write_text(json.dumps(units, ensure_ascii=False, indent=2) + "\n")
print("wrote", out, "units", len(units), "words", sum(len(unit["words"]) for unit in units))
missing = [
    word["seq"]
    for unit in units
    for word in unit["words"]
    if not (ROOT / "public/audio" / f"{word['seq']}.mp3").exists()
]
print("missing audio", len(missing))
(ROOT / "scripts/missing_audio_seqs.json").write_text(json.dumps(missing))
