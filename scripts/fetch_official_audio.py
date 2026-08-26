#!/usr/bin/env python3
"""Download original Jeju dialect MP3s from jeju.go.kr into public/audio."""

from __future__ import annotations

import json
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
UNITS = ROOT / "src/data/units.json"
OUT = ROOT / "public/audio"
BASE = "https://www.jeju.go.kr/api/culture/dialect/?dialect="
UA = "Mozilla/5.0 (compatible; jejumal-audio-fetch/1.0)"


def seqs() -> list[str]:
    units = json.loads(UNITS.read_text())
    return [word["seq"] for unit in units for word in unit["words"]]


def is_mp3(data: bytes) -> bool:
    if len(data) < 64:
        return False
    if data.startswith(b"ID3"):
        return True
    return data[0] == 0xFF and data[1] & 0xE0 == 0xE0


def fetch_one(seq: str, retries: int = 6) -> tuple[str, str]:
    dest = OUT / f"{seq}.mp3"
    url = f"{BASE}{seq}"
    last_error = "unknown"
    for attempt in range(retries):
        try:
            req = Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
            with urlopen(req, timeout=25) as res:
                data = res.read()
                ctype = (res.headers.get("Content-Type") or "").lower()
            if not is_mp3(data):
                last_error = f"not-mp3 {ctype} {len(data)} {data[:12]!r}"
                time.sleep(0.4 * (attempt + 1))
                continue
            dest.write_bytes(data)
            return seq, "ok"
        except HTTPError as exc:
            last_error = f"http {exc.code}"
            time.sleep(0.8 * (attempt + 1))
        except (URLError, TimeoutError, OSError) as exc:
            last_error = str(exc)
            time.sleep(0.8 * (attempt + 1))
    return seq, last_error


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    targets = seqs()
    print(f"fetching {len(targets)} clips", flush=True)
    ok = 0
    failed: list[tuple[str, str]] = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = [pool.submit(fetch_one, seq) for seq in targets]
        for i, fut in enumerate(as_completed(futures), 1):
            seq, status = fut.result()
            if status == "ok":
                ok += 1
            else:
                failed.append((seq, status))
            if i % 50 == 0 or i == len(targets):
                print(f"{i}/{len(targets)} ok={ok} fail={len(failed)}", flush=True)
    print("done", ok, "failed", len(failed))
    for seq, status in failed[:30]:
        print(seq, status)
    return 0 if not failed else 1


if __name__ == "__main__":
    sys.exit(main())
