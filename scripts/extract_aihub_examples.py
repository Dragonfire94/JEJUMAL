#!/usr/bin/env python3
"""Pull short dialect/standard example sentences from AI Hub transcripts.

Reads unzipped txt under /tmp/aihub plus JSON samples, matches them against
the 1,000 words in src/data/units.json, writes src/data/examples.json.

Does not copy raw conversations. AI Hub full data must stay off git.
"""

from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path("/workspace")
UNITS_PATH = ROOT / "src/data/units.json"
OUT_PATH = ROOT / "src/data/examples.json"
CORPUS_DIRS = [Path("/tmp/aihub"), ROOT / "attachments"]

PAIR_RE = re.compile(r"\(([^()/]+)\)/\(([^()/]+)\)")
LINE_RE = re.compile(r"^(\d+)\s*:\s*(.*)$")

ENDINGS = sorted(
    [
        "하니까이",
        "하니까",
        "하다그네",
        "해그네",
        "허니까",
        "허난",
        "허영",
        "해영",
        "하면서",
        "으면서",
        "으니까",
        "는데",
        "아서",
        "어서",
        "해서",
        "으로",
        "에서",
        "에게",
        "한테",
        "부터",
        "까지",
        "처럼",
        "보다",
        "밖에",
        "수다",
        "우다",
        "커든",
        "은",
        "는",
        "이",
        "가",
        "을",
        "를",
        "의",
        "에",
        "도",
        "만",
        "과",
        "와",
        "로",
        "께",
        "요",
        "다",
        "고",
        "게",
        "면",
        "서",
        "니",
        "네",
        "나",
        "멘",
        "켄",
        "젠",
    ],
    key=len,
    reverse=True,
)

SKIP_MARKERS = ("#", "@", "*")
DEICTIC = {
    "그것",
    "이것",
    "저것",
    "그거",
    "저거",
    "이거",
    "여기",
    "거기",
    "저기",
    "요기",
    "이쪽",
    "저쪽",
    "그쪽",
    "그렇게",
    "이렇게",
    "저렇게",
    "그것도",
    "저것도",
    "시기",
}

ALIASES = {
    "어머니": {"엄마", "어머님", "어멍"},
    "아버지": {"아빠", "아버님", "아방"},
    "할아버지": {"할아버님", "하르방"},
    "할머니": {"할머님", "할망"},
    "너": {"느", "니", "네가", "느네"},
    "너희": {"느네", "너희들"},
    "오세요": {"옵서", "오서"},
    "아이": {"애기", "아기", "아광"},
}


def hangul_count(text: str) -> int:
    return len(re.findall(r"[가-힣]", text))


def compact(text: str) -> str:
    text = re.sub(r"\s+", " ", text).strip(" \t-.,")
    return re.sub(r"[()]", "", text)


def strip_endings(token: str) -> str:
    token = re.sub(r"\s+", "", token)
    for _ in range(2):
        hit = False
        for ending in ENDINGS:
            if token.endswith(ending) and len(token) - len(ending) >= 1:
                token = token[: -len(ending)]
                hit = True
                break
        if not hit:
            break
    return token


def related(a: str, b: str) -> bool:
    a = re.sub(r"\s+", "", a)
    b = re.sub(r"\s+", "", b)
    if not a or not b:
        return False
    if a == b or a.startswith(b) or b.startswith(a):
        return True
    sa, sb = strip_endings(a), strip_endings(b)
    if sa and sb and (sa == sb or sa.startswith(sb) or sb.startswith(sa)):
        return True
    for key, extra in ALIASES.items():
        group = {key, *extra}
        if a in group and b in group:
            return True
        if any(a.startswith(item) or item.startswith(a) for item in group) and (
            b.startswith(key) or key.startswith(b) or b in group
        ):
            return True
    return False


def is_deictic(token: str) -> bool:
    t = strip_endings(re.sub(r"\s+", "", token))
    return t in DEICTIC or token in DEICTIC


def score_example(kind: str, jeju_sent: str, std_sent: str, dialect: str, std_side: str, std_ok: bool) -> int:
    score = {"exact": 8, "verb": 5, "prefix": 3}.get(kind, 0)
    n = hangul_count(jeju_sent)
    if 10 <= n <= 28:
        score += 5
    elif 7 <= n <= 36:
        score += 3
    else:
        score -= 2
    if dialect != std_side:
        score += 2
    if std_ok:
        score += 5
    if jeju_sent == std_sent:
        score -= 4
    if jeju_sent.endswith(("이", "게")) and hangul_count(jeju_sent) < 10:
        score -= 2
    return score


def merge_speaker_lines(text: str) -> list[str]:
    merged: list[tuple[str, str]] = []
    for raw in text.splitlines():
        match = LINE_RE.match(raw)
        if match:
            speaker, line = match.group(1), match.group(2).strip()
        else:
            speaker, line = "?", raw.strip()
        if not line:
            continue
        if merged and merged[-1][0] == speaker:
            combined = merged[-1][1] + " " + line
            dialect = compact(PAIR_RE.sub(r"\1", combined))
            if hangul_count(dialect) <= 40:
                merged[-1] = (speaker, combined)
                continue
        merged.append((speaker, line))
    return [line for _speaker, line in merged]


def parse_txt(path: Path) -> list[tuple[str, str, list[tuple[str, str]]]]:
    rows: list[tuple[str, str, list[tuple[str, str]]]] = []
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return rows
    for line in merge_speaker_lines(text):
        pairs = PAIR_RE.findall(line)
        if not pairs:
            continue
        jeju_sent = compact(PAIR_RE.sub(r"\1", line))
        std_sent = compact(PAIR_RE.sub(r"\2", line))
        if any(mark in jeju_sent or mark in std_sent for mark in SKIP_MARKERS):
            continue
        n = hangul_count(jeju_sent)
        if n < 6 or n > 40:
            continue
        rows.append((jeju_sent, std_sent, pairs))
    return rows


def parse_json(path: Path) -> list[tuple[str, str, list[tuple[str, str]]]]:
    rows: list[tuple[str, str, list[tuple[str, str]]]] = []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return rows
    for utt in data.get("utterance") or []:
        dialect = compact(str(utt.get("dialect_form") or utt.get("form") or ""))
        standard = compact(str(utt.get("standard_form") or dialect))
        if any(mark in dialect or mark in standard for mark in SKIP_MARKERS):
            continue
        n = hangul_count(dialect)
        if n < 6 or n > 40:
            continue
        pairs = [
            (str(eo.get("eojeol") or ""), str(eo.get("standard") or ""))
            for eo in utt.get("eojeolList") or []
            if eo.get("isDialect")
        ] or PAIR_RE.findall(str(utt.get("form") or ""))
        if not pairs:
            continue
        rows.append((dialect, standard, pairs))
    return rows


def collect_rows() -> list[tuple[str, str, list[tuple[str, str]]]]:
    rows: list[tuple[str, str, list[tuple[str, str]]]] = []
    seen: set[str] = set()
    for folder in CORPUS_DIRS:
        if not folder.exists():
            continue
        for path in folder.rglob("*"):
            if path.suffix.lower() == ".txt":
                chunk = parse_txt(path)
            elif path.suffix.lower() == ".json" and path.name.startswith("DZES"):
                chunk = parse_json(path)
            else:
                continue
            for item in chunk:
                if item[0] in seen:
                    continue
                seen.add(item[0])
                rows.append(item)
    return rows


def lookup_words(token: str, by_jeju: dict[str, dict]) -> list[tuple[dict, str]]:
    token = re.sub(r"\s+", "", token)
    if not token:
        return []
    stem = strip_endings(token)
    found: dict[str, tuple[dict, str]] = {}

    def add(key: str, kind: str) -> None:
        word = by_jeju.get(key)
        if word and word["seq"] not in found:
            found[word["seq"]] = (word, kind)

    add(token, "exact")
    add(stem, "exact")
    for source in (token, stem):
        for i in range(len(source), 1, -1):
            add(source[:i], "prefix" if i < len(source) else "exact")
        if not source.endswith("다"):
            add(source + "다", "verb")
    return list(found.values())


def accept(word: dict, kind: str, dialect: str, std_side: str) -> bool:
    d = re.sub(r"\s+", "", dialect)
    s = re.sub(r"\s+", "", std_side)
    jeju = word["jeju"]
    std_ok = related(s, word["standard"])
    if len(jeju) == 1:
        return (d == jeju or strip_endings(d) == jeju) and std_ok
    if kind in {"prefix", "verb"}:
        return std_ok
    if is_deictic(s) and not related(word["standard"], s):
        return False
    if std_ok:
        return True
    if d != jeju and strip_endings(d) != jeju:
        return False
    if d == s:
        return False
    sa, sb = strip_endings(s), strip_endings(word["standard"])
    return len(sa) >= 2 and len(sb) >= 2 and (sa[:2] == sb[:2] or sa in sb or sb in sa)


def main() -> None:
    units = json.loads(UNITS_PATH.read_text())
    words = [word for unit in units for word in unit["words"]]
    by_jeju = {word["jeju"]: word for word in words}
    print(f"vocab {len(words)}  scanning corpus...")
    rows = collect_rows()
    print(f"candidate utterances {len(rows)}")

    bucket: dict[str, list[tuple[int, dict]]] = defaultdict(list)
    for jeju_sent, std_sent, pairs in rows:
        used: set[str] = set()
        for dialect, standard_side in pairs:
            for word, kind in lookup_words(dialect, by_jeju):
                seq = word["seq"]
                if seq in used:
                    continue
                if not accept(word, kind, dialect, standard_side):
                    continue
                std_ok = related(re.sub(r"\s+", "", standard_side), word["standard"])
                sc = score_example(kind, jeju_sent, std_sent, dialect, standard_side, std_ok)
                if sc < 10:
                    continue
                bucket[seq].append((sc, {"jeju": jeju_sent, "standard": std_sent}))
                used.add(seq)

    out: dict[str, list[dict]] = {}
    for word in words:
        seq = word["seq"]
        cands = sorted(bucket.get(seq, []), key=lambda item: (-item[0], hangul_count(item[1]["jeju"])))
        picked: list[dict] = []
        seen_sent: set[str] = set()
        for _sc, item in cands:
            if item["jeju"] in seen_sent:
                continue
            seen_sent.add(item["jeju"])
            picked.append(item)
            if len(picked) == 2:
                break
        if picked:
            out[seq] = picked

    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"words with examples {len(out)}/{len(words)}")
    print(f"wrote {OUT_PATH}")

    merged_units = []
    for unit in units:
        next_words = []
        for word in unit["words"]:
            item = dict(word)
            examples = out.get(word["seq"])
            if examples:
                item["examples"] = examples
            else:
                item.pop("examples", None)
            next_words.append(item)
        merged_units.append({**unit, "words": next_words})
    UNITS_PATH.write_text(json.dumps(merged_units, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"merged examples into {UNITS_PATH}")

    for jeju in ("하르방", "어멍", "옵서", "느", "그디", "시기다", "저기", "주멩기"):
        word = by_jeju.get(jeju)
        print(f"  {jeju} -> {out.get(word['seq'], []) if word else 'n/a'}")


if __name__ == "__main__":
    main()
