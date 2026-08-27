#!/usr/bin/env python3
"""Attach real spoken examples from the cleaned AI Hub corpus.

Keeps already-attached spoken examples, then adds more from
data/aihub/utterances/*.jsonl.gz. No invented sentences.
Rare words that never appear stay empty.
"""

from __future__ import annotations

import gzip
import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path("/workspace")
UNITS_PATH = ROOT / "src/data/units.json"
OUT_PATH = ROOT / "src/data/examples.json"
AIHUB = ROOT / "data/aihub"
COVERAGE_PATH = AIHUB / "coverage.json"

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
        "는게",
        "는거",
        "난",
        "멍",
        "영",
    ],
    key=len,
    reverse=True,
)

GLOSS_RE = re.compile(r"(란 말|라는 말|라는 뜻|무슨 뜻)")
ASK_GLOSS_RE = re.compile(r"(뭐꽈|뜻이)")
PII_RE = re.compile(r"[&][A-Za-z]+[0-9]*[&]|[#][^#]+[#]|@[가-힣A-Za-z]+")
DANGLE_TOKENS = {"막", "그", "이", "저", "뭐", "어", "좀", "아", "음", "응"}
TOKEN_RE = re.compile(r"[가-힣A-Za-z0-9]+")
CLAUSE_SPLIT = re.compile(r"(?<=[.?!])\s+")
VERB_REST = re.compile(
    r"^(다|고|게|면|서|니|네|나|난|멍|영|젠|켄|멘|는|은|을|를|지|줘|줌|줬|켜|켜서|키는|키고|키면)*$"
)

ALIASES = {
    "어머니": {"엄마", "어머님", "어멍"},
    "아버지": {"아빠", "아버님", "아방"},
    "할아버지": {"할아버님", "하르방"},
    "할머니": {"할머님", "할망"},
    "너": {"느", "니", "네가", "느네"},
    "너희": {"느네", "너희들"},
    "오세요": {"옵서", "오서"},
    "아이": {"애기", "아기", "아광"},
    "아내": {"부인", "와이프", "각씨"},
    "손님": {"나그네"},
    "무엇": {"뭐", "무슨", "무신", "뭘"},
    "줍다": {"주워", "줍는", "주우"},
}

WATCH = (
    "하르방",
    "어멍",
    "옵서",
    "느",
    "그디",
    "시기다",
    "절간",
    "고장",
    "봉그다",
    "무스거",
)


def hangul_count(text: str) -> int:
    return len(re.findall(r"[가-힣]", text))


def last_token(text: str) -> str:
    tokens = TOKEN_RE.findall(text)
    return tokens[-1] if tokens else ""


def has_pii(text: str) -> bool:
    return bool(PII_RE.search(text)) or any(mark in text for mark in ("#", "@", "&"))


def is_dangling(text: str) -> bool:
    stripped = text.strip()
    if re.search(r"[.?!]$", stripped):
        return False
    return last_token(stripped) in DANGLE_TOKENS


def is_gloss(word: dict, jeju: str) -> bool:
    head = word["jeju"]
    if GLOSS_RE.search(jeju):
        return True
    if re.match(rf"^{re.escape(head)}\.\s*", jeju):
        return True
    tokens = re.findall(r"[가-힣]+", jeju)
    if tokens.count(head) >= 3:
        return True
    if tokens.count(head) >= 2 and ASK_GLOSS_RE.search(jeju):
        return True
    standard = word["standard"]
    if standard and re.search(rf"{re.escape(head)}\.\s*{re.escape(standard)}", jeju):
        return True
    filler = {"응", "어", "아", "예", "음", "그", "저"}
    content = [tok for tok in tokens if tok not in filler]
    if hangul_count(jeju) <= 12 and len(content) <= 3 and head in content and standard in content:
        return True
    return False


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


def morph_extension(short: str, long: str) -> bool:
    if not long.startswith(short) or len(short) < 2 or long == short:
        return False
    rest = long[len(short) :]
    if rest in ENDINGS:
        return True
    return bool(VERB_REST.match(rest)) and 1 <= len(rest) <= 4


def related(a: str, b: str) -> bool:
    a = re.sub(r"\s+", "", a)
    b = re.sub(r"\s+", "", b)
    if not a or not b:
        return False
    if a == b:
        return True
    sa, sb = strip_endings(a), strip_endings(b)
    if sa and sb and sa == sb:
        return True
    if morph_extension(a, b) or morph_extension(b, a) or morph_extension(sa, sb) or morph_extension(sb, sa):
        return True
    for key, extra in ALIASES.items():
        group = {key, *extra}
        if a in group and b in group:
            return True
    return False


def meaning_in_sentence(standard: str, sent: str) -> bool:
    if not standard:
        return False
    tokens = TOKEN_RE.findall(sent)
    compact_sent = re.sub(r"\s+", "", sent)
    if standard in tokens:
        return True
    if len(standard) >= 2 and (standard in sent or standard in compact_sent):
        return True
    stem = strip_endings(standard)
    if len(stem) >= 2 and any(tok == stem or tok.startswith(stem) for tok in tokens):
        return True
    for key, extra in ALIASES.items():
        group = {key, *extra}
        if standard in group and any(item in tokens for item in group if len(item) >= 2):
            return True
    return False


def clip_clause(jeju: str, standard: str, needle: str) -> tuple[str, str] | None:
    n = hangul_count(jeju)
    if 6 <= n <= 48:
        return jeju, standard
    if n < 6:
        return None
    jparts = CLAUSE_SPLIT.split(jeju)
    sparts = CLAUSE_SPLIT.split(standard)
    if len(jparts) == len(sparts) and len(jparts) > 1:
        for jp, sp in zip(jparts, sparts):
            jp, sp = jp.strip(), sp.strip()
            if needle in jp and 6 <= hangul_count(jp) <= 48 and hangul_count(sp) >= 2:
                return jp, sp
    return None


def score_example(kind: str, jeju_sent: str, std_sent: str) -> int:
    score = {"exact": 8, "infl": 5, "verb": 5}.get(kind, 3)
    n = hangul_count(jeju_sent)
    if 10 <= n <= 28:
        score += 5
    elif 7 <= n <= 48:
        score += 3
    else:
        score -= 2
    if jeju_sent != std_sent:
        score += 2
    return score


def iter_utterances():
    folder = AIHUB / "utterances"
    for path in sorted(folder.glob("*.jsonl.gz")):
        with gzip.open(path, "rt", encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    yield json.loads(line)


def build_accepted(words: list[dict], tokens_map: dict) -> dict[str, dict[str, str]]:
    prefix: dict[str, list[str]] = defaultdict(list)
    for dialect in tokens_map:
        if len(dialect) >= 2:
            prefix[dialect[:2]].append(dialect)

    accepted: dict[str, dict[str, str]] = {}
    for word in words:
        jeju, std = word["jeju"], word["standard"]
        found: dict[str, str] = {}

        def consider(tok: str, kind: str) -> None:
            if tok in found:
                return
            forms = tokens_map.get(tok, [])
            if any(related(form, std) for form, _count in forms):
                found[tok] = kind

        consider(jeju, "exact")
        if len(jeju) >= 2:
            for tok in prefix.get(jeju[:2], []):
                if tok == jeju:
                    consider(tok, "exact")
                elif tok.startswith(jeju):
                    rest = tok[len(jeju) :]
                    if rest in ENDINGS or VERB_REST.match(rest):
                        consider(tok, "infl")
        if jeju.endswith("다") and len(jeju) >= 3:
            stem = jeju[:-1]
            key = stem[:2] if len(stem) >= 2 else stem
            for tok in prefix.get(key, []):
                if tok == stem:
                    continue
                if tok.startswith(stem) and (tok[len(stem) :] in ENDINGS or VERB_REST.match(tok[len(stem) :])):
                    consider(tok, "verb")
        accepted[word["seq"]] = found
    return accepted


def match_kind(tok: str, jeju: str, accepted: dict[str, str]) -> str | None:
    if tok in accepted:
        return accepted[tok]
    if tok == jeju:
        return "exact"
    if len(jeju) >= 2 and tok.startswith(jeju):
        rest = tok[len(jeju) :]
        if rest in ENDINGS or VERB_REST.match(rest):
            return "infl"
    if jeju.endswith("다") and len(jeju) >= 3 and tok.startswith(jeju[:-1]) and tok != jeju[:-1]:
        rest = tok[len(jeju) - 1 :]
        if rest in ENDINGS or VERB_REST.match(rest):
            return "verb"
    return None


def meaning_ok(word: dict, tok: str, std_sent: str, accepted: dict[str, str]) -> bool:
    jeju = word["jeju"]
    in_std = meaning_in_sentence(word["standard"], std_sent)
    if len(jeju) <= 2:
        return in_std
    if tok in accepted:
        return True
    return in_std


def keep_example(word: dict, item: dict) -> bool:
    jeju, standard = item.get("jeju", ""), item.get("standard", "")
    if not jeju or not standard:
        return False
    if has_pii(jeju) or has_pii(standard):
        return False
    if is_dangling(jeju) or is_gloss(word, jeju):
        return False
    n = hangul_count(jeju)
    return 6 <= n <= 80 and hangul_count(standard) >= 2


def pick_best(existing_items: list[dict], extra: list[tuple[int, dict]], word: dict, limit: int = 2) -> list[dict]:
    picked: list[dict] = []
    seen: set[str] = set()
    for item in existing_items:
        if item["jeju"] in seen or not keep_example(word, item):
            continue
        seen.add(item["jeju"])
        picked.append(item)
        if len(picked) == limit:
            return picked
    extra = sorted(extra, key=lambda row: (-row[0], hangul_count(row[1]["jeju"])))
    for _sc, item in extra:
        if item["jeju"] in seen or not keep_example(word, item):
            continue
        seen.add(item["jeju"])
        picked.append(item)
        if len(picked) == limit:
            break
    return picked


def main() -> None:
    units = json.loads(UNITS_PATH.read_text(encoding="utf-8"))
    words = [word for unit in units for word in unit["words"]]
    by_seq = {word["seq"]: word for word in words}
    by_jeju = {word["jeju"]: word for word in words}
    tokens_map = json.loads((AIHUB / "tokens.json").read_text(encoding="utf-8"))
    accepted_by_seq = build_accepted(words, tokens_map)
    existing = json.loads(OUT_PATH.read_text(encoding="utf-8")) if OUT_PATH.exists() else {}

    token_to_words: dict[str, list[str]] = defaultdict(list)
    for word in words:
        seq = word["seq"]
        seen_tok = set()
        for tok in list(accepted_by_seq[seq]) + [word["jeju"]]:
            if tok in seen_tok:
                continue
            seen_tok.add(tok)
            token_to_words[tok].append(seq)

    print(f"vocab {len(words)}  existing {len(existing)}  scanning corpus...", flush=True)
    extra_bucket: dict[str, list[tuple[int, dict]]] = defaultdict(list)

    scanned = 0
    added = 0
    for row in iter_utterances():
        scanned += 1
        jeju_sent, std_sent = row["j"], row["s"]
        if has_pii(jeju_sent) or has_pii(std_sent) or is_dangling(jeju_sent):
            continue
        sent_tokens = TOKEN_RE.findall(jeju_sent)
        used: set[str] = set()
        for tok in sent_tokens:
            for seq in token_to_words.get(tok, []):
                if seq in used:
                    continue
                word = by_seq[seq]
                kind = match_kind(tok, word["jeju"], accepted_by_seq[seq])
                if not kind:
                    continue
                if not meaning_ok(word, tok, std_sent, accepted_by_seq[seq]):
                    continue
                if len(word["jeju"]) <= 2 and tok not in accepted_by_seq[seq]:
                    continue
                clipped = clip_clause(jeju_sent, std_sent, tok)
                if not clipped:
                    continue
                jeju_use, std_use = clipped
                item = {"jeju": jeju_use, "standard": std_use}
                if not keep_example(word, item):
                    continue
                sc = score_example(kind, jeju_use, std_use)
                if sc < 8:
                    continue
                extra_bucket[seq].append((sc, item))
                used.add(seq)
                added += 1
        if scanned % 100000 == 0:
            print(f"... {scanned} utterances, extra words {len(extra_bucket)}", flush=True)

    print(f"scanned {scanned}  extra matches {added}  extra words {len(extra_bucket)}", flush=True)

    out: dict[str, list[dict]] = {}
    for word in words:
        picked = pick_best(existing.get(word["seq"], []), extra_bucket.get(word["seq"], []), word)
        if picked:
            out[word["seq"]] = picked

    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"words with examples {len(out)}/{len(words)}")
    print(f"sentences {sum(len(v) for v in out.values())}")
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

    if COVERAGE_PATH.exists():
        coverage = json.loads(COVERAGE_PATH.read_text(encoding="utf-8"))
        coverage["attachedToApp"] = len(out)
        COVERAGE_PATH.write_text(json.dumps(coverage, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    for jeju in WATCH:
        word = by_jeju.get(jeju)
        print(f"  {jeju} -> {out.get(word['seq'], []) if word else 'n/a'}")


if __name__ == "__main__":
    main()
