#!/usr/bin/env python3
"""Download Jeju life-dialect entries + MP3s from jeju.go.kr OpenAPI B02."""

from __future__ import annotations

import html
import json
import time
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data/life-dialect"
AUDIO = OUT / "audio"
LIST_URL = (
    "https://www.jeju.go.kr/rest/JejuLifeDialectService/"
    "getJejuLifeDialectServiceList"
)
AUDIO_URL = "https://www.jeju.go.kr/files/liveDialect/L10B_{seq:04d}.mp3"
IMAGE_URL = "https://www.jeju.go.kr{path}"
UA = "Mozilla/5.0 (compatible; jejumal-life-dialect/1.0)"
TYPE_NAMES = {
    "LB01": "결혼",
    "LB02": "관광",
    "LB03": "기타",
    "LB04": "민요",
    "LB05": "인사말",
    "LB06": "일상대화",
    "LB07": "철학",
}


def get(url: str, timeout: int = 30) -> bytes:
    req = Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urlopen(req, timeout=timeout) as res:
        return res.read()


def item_to_dict(el: ET.Element) -> dict[str, str]:
    rec: dict[str, str] = {}
    for child in el:
        rec[child.tag] = html.unescape(child.text) if child.text else ""
    return rec


def fetch_catalog() -> list[dict]:
    items: list[dict] = []
    seen: set[str] = set()
    page = 1
    while page <= 20:
        raw = get(f"{LIST_URL}?authApiKey=&page={page}&pageSize=100")
        root = ET.fromstring(raw)
        batch = list(root.find("items") or [])
        if not batch:
            break
        added = 0
        for el in batch:
            rec = item_to_dict(el)
            seq = rec.get("seq") or ""
            if not seq or seq in seen:
                continue
            seen.add(seq)
            rec["typeName"] = TYPE_NAMES.get(rec.get("type", ""), rec.get("type", ""))
            rec["audioUrl"] = AUDIO_URL.format(seq=int(seq))
            if rec.get("image1Url"):
                rec["imageUrl"] = IMAGE_URL.format(path=rec["image1Url"])
            items.append(rec)
            added += 1
        if added == 0 or len(batch) < 100:
            break
        page += 1
        time.sleep(0.2)
    items.sort(key=lambda r: int(r["seq"]))
    return items


def is_mp3(data: bytes) -> bool:
    if len(data) < 64:
        return False
    if data.startswith(b"ID3"):
        return True
    return data[0] == 0xFF and data[1] & 0xE0 == 0xE0


def fetch_audio(seq: str, retries: int = 5) -> tuple[str, str]:
    dest = AUDIO / f"{seq}.mp3"
    if dest.exists() and dest.stat().st_size > 1024:
        return seq, "exists"
    url = AUDIO_URL.format(seq=int(seq))
    last = "unknown"
    for attempt in range(retries):
        try:
            data = get(url, timeout=40)
            if not is_mp3(data):
                last = f"not-mp3 {len(data)}"
                time.sleep(0.4 * (attempt + 1))
                continue
            dest.write_bytes(data)
            return seq, "ok"
        except HTTPError as exc:
            last = f"http {exc.code}"
            time.sleep(0.6 * (attempt + 1))
        except (URLError, TimeoutError, OSError) as exc:
            last = str(exc)
            time.sleep(0.6 * (attempt + 1))
    return seq, last


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    AUDIO.mkdir(parents=True, exist_ok=True)
    items = fetch_catalog()
    (OUT / "items.json").write_text(
        json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"catalog {len(items)}", flush=True)
    ok = 0
    failed: list[tuple[str, str]] = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = [pool.submit(fetch_audio, it["seq"]) for it in items]
        for i, fut in enumerate(as_completed(futures), 1):
            seq, status = fut.result()
            if status in ("ok", "exists"):
                ok += 1
            else:
                failed.append((seq, status))
            if i % 20 == 0 or i == len(items):
                print(f"{i}/{len(items)} audio ok={ok} fail={len(failed)}", flush=True)
    print("done catalog", len(items), "audio", ok, "failed", len(failed))
    for seq, status in failed[:20]:
        print(seq, status)
    return 0 if not failed else 1


if __name__ == "__main__":
    raise SystemExit(main())
