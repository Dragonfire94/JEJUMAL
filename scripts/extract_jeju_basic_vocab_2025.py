#!/usr/bin/env python3
"""data/jeju-basic-vocab-2025/source.pdf(제주학연구센터, 2025)를
data/jeju-basic-vocab-2025/{vocab.json,vocab.md}로 추출한다.

PDF 좌표 기반 파싱. PDF 한 쪽은 책의 서로 다른 두 쪽(좌/우 반쪽)을 담고
있고, 각 반쪽은 다시 [제주어 형태 칸(좁음, 바깥쪽)][표준어 표제어+뜻풀이
칸(넓음, 안쪽)]으로 나뉜다. 제주어 형태는 x좌표로 칸을 나누고, y좌표
인접성으로 해당 표제어에 대응시킨다.

의존성: pymupdf (pip install pymupdf). 이 저장소의 다른 파이썬 스크립트와
달리 시스템 python의 cryptography 패키지가 깨진 환경에서는 별도
가상환경에 설치해야 할 수 있다(pypdf/pdfplumber도 같은 문제를 겪는다).

    python scripts/extract_jeju_basic_vocab_2025.py

알려진 한계는 data/jeju-basic-vocab-2025/README.md 참고 — 특히:
  - 책이 밝힌 1,500개 중 1,255개만 추출됨 (일부 소수 품사 챕터 누락 추정)
  - 동사·형용사 항목 다수가 PUA(유니코드 사용자 영역) 문자를 포함
    (아래아 등 옛한글 자모, 공개된 변환표 없음 — 원문 그대로 보존)
"""
import json
import re
import sys
from pathlib import Path

try:
    import fitz  # pymupdf
except ImportError:
    sys.exit("pymupdf가 필요합니다: pip install pymupdf")

ROOT = Path(__file__).resolve().parent.parent
PDF_PATH = ROOT / "data/jeju-basic-vocab-2025/source.pdf"
JSON_OUT = ROOT / "data/jeju-basic-vocab-2025/vocab.json"
MD_OUT = ROOT / "data/jeju-basic-vocab-2025/vocab.md"

MAIN_CONTENT_PAGES = range(7, 150)  # 명사~감탄사 사전 본문
REVERSE_INDEX_PAGES = range(150, 158)  # "표준어로 찾아보는 기본어휘"

LEVEL_LABELS = {"초급", "중급", "고급"}
POS_LABELS = {"명사", "의존명사", "대명사", "수사", "관형사", "동사", "형용사", "부사", "감탄사"}
POS_ORDER = {p: i for i, p in enumerate(
    ["명사", "의존명사", "대명사", "수사", "관형사", "동사", "형용사", "부사", "감탄사"]
)}
LEVEL_ORDER = {"초급": 0, "중급": 1, "고급": 2}

PUA_RE = re.compile("[-]")


def get_lines(page):
    lines = []
    for b in page.get_text("dict")["blocks"]:
        if "lines" not in b:
            continue
        for l in b["lines"]:
            text = "".join(s["text"] for s in l["spans"])
            if not text.strip():
                continue
            x0, y0, x1, y1 = l["bbox"]
            lines.append({"x0": x0, "y0": y0, "x1": x1, "y1": y1, "text": text})
    return lines


def detect_page_labels(lines):
    """페이지 좌상단(x~21-29) 세로쓰기 라벨: 등급/품사/장번호."""
    label_chars = sorted(
        (l for l in lines if 15 <= l["x0"] <= 32 and l["y0"] < 100),
        key=lambda l: l["y0"],
    )
    joined = "".join(l["text"] for l in label_chars)
    level = next((lv for lv in LEVEL_LABELS if lv in joined), None)
    pos = next((p for p in sorted(POS_LABELS, key=len, reverse=True) if p in joined), None)
    stripped = joined.replace(level or "", "").replace(pos or "", "")
    chapter_match = re.search(r"\d+", stripped)
    chapter_no = int(chapter_match.group()) if chapter_match else None
    return level, pos, chapter_no


def is_headword_line(line):
    return line["text"].startswith(" ") and len(line["text"].strip()) <= 20 and 150 <= line["x0"] <= 650


def parse_half(lines, jeju_x_range, std_x_range):
    jeju_lines = sorted((l for l in lines if jeju_x_range[0] <= l["x0"] <= jeju_x_range[1]), key=lambda l: l["y0"])
    std_lines = sorted((l for l in lines if std_x_range[0] <= l["x0"] <= std_x_range[1]), key=lambda l: l["y0"])

    entries = []
    current = None
    for l in std_lines:
        if is_headword_line(l):
            if current:
                entries.append(current)
            current = {"standard_raw": l["text"].strip(), "y0": l["y0"], "def_lines": []}
        elif current is not None:
            current["def_lines"].append(l["text"].strip())
    if current:
        entries.append(current)

    for i, e in enumerate(entries):
        y_start = e["y0"] - 8
        y_end = entries[i + 1]["y0"] - 8 if i + 1 < len(entries) else 1e9
        e["jeju_forms"] = [jl["text"].strip() for jl in jeju_lines if y_start <= jl["y0"] < y_end]
        e["jeju_forms"] = [f for f in e["jeju_forms"] if f]
        e["definition"] = " ".join(e.pop("def_lines"))
        del e["y0"]

    return entries


def parse_page(doc, pno):
    page = doc[pno]
    lines = get_lines(page)
    level, pos, chapter_no = detect_page_labels(lines)

    content_lines = [
        l for l in lines
        if not (l["x0"] < 32 and l["y0"] < 100)
        and not (l["x0"] > 820 and l["y0"] < 100)
        and not (l["y0"] < 15 or l["y0"] > 560)
    ]
    left_half = [l for l in content_lines if l["x0"] < 400]
    right_half = [l for l in content_lines if l["x0"] >= 400]

    left_entries = parse_half(left_half, jeju_x_range=(30, 130), std_x_range=(150, 400))
    right_entries = parse_half(right_half, jeju_x_range=(470, 570), std_x_range=(590, 820))

    for e in left_entries + right_entries:
        e["level"] = level
        e["pos"] = pos
        e["chapter_no"] = chapter_no
        e["pdf_page"] = pno

    return left_entries + right_entries


def parse_reverse_index(doc):
    index = {}
    for pno in REVERSE_INDEX_PAGES:
        for line in doc[pno].get_text().split("\n"):
            m = re.match(r"^([가-힣A-Za-z]+\d?)\s+(\d+)\s*$", line.strip())
            if m:
                index.setdefault(m.group(1), []).append(int(m.group(2)))
    return index


def build_entry_fields(entries):
    for i, e in enumerate(entries):
        e["id"] = f"jbv2025-{i + 1:04d}"
        e["contains_pua"] = any(PUA_RE.search(f) for f in e["jeju_forms"])
        m = re.match(r"^(\D+)(\d)$", e["standard_raw"])
        if m:
            base, homograph_no = m.group(1), int(m.group(2))
        else:
            base, homograph_no = e["standard_raw"], None
        e["standard"] = [s.strip() for s in base.split(",")]
        e["standard_homograph_no"] = homograph_no


def write_markdown(bundle, path):
    entries = sorted(
        bundle["entries"],
        key=lambda e: (LEVEL_ORDER.get(e["level"], 9), POS_ORDER.get(e["pos"], 9), e["chapter_no"] or 0, e["pdf_page"]),
    )
    lines = [
        "# 아보카, 제주어 기본어휘 (제주학총서 84) — 추출본",
        "",
        f"- 출처: {bundle['source']['title']} · {bundle['source']['publisher']} · {bundle['source']['publishedDate']}",
        f"- 저자: {', '.join(bundle['source']['authors'])} · ISBN {bundle['source']['isbn']}",
        f"- {bundle['source']['note']}",
        "",
        f"- 추출 {bundle['extraction']['totalExtracted']}개 / 공식 표기 총 {bundle['extraction']['claimedTotal']}개",
        f"- **주의(수량)**: {bundle['extraction']['coverageCaveat']}",
        f"- **주의(PUA 문자)**: {bundle['extraction']['puaCaveat']}",
        "",
        "---",
        "",
    ]
    cur_level = cur_pos = None
    for e in entries:
        if e["level"] != cur_level:
            cur_level = e["level"]
            cur_pos = None
            lines.append(f"## {cur_level}")
            lines.append("")
        if e["pos"] != cur_pos:
            cur_pos = e["pos"]
            lines.append(f"### {cur_pos}")
            lines.append("")
        pua_mark = " ⚠PUA" if e["contains_pua"] else ""
        forms = ", ".join(e["jeju_forms"]) if e["jeju_forms"] else "(형태 없음)"
        standard = ", ".join(e["standard"])
        hn = f"({e['standard_homograph_no']})" if e["standard_homograph_no"] else ""
        lines.append(f"- **{forms}**{pua_mark} → {standard}{hn}: {e['definition']} `[{e['id']}, p.{e['pdf_page']}]`")
    path.write_text("\n".join(lines), encoding="utf-8")


def main():
    if not PDF_PATH.exists():
        sys.exit(f"원본 PDF가 없습니다: {PDF_PATH}")
    doc = fitz.open(str(PDF_PATH))

    entries = []
    for pno in MAIN_CONTENT_PAGES:
        entries.extend(parse_page(doc, pno))
    build_entry_fields(entries)

    reverse_index = parse_reverse_index(doc)
    pua_count = sum(1 for e in entries if e["contains_pua"])

    bundle = {
        "source": {
            "title": "아보카, 제주어 기본어휘 (제주학총서 84)",
            "publisher": "제주특별자치도 제주학연구센터",
            "authors": ["권미소", "김미진", "고지연", "김보향", "신우봉", "허원영", "장정민"],
            "publishedDate": "2025-12-31",
            "isbn": "979-11-995729-6-6(93700)",
            "note": (
                "2025 교육발전특구 지원 사업 <제주어 교육과정 개발 연구>의 기초 자료를 바탕으로 "
                "구술 말뭉치 빈도 분석·기존 교재 검토·전문가 자문을 거쳐 선정한 1,500개 교육용 "
                "제주어 기본어휘(초급/중급/고급 3단계, 품사별). 비매품/무료, 제주학연구센터 발행."
            ),
        },
        "extraction": {
            "method": (
                "PDF 좌표 기반 2단(각 페이지 좌/우 반쪽 = 책의 서로 다른 두 쪽) 파싱. "
                "제주어 형태 칸과 표준어 표제어+뜻풀이 칸을 x좌표로 나누고, "
                "y좌표 인접성으로 제주어 형태를 해당 표제어에 대응시켰다."
            ),
            "totalExtracted": len(entries),
            "claimedTotal": 1500,
            "coverageCaveat": (
                f"책이 밝힌 총 어휘 수는 1,500개이나 이번 추출은 {len(entries)}개만 확보했다 "
                "(공식 목차상 초급 450 / 중급·고급 나머지). 중급·고급의 대명사·관형사·의존명사·"
                "감탄사·수사처럼 항목 수가 적은 품사 몇 개가 페이지 레이아웃 인식 문제로 "
                "빠졌을 가능성이 있다 — 표준어로 찾아보는 기본어휘(역인덱스) 쪽 페이지 번호와 "
                "대조하면 빠진 항목을 찾을 수 있다."
            ),
            "puaCaveat": (
                f"{pua_count}개 항목(주로 동사·형용사)의 제주어 형태에 PUA(유니코드 사용자 영역, "
                "U+E000–F8FF) 문자가 섞여 있다. 이 사전이 쓰는 폰트가 아래아(ㆍ) 등 옛한글 자모를 "
                "전용 글리프로 표시해서 생기는, 이 프로젝트에서 이미 확인된 한계다 "
                "(data/dictionary/README.md, content/README-life-dialect.md 참고) — 공개된 "
                "유니코드 변환표가 없어 원문 그대로 보존했다. contains_pua: true인 항목은 "
                "사람이 원본 PDF를 보고 직접 확인해야 한다."
            ),
        },
        "entries": entries,
        "reverseIndex": reverse_index,
    }

    JSON_OUT.write_text(json.dumps(bundle, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    write_markdown(bundle, MD_OUT)
    print(f"항목 {len(entries)}개(PUA 포함 {pua_count}개), 역인덱스 {len(reverse_index)}개")
    print(f"저장: {JSON_OUT}")
    print(f"저장: {MD_OUT}")


if __name__ == "__main__":
    main()
