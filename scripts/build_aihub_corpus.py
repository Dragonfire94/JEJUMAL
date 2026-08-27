#!/usr/bin/env python3
"""Turn the unzipped AI Hub Jeju transcripts into a compact corpus.

Reads /tmp/aihub plus attachment samples. Writes data/aihub/:
  - utterances/{prefix}.jsonl.gz  unique cleaned dialect sentences
  - tokens.json                   dialect token → standard forms + counts
  - coverage.json                 which of our 1,000 words appear in the corpus
  - sample.json                   short browseable slice
  - meta.json

Raw zip/txt stay off git. The app does not import this folder.
"""

from __future__ import annotations

import gzip
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path("/workspace")
OUT = ROOT / "data/aihub"
UNITS_PATH = ROOT / "src/data/units.json"
CORPUS_DIRS = [Path("/tmp/aihub"), ROOT / "attachments"]

PAIR_RE = re.compile(r"\(([^()/]+)\)/\(([^()/]+)\)")
LINE_RE = re.compile(r"^(\d+)\s*:\s*(.*)$")
SKIP_MARKERS = ("#", "@", "*")
PUNCT_RE = re.compile(r"[.?!…,~]+$")


def hangul_count(text: str) -> int:
    return len(re.findall(r"[가-힣]", text))


def compact(text: str) -> str:
    text = re.sub(r"\(\(\)\)", " ", text)
    text = re.sub(r"\s+", " ", text).strip(" \t-.,")
    return re.sub(r"[()]", "", text).strip()


def clean_token(token: str) -> str:
    token = compact(token)
    return PUNCT_RE.sub("", token).strip()


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
            if hangul_count(dialect) <= 80:
                merged[-1] = (speaker, combined)
                continue
        merged.append((speaker, line))
    return [line for _speaker, line in merged]


def iter_txt_files() -> list[Path]:
    files: list[Path] = []
    seen: set[str] = set()
    for folder in CORPUS_DIRS:
        if not folder.exists():
            continue
        for path in folder.rglob("*.txt"):
            if path.name in seen:
                continue
            seen.add(path.name)
            files.append(path)
    files.sort(key=lambda p: p.name)
    return files


def parse_file(path: Path) -> list[tuple[str, str, list[tuple[str, str]]]]:
    try:
        text = path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return []
    rows: list[tuple[str, str, list[tuple[str, str]]]] = []
    for line in merge_speaker_lines(text):
        pairs = PAIR_RE.findall(line)
        if not pairs:
            continue
        jeju = compact(PAIR_RE.sub(r"\1", line))
        standard = compact(PAIR_RE.sub(r"\2", line))
        if any(mark in jeju or mark in standard for mark in SKIP_MARKERS):
            continue
        n = hangul_count(jeju)
        if n < 4 or n > 80:
            continue
        cleaned_pairs = []
        for dialect, std in pairs:
            d, s = clean_token(dialect), clean_token(std)
            if not d or d == s:
                continue
            if any(mark in d or mark in s for mark in SKIP_MARKERS):
                continue
            cleaned_pairs.append((d, s))
        if not cleaned_pairs:
            continue
        rows.append((jeju, standard, cleaned_pairs))
    return rows


def split_of(path: Path) -> str:
    return "val" if "/val/" in str(path).replace("\\", "/") else "train"


def main() -> None:
    files = iter_txt_files()
    print(f"files {len(files)}", flush=True)

    units = json.loads(UNITS_PATH.read_text(encoding="utf-8"))
    words = [word for unit in units for word in unit["words"]]
    by_jeju = {word["jeju"]: word for word in words}
    attached = {word["seq"] for word in words if word.get("examples")}

    OUT.mkdir(parents=True, exist_ok=True)
    utt_dir = OUT / "utterances"
    utt_dir.mkdir(exist_ok=True)

    handles = {
        prefix: gzip.open(utt_dir / f"{prefix.lower()}.jsonl.gz", "wt", encoding="utf-8", compresslevel=6)
        for prefix in ("DZES", "DZHF", "DZJD")
    }

    seen_jeju: set[str] = set()
    token_map: dict[str, Counter[str]] = defaultdict(Counter)
    file_counts: Counter[str] = Counter()
    utt_counts: Counter[str] = Counter()
    vocab_hits: dict[str, int] = defaultdict(int)
    written = 0
    skipped_dup = 0
    sample: list[dict] = []

    try:
        for index, path in enumerate(files, 1):
            prefix = path.name[:4]
            if prefix not in handles:
                continue
            split = split_of(path)
            file_counts[prefix] += 1
            for jeju, standard, pairs in parse_file(path):
                for dialect, std in pairs:
                    token_map[dialect][std] += 1
                    word = by_jeju.get(dialect)
                    if word:
                        vocab_hits[word["seq"]] += 1
                if jeju in seen_jeju:
                    skipped_dup += 1
                    continue
                seen_jeju.add(jeju)
                row = {"f": path.stem, "k": split, "j": jeju, "s": standard}
                handles[prefix].write(json.dumps(row, ensure_ascii=False, separators=(",", ":")) + "\n")
                utt_counts[prefix] += 1
                written += 1
                n = hangul_count(jeju)
                if len(sample) < 240 and 8 <= n <= 28 and jeju != standard:
                    sample.append({"file": path.stem, "jeju": jeju, "standard": standard, "pairs": pairs[:6]})
            if index % 800 == 0:
                print(f"... {index}/{len(files)} utterances {written}", flush=True)
    finally:
        for handle in handles.values():
            handle.close()

    tokens_out = {}
    for dialect, counter in token_map.items():
        ranked = counter.most_common(6)
        tokens_out[dialect] = [[std, count] for std, count in ranked]
    (OUT / "tokens.json").write_text(
        json.dumps(tokens_out, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )

    prefix: dict[str, list[str]] = defaultdict(list)
    for dialect in token_map:
        if len(dialect) >= 2:
            prefix[dialect[:2]].append(dialect)

    exact_items: list[dict] = []
    inflected_items: list[dict] = []
    absent_items: list[dict] = []
    for word in words:
        jeju = word["jeju"]
        exact_hits = vocab_hits.get(word["seq"], 0)
        inflected: list[dict] = []
        if len(jeju) >= 2:
            for dialect in prefix.get(jeju[:2], []):
                if dialect != jeju and dialect.startswith(jeju):
                    n = sum(token_map[dialect].values())
                    inflected.append(
                        {
                            "token": dialect,
                            "hits": n,
                            "standards": [std for std, _count in token_map[dialect].most_common(3)],
                        }
                    )
        inflected.sort(key=lambda row: -row["hits"])
        inflected_hits = sum(row["hits"] for row in inflected)
        item = {
            "seq": word["seq"],
            "jeju": jeju,
            "standard": word["standard"],
            "exactHits": exact_hits,
            "inflectedHits": inflected_hits,
            "inflected": inflected[:8],
            "attached": word["seq"] in attached,
        }
        if exact_hits:
            exact_items.append(item)
        elif inflected_hits:
            inflected_items.append(item)
        else:
            absent_items.append(item)
    exact_items.sort(key=lambda row: (-row["exactHits"], row["jeju"]))
    inflected_items.sort(key=lambda row: (-row["inflectedHits"], row["jeju"]))
    coverage = {
        "vocab": len(words),
        "attachedToApp": len(attached),
        "exactTokenInCorpus": len(exact_items),
        "inflectedTokenInCorpus": len(inflected_items),
        "absentAsToken": len(absent_items),
        "note": "exact는 표제어와 토큰이 같음. inflected는 각씨/각씨가처럼 조사·어미가 붙은 형태. 짧은 한 글자는 동형이의어가 많아 앱 예문에는 안 붙임.",
        "presentNotAttached": [
            {
                "seq": row["seq"],
                "jeju": row["jeju"],
                "standard": row["standard"],
                "exactHits": row["exactHits"],
                "inflectedHits": row["inflectedHits"],
            }
            for row in exact_items
            if not row["attached"]
        ][:60],
        "inflectedNotAttached": [
            {
                "seq": row["seq"],
                "jeju": row["jeju"],
                "standard": row["standard"],
                "inflectedHits": row["inflectedHits"],
                "examples": row["inflected"][:3],
            }
            for row in inflected_items
            if not row["attached"]
        ][:80],
        "absentSample": [
            {"seq": row["seq"], "jeju": row["jeju"], "standard": row["standard"]}
            for row in absent_items[:80]
        ],
    }
    (OUT / "coverage.json").write_text(json.dumps(coverage, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "sample.json").write_text(json.dumps(sample, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    sizes = {path.name: path.stat().st_size for path in sorted(utt_dir.glob("*.jsonl.gz"))}
    meta = {
        "source": "AI-HUB 한국어 방언 발화(제주도)",
        "url": "https://www.aihub.or.kr/aihubdata/data/view.do?dataSetSn=121",
        "filesScanned": len(files),
        "filesByPrefix": dict(file_counts),
        "uniqueUtterances": written,
        "utterancesByPrefix": dict(utt_counts),
        "uniqueDialectTokens": len(tokens_out),
        "duplicatesSkipped": skipped_dup,
        "filters": [
            "dialect/standard pair present",
            "no # / @ / * markers",
            "hangul length 4–80",
            "unique jeju sentence",
            "token kept only when dialect ≠ standard",
        ],
        "notInGit": ["raw zip", "raw txt", "speaker ids", "PII placeholders"],
        "files": {
            "utterances": sizes,
            "tokens.json": (OUT / "tokens.json").stat().st_size,
            "coverage.json": (OUT / "coverage.json").stat().st_size,
            "sample.json": (OUT / "sample.json").stat().st_size,
        },
    }
    (OUT / "meta.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(
        json.dumps(
            {
                k: meta[k]
                for k in (
                    "filesScanned",
                    "uniqueUtterances",
                    "uniqueDialectTokens",
                    "filesByPrefix",
                    "utterancesByPrefix",
                )
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    print(
        f"exact {len(exact_items)}  inflected {len(inflected_items)}  absent {len(absent_items)}  attached {len(attached)}"
    )
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
