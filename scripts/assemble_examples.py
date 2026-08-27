#!/usr/bin/env python3
"""Assemble example sentences for words that never appear in the corpus.

Only nouns, only substitution: find a real utterance that already uses the
*standard* Korean word (or a clear synonym), swap that token for our Jeju
headword, and keep the rest of the spoken sentence.

Rules:
- Do not invent frames. The sentence body comes from the corpus.
- Do not overwrite spoken examples that already exist.
- One donor utterance → one word.
- One remainder fingerprint → one word (no "X가 장에 간다" reuse).
- Particle 이/가, 을/를, 은/는, 과/와, 으로/로 is recomputed for the new lemma.
- Rare words with no safe donor stay empty.
"""

from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from extract_aihub_examples import (  # noqa: E402
    AIHUB,
    COVERAGE_PATH,
    OUT_PATH,
    UNITS_PATH,
    clip_clause,
    hangul_count,
    has_pii,
    is_dangling,
    is_gloss,
    iter_utterances,
    keep_example,
    TOKEN_RE,
)

ROOT = Path("/workspace")
AUDIT_PATH = AIHUB / "assembled.json"
KEEP_PER_WORD = 40

NOUN_PARTICLES = sorted(
    [
        "한테",
        "에게",
        "부터",
        "까지",
        "처럼",
        "보다",
        "밖에",
        "으로",
        "에서",
        "이랑",
        "이여",
        "아여",
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
        "랑",
        "께",
        "요",
    ],
    key=len,
    reverse=True,
)

BATCHIM_PARTICLES = {
    "이": ("이", "가"),
    "가": ("이", "가"),
    "을": ("을", "를"),
    "를": ("을", "를"),
    "은": ("은", "는"),
    "는": ("은", "는"),
    "과": ("과", "와"),
    "와": ("과", "와"),
}

FILLER = {
    "그",
    "이",
    "저",
    "막",
    "좀",
    "어",
    "아",
    "음",
    "응",
    "예",
    "거",
    "게",
    "고",
    "하",
    "해",
    "행",
    "그냥",
    "진짜",
    "아니",
    "근데",
    "그리고",
    "이제",
    "인제",
    "뭐",
    "참",
    "또",
    "다",
    "잘",
    "더",
    "너무",
    "아주",
}

SYNONYM_TO_STANDARD = {
    "부인": "아내",
    "와이프": "아내",
    "마누라": "아내",
    "부모님": "부모",
    "애비": "아버지",
    "아범": "아버지",
    "에미": "어머니",
    "손님들": "손님",
    "자식들": "자식",
    "애기": "아이",
    "아기": "아이",
}

# Standards too short or too many homographs to swap safely.
SKIP_STANDARDS = {
    "것",
    "거",
    "데",
    "때",
    "곳",
    "중",
    "앞",
    "뒤",
    "위",
    "아래",
    "속",
    "밖",
    "이리",
    "저리",
    "마리",
    "마마",
    "밀고",
    "부리",
    "진디",
    "고사",
    "멀리",
}

IDIOM_NEXT = {"아빠", "엄마", "먹방"}
IDIOM_PREV = {"허세"}
NUMBER_PREV = {
    "한",
    "두",
    "세",
    "네",
    "다섯",
    "여섯",
    "일곱",
    "여덟",
    "아홉",
    "열",
    "몇",
    "한두",
    "두세",
    "서너",
}
VERB_NEXT = {"있어", "있다", "인", "잇어", "있고", "있는", "이서"}
GLOSS_BOTH = re.compile(r"이르는 말|라는 말|라는 뜻|아우러|무슨 뜻")


def has_batchim(word: str) -> bool:
    if not word:
        return False
    code = ord(word[-1])
    if 0xAC00 <= code <= 0xD7A3:
        return (code - 0xAC00) % 28 != 0
    return False


def jongseong(word: str) -> int:
    if not word:
        return 0
    code = ord(word[-1])
    if 0xAC00 <= code <= 0xD7A3:
        return (code - 0xAC00) % 28
    return 0


def particle_for(lemma: str, particle: str) -> str:
    if particle in BATCHIM_PARTICLES:
        with_b, without = BATCHIM_PARTICLES[particle]
        return with_b if has_batchim(lemma) else without
    if particle in {"로", "으로"}:
        jong = jongseong(lemma)
        return "로" if jong in (0, 8) else "으로"
    return particle


def split_noun_particle(token: str, min_lemma: int = 2) -> tuple[str, str]:
    for ending in NOUN_PARTICLES:
        if token.endswith(ending) and len(token) - len(ending) >= min_lemma:
            return token[: -len(ending)], ending
    return token, ""


def remainder_fp(jeju: str, replaced_token: str) -> str:
    tokens = TOKEN_RE.findall(jeju)
    rest: list[str] = []
    skipped = False
    for tok in tokens:
        if not skipped and tok == replaced_token:
            skipped = True
            continue
        lemma, _part = split_noun_particle(tok, min_lemma=1)
        if lemma in FILLER:
            continue
        rest.append(lemma)
    return " ".join(rest)


def replace_token(text: str, old: str, new: str) -> str:
    pattern = rf"(?<![가-힣A-Za-z0-9]){re.escape(old)}(?![가-힣A-Za-z0-9])"
    return re.sub(pattern, new, text, count=1)


def jaccard(a: str, b: str) -> float:
    sa, sb = set(a.split()), set(b.split())
    if not sa or not sb:
        return 0.0
    return len(sa & sb) / len(sa | sb)


def score_candidate(jeju_use: str, particle: str, hits: int) -> int:
    score = 8
    n = hangul_count(jeju_use)
    if 10 <= n <= 28:
        score += 6
    elif 8 <= n <= 40:
        score += 3
    else:
        score -= 2
    if particle:
        score += 3
    if hits == 1:
        score += 2
    return score


def neighbor(tokens: list[str], raw: str) -> tuple[str, str]:
    try:
        idx = tokens.index(raw)
    except ValueError:
        return "", ""
    prev = tokens[idx - 1] if idx > 0 else ""
    nxt = tokens[idx + 1] if idx + 1 < len(tokens) else ""
    return prev, nxt


def leftover_lemma(assembled: str, lemma: str, head: str) -> bool:
    if not lemma or lemma == head:
        return False
    for tok in TOKEN_RE.findall(assembled):
        if tok == head or tok.startswith(head):
            continue
        if tok == lemma or tok.startswith(lemma) or split_noun_particle(tok)[0] == lemma:
            return True
    return False


def bad_slot(tokens: list[str], raw: str, particle: str) -> bool:
    prev, nxt = neighbor(tokens, raw)
    if nxt in IDIOM_NEXT or prev in IDIOM_PREV:
        return True
    if prev in NUMBER_PREV or prev.isdigit():
        return True
    if nxt in VERB_NEXT:
        return True
    if particle in {"는", "은"} and (nxt.startswith("것") or nxt.startswith("거")):
        return True
    return False


def similar_to_used(fp: str, used: set[str]) -> bool:
    if fp in used:
        return True
    for other in used:
        if jaccard(fp, other) >= 0.72:
            return True
    return False


def selftest() -> None:
    assert has_batchim("남편") is True
    assert has_batchim("각씨") is False
    assert particle_for("각씨", "이") == "가"
    assert particle_for("냄편", "가") == "이"
    assert particle_for("나그네", "을") == "를"
    assert particle_for("부미", "를") == "를"
    assert remainder_fp("아내가 장에 간다", "아내가") == "장 간다"
    assert remainder_fp("남편이 장에 간다", "남편이") == "장 간다"
    assert remainder_fp("아내가 장에 간다", "아내가") == remainder_fp("남편이 장에 간다", "남편이")
    assert remainder_fp("남편이 장에 갔어요", "남편이") == "장 갔어"
    assert leftover_lemma("아옴내 암내는 아닌디", "암내", "아옴내") is True
    assert leftover_lemma("그런 각씨가 어디이서?", "와이프", "각씨") is False
    assert bad_slot(["남편은", "여기서", "기러기", "아빠", "했주게"], "기러기", "") is True
    assert bad_slot(["허세", "부리는", "것보다"], "부리는", "는") is True
    assert bad_slot(["다섯", "마리를"], "마리를", "를") is True
    print("selftest ok")


def load_vocab() -> tuple[list[dict], dict[str, dict], dict[str, list[dict]]]:
    units = json.loads(UNITS_PATH.read_text(encoding="utf-8"))
    words: list[dict] = []
    meta: dict[str, dict] = {}
    for unit in units:
        for word in unit["words"]:
            words.append(word)
            meta[word["seq"]] = {
                "rankIndex": unit["rankIndex"],
                "unitId": unit["id"],
                "title": unit["title"],
            }
    existing = json.loads(OUT_PATH.read_text(encoding="utf-8")) if OUT_PATH.exists() else {}
    return words, meta, existing


def targets(words: list[dict], existing: dict[str, list]) -> list[dict]:
    out = []
    for word in words:
        if word["partOfSpeech"] != "noun":
            continue
        if word["seq"] in existing:
            continue
        if len(word["jeju"]) < 2 or len(word["standard"]) < 2:
            continue
        if word["standard"] in SKIP_STANDARDS:
            continue
        out.append(word)
    return out


def needle_index(fill: list[dict]) -> dict[str, list[dict]]:
    index: dict[str, list[dict]] = defaultdict(list)
    for word in fill:
        index[word["standard"]].append(word)
        for syn, std in SYNONYM_TO_STANDARD.items():
            if std == word["standard"]:
                index[syn].append(word)
    return index


def our_lemmas(words: list[dict]) -> dict[str, str]:
    mapping = {}
    for word in words:
        mapping[word["jeju"]] = word["standard"]
    return mapping


def find_hits(jeju: str, std_sent: str, needles: dict[str, list[dict]], lemma_to_std: dict[str, str]):
    tokens = TOKEN_RE.findall(jeju)
    std_tokens = TOKEN_RE.findall(std_sent)
    std_lemmas = {split_noun_particle(tok)[0] for tok in std_tokens}
    std_lemmas.update(std_tokens)
    found = []
    for tok in tokens:
        lemma, part = split_noun_particle(tok)
        keys = []
        if tok in needles:
            keys.append((tok, tok, ""))
        if lemma in needles and part:
            keys.append((lemma, tok, part))
        for key, raw, particle in keys:
            if key in lemma_to_std and lemma_to_std[key] not in {w["standard"] for w in needles[key]}:
                continue
            for word in needles[key]:
                if word["standard"] not in std_lemmas and key not in std_lemmas:
                    continue
                if word["jeju"] in tokens or word["jeju"] in jeju:
                    continue
                found.append((word, raw, particle, key))
    return found


def keep_assembled(word: dict, item: dict, original_lemma: str = "") -> bool:
    if not keep_example(word, item):
        return False
    jeju = item["jeju"]
    standard = item["standard"]
    if word["jeju"] not in jeju:
        return False
    if is_gloss(word, jeju) or GLOSS_BOTH.search(jeju) or GLOSS_BOTH.search(standard):
        return False
    if original_lemma and leftover_lemma(jeju, original_lemma, word["jeju"]):
        return False
    n = hangul_count(jeju)
    return 8 <= n <= 48


def push_candidate(bucket: dict[str, list[tuple]], seq: str, cand: tuple) -> None:
    score, _n, remainder, _utt, item, _meta = cand
    rows = bucket[seq]
    if any(row[2] == remainder for row in rows):
        for i, row in enumerate(rows):
            if row[2] == remainder and score > row[0]:
                rows[i] = cand
        return
    rows.append(cand)
    rows.sort(key=lambda row: (-row[0], row[1]))
    del rows[KEEP_PER_WORD:]


def existing_remainders(words: list[dict], existing: dict[str, list]) -> set[str]:
    used: set[str] = set()
    by_seq = {word["seq"]: word for word in words}
    for seq, items in existing.items():
        word = by_seq.get(seq)
        if not word:
            continue
        for item in items:
            jeju = item.get("jeju", "")
            tokens = TOKEN_RE.findall(jeju)
            replaced = next((tok for tok in tokens if tok.startswith(word["jeju"])), word["jeju"])
            fp = remainder_fp(jeju, replaced)
            if fp:
                used.add(fp)
    return used


def assign(fill: list[dict], meta: dict[str, dict], bucket: dict[str, list[tuple]], used_fp: set[str]):
    used_utt: set[str] = set()
    assigned: dict[str, dict] = {}
    ranked = sorted(fill, key=lambda w: (meta[w["seq"]]["rankIndex"], w["seq"]))
    for word in ranked:
        rows = sorted(bucket.get(word["seq"], []), key=lambda row: (-row[0], row[1]))
        for score, _n, remainder, utt_key, item, extra in rows:
            if utt_key in used_utt:
                continue
            if similar_to_used(remainder, used_fp):
                continue
            if not keep_assembled(word, item, extra.get("replaced_lemma", "")):
                continue
            assigned[word["seq"]] = {
                "item": item,
                "score": score,
                "remainder": remainder,
                "utt": utt_key,
                **extra,
            }
            used_utt.add(utt_key)
            used_fp.add(remainder)
            break
    return assigned


def merge_into_app(words: list[dict], existing: dict[str, list], assigned: dict[str, dict]) -> dict[str, list]:
    out = {seq: list(items) for seq, items in existing.items()}
    for seq, row in assigned.items():
        out[seq] = [row["item"]]
    UNITS = json.loads(UNITS_PATH.read_text(encoding="utf-8"))
    merged_units = []
    for unit in UNITS:
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
    OUT_PATH.write_text(json.dumps(out, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    UNITS_PATH.write_text(json.dumps(merged_units, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return out


def write_audit(fill: list[dict], assigned: dict[str, dict], meta: dict[str, dict]) -> None:
    attached = []
    for seq, row in assigned.items():
        attached.append(
            {
                "seq": seq,
                "jeju": row["head"],
                "standard": row["standard"],
                "unitId": meta[seq]["unitId"],
                "rankIndex": meta[seq]["rankIndex"],
                "replaced": row["replaced"],
                "original": row["original"],
                "assembled": row["item"]["jeju"],
                "gloss": row["item"]["standard"],
                "remainder": row["remainder"],
                "file": row["file"],
                "score": row["score"],
            }
        )
    attached.sort(key=lambda row: (row["rankIndex"], row["unitId"], row["seq"]))
    empty = [w["seq"] for w in fill if w["seq"] not in assigned]
    payload = {
        "attached": attached,
        "attachedCount": len(attached),
        "stillEmpty": len(empty),
        "note": "명사만, 말뭉치 문장에 표준어가 나온 자리를 제주 표제어로 치환. 문장 뼈대는 단어당 1회.",
    }
    AUDIT_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    if "--selftest" in sys.argv:
        selftest()
        return

    words, meta, existing = load_vocab()
    fill = targets(words, existing)
    needles = needle_index(fill)
    lemma_to_std = our_lemmas(words)
    print(f"existing {len(existing)}  noun targets {len(fill)}  scanning...", flush=True)

    bucket: dict[str, list[tuple]] = defaultdict(list)
    scanned = 0
    considered = 0
    for row in iter_utterances():
        scanned += 1
        jeju_sent, std_sent = row["j"], row["s"]
        if has_pii(jeju_sent) or has_pii(std_sent) or is_dangling(jeju_sent):
            continue
        hits = find_hits(jeju_sent, std_sent, needles, lemma_to_std)
        if not hits:
            continue
        seen_seq = set()
        for word, raw_tok, particle, _key in hits:
            if word["seq"] in seen_seq:
                continue
            tokens_use = TOKEN_RE.findall(jeju_sent)
            if bad_slot(tokens_use, raw_tok, particle):
                continue
            clipped = clip_clause(jeju_sent, std_sent, raw_tok)
            if not clipped:
                continue
            jeju_use, std_use = clipped
            if bad_slot(TOKEN_RE.findall(jeju_use), raw_tok, particle):
                continue
            lemma = split_noun_particle(raw_tok)[0] or raw_tok
            new_tok = word["jeju"] + particle_for(word["jeju"], particle)
            assembled_j = replace_token(jeju_use, raw_tok, new_tok)
            if assembled_j == jeju_use:
                continue
            fp = remainder_fp(jeju_use, raw_tok)
            if hangul_count(fp) < 4:
                continue
            item = {"jeju": assembled_j, "standard": std_use}
            if not keep_assembled(word, item, lemma):
                continue
            utt_key = f"{row['f']}::{jeju_sent}"
            occ = TOKEN_RE.findall(jeju_use).count(raw_tok)
            score = score_candidate(jeju_use, particle, occ)
            extra = {
                "head": word["jeju"],
                "standard": word["standard"],
                "replaced": raw_tok,
                "replaced_lemma": lemma,
                "original": jeju_use,
                "file": row["f"],
            }
            push_candidate(
                bucket,
                word["seq"],
                (score, hangul_count(jeju_use), fp, utt_key, item, extra),
            )
            seen_seq.add(word["seq"])
            considered += 1
        if scanned % 150000 == 0:
            print(f"... {scanned}  words with cands {len(bucket)}", flush=True)

    print(f"scanned {scanned}  candidate rows {considered}  words {len(bucket)}", flush=True)
    used_fp = existing_remainders(words, existing)
    assigned = assign(fill, meta, bucket, used_fp)
    print(f"assigned {len(assigned)}  still empty {len(fill) - len(assigned)}")

    out = merge_into_app(words, existing, assigned)
    write_audit(fill, assigned, meta)
    if COVERAGE_PATH.exists():
        coverage = json.loads(COVERAGE_PATH.read_text(encoding="utf-8"))
        coverage["attachedToApp"] = len(out)
        coverage["assembledNouns"] = len(assigned)
        COVERAGE_PATH.write_text(json.dumps(coverage, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"examples.json words {len(out)}  sentences {sum(len(v) for v in out.values())}")
    print(f"wrote {OUT_PATH}")
    print(f"audit {AUDIT_PATH}")

    watch = ["각씨", "냄편", "부미", "나그네", "얼애", "쥐인"]
    by_jeju = {w["jeju"]: w for w in words}
    for jeju in watch:
        word = by_jeju.get(jeju)
        row = assigned.get(word["seq"]) if word else None
        if row:
            print(f"  {jeju} <- {row['replaced']}: {row['item']['jeju']} / {row['item']['standard']}")
        else:
            print(f"  {jeju} -> (empty)")


if __name__ == "__main__":
    main()
