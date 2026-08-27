#!/usr/bin/env python3
"""Look up a Jeju word in the cleaned AI Hub corpus.

Examples:
  python scripts/search_aihub.py 각씨
  python scripts/search_aihub.py 하르방 --limit 20
"""

from __future__ import annotations

import argparse
import gzip
import json
from pathlib import Path

ROOT = Path("/workspace")
AIHUB = ROOT / "data/aihub"


def load_tokens() -> dict:
    path = AIHUB / "tokens.json"
    if not path.exists():
        raise SystemExit("data/aihub/tokens.json 없음. 먼저 scripts/build_aihub_corpus.py 를 돌리세요.")
    return json.loads(path.read_text(encoding="utf-8"))


def iter_utterances():
    folder = AIHUB / "utterances"
    if not folder.exists():
        return
    for path in sorted(folder.glob("*.jsonl.gz")):
        with gzip.open(path, "rt", encoding="utf-8") as handle:
            for line in handle:
                if line.strip():
                    yield json.loads(line)


def main() -> None:
    parser = argparse.ArgumentParser(description="AI Hub 정리 말뭉치에서 예문 찾기")
    parser.add_argument("word", help="제주어 표제어 또는 표준어")
    parser.add_argument("--limit", type=int, default=12)
    args = parser.parse_args()
    needle = args.word.strip()
    tokens = load_tokens()

    if needle in tokens:
        print(f"[token] {needle}")
        for standard, count in tokens[needle]:
            print(f"  {count:5d}  →  {standard}")
    else:
        hits = [(d, forms) for d, forms in tokens.items() if needle in d]
        print(f"[token] {needle} 정확 일치 없음. 부분 일치 {len(hits)}개")
        for dialect, forms in hits[:15]:
            top = ", ".join(f"{s}×{n}" for s, n in forms[:3])
            print(f"  {dialect}: {top}")

    print()
    shown = 0
    for row in iter_utterances():
        if needle not in row["j"] and needle not in row["s"]:
            continue
        shown += 1
        print(f"{row['f']}")
        print(f"  제주  {row['j']}")
        print(f"  표준  {row['s']}")
        if shown >= args.limit:
            break
    if shown == 0:
        print("문장 일치 없음")
    else:
        print(f"\n{shown}개 표시 (더 보려면 --limit)")


if __name__ == "__main__":
    main()
