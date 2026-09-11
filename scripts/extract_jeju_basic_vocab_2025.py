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

## 2단계(2026-09-11) 수정 경위 — docs/basic-vocab-2025-extractor-audit.md,
## docs/basic-vocab-2025-extractor-fix.md 참고

1차 감사에서 구조적 원인 2개를 확정하고 이번에 고쳤다:

1. **표준어 대응이 없는 제주 고유어 병합 문제.** 이 책은 일러두기(p.9)에서
   밝히듯 '오름'·'정낭'·'빙떡'처럼 일대일 대응 표준어가 없는 제주 고유
   문화 어휘를 표준어 칸에 짧은 헤드워드 줄 없이 **정의문만** 싣는다.
   옛 코드는 표준어 칸에서 헤드워드 스타일(짧고 앞에 공백) 줄만 새
   entry의 시작으로 인식했기 때문에, 이런 항목은 새 entry를 못 만들고
   직전 entry의 정의·제주어형에 통째로 흡수됐다(빛+빙떡, 사람+삼춘,
   혀+셋딸+셋아덜, 송편+숨비소리, 오빠+오름+올레 등).
   **고친 방법**: 표준어 칸 줄 사이의 y좌표 간격을 측정해보면, 같은
   entry 안의 연속 줄(문장 이어짐, 번호 매긴 뜻풀이 등)은 간격이
   1~6pt인 반면, 다음 entry로 넘어가는 지점은 항상 37~40pt다(헤드워드가
   있든 없든 동일 — 책이 entry 사이에 고정된 여백을 둔다). 그래서 이제
   `parse_half()`는 "헤드워드 스타일 줄" 뿐 아니라 "이전 줄과의 간격이
   `NEW_BLOCK_GAP_PT`(15pt, 실측 간격 두 군집 사이 안전 여유)를 넘는
   줄"도 새 entry(블록)의 시작으로 인식한다. 헤드워드가 없는 블록은
   `standard_raw: null`, `has_standard_equivalent: false`로 정직하게
   표시하고, 표준어를 지어내지 않는다.

2. **우측 반쪽 품사/등급 라벨을 아예 안 읽던 문제.** 옛 `detect_page_labels()`는
   페이지 왼쪽 여백(x 15~32)의 세로쓰기 라벨만 읽고, 그 결과를 좌/우
   반쪽 entry 전부에 동일하게 적용했다. 그런데 이 책은 페이지의 좌/우
   반쪽이 서로 다른 품사 챕터일 수 있고, 그때는 **오른쪽 여백에 별도
   라벨**이 인쇄된다(옛 코드는 우측 여백을 아예 안 읽었다). 게다가 새
   챕터가 시작되는 반쪽의 제주어 칸 맨 위에는 `"4. 수사"`처럼 챕터
   번호+품사명이 인라인으로도 한 번 더 찍힌다(더 정밀한 y좌표 신호).
   **고친 방법**: 좌/우 여백 라벨을 각각 따로 읽고(`read_margin_label`),
   반쪽 안의 인라인 "N. 품사" 마커(`find_inline_pos_markers`)가 있으면
   그 y좌표를 우선해 그 지점부터 품사를 바꾼다. 마커가 없으면 그 반쪽
   전용 여백 라벨을, 그것도 없으면 직전 상태를 그대로 이어간다(문서
   전체를 책 읽는 순서로 순회하며 상태를 들고 다닌다).

이 두 수정 다 "알려진 오류 단어를 하드코딩으로 예외 처리"하는 방식이
아니라 **좌표 구조 자체를 다시 읽는** 방식이다. 알려진 오류 사례는
`scripts/extract_jeju_basic_vocab_2025.test.mjs`(node --test)의 회귀
fixture로만 쓴다.

알려진 남은 한계는 data/jeju-basic-vocab-2025/README.md 참고 — 특히:
  - 동사·형용사 항목 다수가 PUA(유니코드 사용자 영역) 문자를 포함
    (아래아 등 옛한글 자모, 공개된 변환표 없음 — 원문 그대로 보존).
    이번 수정은 entry 경계·품사 로직만 건드렸고 PUA 처리는 그대로다.
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

# 실측: 같은 entry 안 연속 줄(문장 이어짐, 번호 매긴 뜻풀이)의 y좌표
# 간격은 1~6pt, 다음 entry로 넘어가는 지점은 37~40pt였다(빛/빙떡, 사람/
# 삼춘, 송편/숨비소리, 오빠/오름/올레 등 실제 병합 사례로 직접 측정).
# 두 군집 사이 안전한 여유를 두고 15pt로 잡는다.
NEW_BLOCK_GAP_PT = 15.0

LEFT_MARGIN_X = (15, 35)
RIGHT_MARGIN_X = (805, 860)
LEFT_JEJU_X = (30, 130)
LEFT_STD_X = (150, 400)
RIGHT_JEJU_X = (470, 570)
RIGHT_STD_X = (590, 820)

INLINE_POS_MARKER_RE = re.compile(r"^(\d+)\.\s*([가-힣]+)$")

# 등급이 바뀔 때(초급→중급, 중급→고급) 본문 칸 한복판에 찍히는 구간 구분
# 표지 텍스트("중급", "기본어휘500개", "1. 명사(215개)" 같은 개수 병기 목록).
# 실제 사전 항목이 아니므로 entry로 만들지 않고 통째로 걸러낸다 — 위에서
# 쓰는 'N. 품사명'(괄호 없음) 인라인 챕터 마커와는 정규식으로 구분된다.
LEVEL_DIVIDER_RE = re.compile(
    r"^(초급|중급|고급)$"
    r"|^기본어휘(\d+개)?$"
    r"|^\d+개$"
    r"|^\d+\.\s*[가-힣]+\(\d+개\)$"
    r"|^표준어로 찾아보는\s*$"
)


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


def read_margin_label(raw_lines, x_range):
    """페이지 여백(좌 또는 우, x_range로 지정)의 세로쓰기 라벨 하나를 읽는다.

    반환: (level, pos, chapter_no) — 못 읽으면 각각 None.
    """
    label_chars = sorted(
        (l for l in raw_lines if x_range[0] <= l["x0"] <= x_range[1] and l["y0"] < 100),
        key=lambda l: l["y0"],
    )
    joined = "".join(l["text"] for l in label_chars)
    level = next((lv for lv in LEVEL_LABELS if lv in joined), None)
    pos = next((p for p in sorted(POS_LABELS, key=len, reverse=True) if p in joined), None)
    stripped = joined.replace(level or "", "").replace(pos or "", "")
    chapter_match = re.search(r"\d+", stripped)
    chapter_no = int(chapter_match.group()) if chapter_match else None
    return level, pos, chapter_no


def find_inline_pos_markers(half_lines, jeju_x_range):
    """반쪽 제주어 칸 안에 찍히는 'N. 품사명' 인라인 챕터 시작 마커들.

    페이지 여백 라벨과 별개로, 새 품사 챕터가 시작되는 정확한 y좌표를
    알려주는 더 정밀한 신호다(예: 우측 반쪽 맨 위 '4. 수사'). 반환은
    y0 오름차순 [(y0, pos, chapter_no), ...].
    """
    hits = []
    for l in half_lines:
        if not (jeju_x_range[0] <= l["x0"] <= jeju_x_range[1]):
            continue
        m = INLINE_POS_MARKER_RE.match(l["text"].strip())
        if m and m.group(2) in POS_LABELS:
            hits.append((l["y0"], m.group(2), int(m.group(1))))
    return sorted(hits)


def is_headword_line(line):
    return line["text"].startswith(" ") and len(line["text"].strip()) <= 20


def parse_half(std_lines, jeju_lines):
    """표준어 칸 줄들을 entry 블록으로 나누고, 제주어 칸을 y구간으로 배정한다.

    새 블록은 (a) 헤드워드 스타일 줄이거나 (b) 이전 줄과의 간격이
    NEW_BLOCK_GAP_PT를 넘을 때 시작한다. (b)만 해당하고 헤드워드가
    아니면 이 책의 "표준어 대응 없음" 항목이다 — 표준어를 지어내지
    않고 정직하게 표시한다.

    참고: "표준어 없음" 블록 중 일부는 "1) ... 2) ..."처럼 번호 매긴
    뜻풀이 여러 개 + 제주어형 여러 개가 한 블록에 함께 들어간다(예:
    사마귀를 뜻하는 '주와기'와 손톱으로 할퀴는 사람을 뜻하는 '줴기'가
    같은 블록에 묶임, p.107). 표준어 칸 줄 간격만으로는 이걸 서로 다른
    entry로 쪼갤 근거가 없다(문장 이어짐과 같은 1~6pt 간격) — 그리고
    "번호+제주어형 개수 일치 시 분리"를 시도해보면 오히려 같은 패턴의
    진짜 다의어/변이형 항목(예: "덤방다/덤벙다"='무성하다·이슬 맺히다'
    한 단어의 두 뜻, "자락/잘락"='밀치다·오줌 나오다' 한 의태어의 두
    뜻)까지 갈라져서 공식 품사별 개수(고급 형용사 100, 부사 65 등)와
    어긋난다 — 이 책은 그런 경우를 **한 entry**로 세고 있다는 뜻이다.
    좌표 구조만으로는 "사마귀/줴기"류(진짜 다른 두 단어)와
    "덤방다/덤벙다"류(한 단어의 두 뜻)를 구분할 신호가 없으므로,
    의미 판단 없이는 더 쪼개지 않는다(원칙 5-3: entry 경계는 좌표로만
    판단, 억지로 갈랐다가 공식 개수와 어긋나면 잘못된 것).
    """
    std_lines = sorted(std_lines, key=lambda l: l["y0"])
    jeju_lines = sorted(jeju_lines, key=lambda l: l["y0"])

    blocks = []
    current = None
    prev_y1 = None
    for l in std_lines:
        text = l["text"].strip()
        gap = l["y0"] - prev_y1 if prev_y1 is not None else None
        headword = is_headword_line(l)
        starts_new_block = current is None or headword or (gap is not None and gap > NEW_BLOCK_GAP_PT)
        if starts_new_block:
            if current:
                blocks.append(current)
            if headword:
                current = {"standard_raw": text, "def_lines": [], "y_start": l["y0"]}
            else:
                current = {"standard_raw": None, "def_lines": [text], "y_start": l["y0"]}
        else:
            current["def_lines"].append(text)
        prev_y1 = l["y1"]
    if current:
        blocks.append(current)

    for i, b in enumerate(blocks):
        y_start = b["y_start"] - 8
        y_end = blocks[i + 1]["y_start"] - 8 if i + 1 < len(blocks) else 1e9
        b["jeju_forms"] = [jl["text"].strip() for jl in jeju_lines if y_start <= jl["y0"] < y_end]
        b["jeju_forms"] = [f for f in b["jeju_forms"] if f]
        b["definition"] = " ".join(b.pop("def_lines"))
        # y_start는 assign_chapters가 인라인 마커와 대조하는 데 쓴다 — 마지막에 지운다.

    return blocks


def assign_chapters(blocks, markers, state):
    """블록마다 (level, pos, chapter_no)를 배정하고 state를 갱신한다.

    블록은 이미 y 오름차순이다(parse_half가 std_lines를 y순으로 훑어
    만듦). 인라인 마커가 있으면 그 y좌표를 지난 블록부터 새 품사를
    적용한다(같은 반쪽 안에서 품사가 바뀌는 경우). 마커가 없으면 이
    반쪽 진입 시점의 state를 그대로 쓴다 — state는 이미 이 반쪽의
    여백 라벨로 갱신된 뒤다(parse_page_halves 참고).
    """
    marker_idx = 0
    for b in blocks:
        while marker_idx < len(markers) and b["y_start"] >= markers[marker_idx][0]:
            state["pos"] = markers[marker_idx][1]
            state["chapter_no"] = markers[marker_idx][2]
            marker_idx += 1
        b["level"] = state["level"]
        b["pos"] = state["pos"]
        b["chapter_no"] = state["chapter_no"]
        del b["y_start"]


def parse_page_halves(doc, pno, state):
    page = doc[pno]
    raw_lines = get_lines(page)

    content_lines = [
        l for l in raw_lines
        if not (l["x0"] < 32 and l["y0"] < 100)
        and not (l["x0"] > 820 and l["y0"] < 100)
        and not (l["y0"] < 15 or l["y0"] > 560)
        and not LEVEL_DIVIDER_RE.match(l["text"].strip())
    ]
    left_content = [l for l in content_lines if l["x0"] < 400]
    right_content = [l for l in content_lines if l["x0"] >= 400]

    halves = [
        (left_content, LEFT_MARGIN_X, LEFT_JEJU_X, LEFT_STD_X),
        (right_content, RIGHT_MARGIN_X, RIGHT_JEJU_X, RIGHT_STD_X),
    ]

    page_entries = []
    for half_content, margin_x, jeju_x, std_x in halves:
        m_level, m_pos, m_chapter = read_margin_label(raw_lines, margin_x)
        if m_level:
            state["level"] = m_level
        if m_pos and not find_inline_pos_markers(half_content, jeju_x):
            # 이 반쪽에 인라인 마커가 없으면 여백 라벨을 그대로 쓴다.
            state["pos"] = m_pos
            if m_chapter is not None:
                state["chapter_no"] = m_chapter

        jeju_lines = [l for l in half_content if jeju_x[0] <= l["x0"] <= jeju_x[1]]
        std_lines = [l for l in half_content if std_x[0] <= l["x0"] <= std_x[1]]
        markers = find_inline_pos_markers(half_content, jeju_x)

        blocks = parse_half(std_lines, jeju_lines)
        assign_chapters(blocks, markers, state)

        for b in blocks:
            b["pdf_page"] = pno
        page_entries.extend(blocks)

    return page_entries


def parse_reverse_index(doc):
    index = {}
    for pno in REVERSE_INDEX_PAGES:
        for line in doc[pno].get_text().split("\n"):
            m = re.match(r"^([가-힣A-Za-z]+\d?)\s+(\d+)\s*$", line.strip())
            if m:
                index.setdefault(m.group(1), []).append(int(m.group(2)))
    return index


PUA_GLYPH_MAPPING_PATH = ROOT / "data/jeju-basic-vocab-2025/pua-glyph-mapping.json"


def load_high_confidence_pua_map():
    """이전 라운드(README-pua-mapping*.md)에서 이미 사람이 확정한 PUA→옛한글
    복원표 중 confidence: "high"인 것만 불러온다. medium/low는 아직 미확정
    이므로(재검토 필요) 이번 parser 재구성에서 건드리지 않는다 — entry
    구조 수정과 PUA 판독 문제를 섞지 않는다는 원칙."""
    if not PUA_GLYPH_MAPPING_PATH.exists():
        return {}
    mapping = json.loads(PUA_GLYPH_MAPPING_PATH.read_text(encoding="utf-8"))
    return {
        m["pua"].replace("U+", "\\u").encode().decode("unicode_escape"): m["reading"]
        for m in mapping
        if m["confidence"] == "high" and m["reading"]
    }


def apply_high_confidence_pua(text, pua_map):
    if not text:
        return text
    for pua_char, reading in pua_map.items():
        text = text.replace(pua_char, reading)
    return text


def restore_known_pua(entries, pua_map):
    """이미 확정된(high) PUA 복원을 재추출 결과에 다시 적용한다. 재추출은
    PDF 원문을 다시 읽으므로 이 복원을 적용하지 않으면 이전 라운드에서
    사람이 이미 확정해 둔 표기가 도로 PUA 문자로 되돌아간다."""
    if not pua_map:
        return
    for e in entries:
        e["jeju_forms"] = [apply_high_confidence_pua(f, pua_map) for f in e["jeju_forms"]]
        e["definition"] = apply_high_confidence_pua(e["definition"], pua_map)
        if e["standard_raw"]:
            e["standard_raw"] = apply_high_confidence_pua(e["standard_raw"], pua_map)


def build_entry_fields(entries):
    for i, e in enumerate(entries):
        e["id"] = f"jbv2025-{i + 1:04d}"
        e["contains_pua"] = (
            any(PUA_RE.search(f) for f in e["jeju_forms"])
            or bool(PUA_RE.search(e["definition"]))
            or bool(e["standard_raw"] and PUA_RE.search(e["standard_raw"]))
        )
        if e["standard_raw"] is None:
            e["standard"] = []
            e["standard_homograph_no"] = None
            e["has_standard_equivalent"] = False
            continue
        e["has_standard_equivalent"] = True
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
        if e["has_standard_equivalent"]:
            standard = ", ".join(e["standard"])
            hn = f"({e['standard_homograph_no']})" if e["standard_homograph_no"] else ""
            target = f"{standard}{hn}"
        else:
            target = "(표준어 대응 없음 — 제주 고유어)"
        lines.append(f"- **{forms}**{pua_mark} → {target}: {e['definition']} `[{e['id']}, p.{e['pdf_page']}]`")
    path.write_text("\n".join(lines), encoding="utf-8")


def main():
    if not PDF_PATH.exists():
        sys.exit(f"원본 PDF가 없습니다: {PDF_PATH}")
    doc = fitz.open(str(PDF_PATH))

    state = {"level": None, "pos": None, "chapter_no": None}
    entries = []
    for pno in MAIN_CONTENT_PAGES:
        entries.extend(parse_page_halves(doc, pno, state))
    restore_known_pua(entries, load_high_confidence_pua_map())
    build_entry_fields(entries)

    reverse_index = parse_reverse_index(doc)
    pua_count = sum(1 for e in entries if e["contains_pua"])
    no_std_count = sum(1 for e in entries if not e["has_standard_equivalent"])

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
                "표준어 칸 줄 사이 y간격(연속 문장 1~6pt vs 새 entry 37~40pt)으로 entry 경계를 "
                "판단해, 표준어 대응이 없는 제주 고유어(헤드워드 줄 없이 정의문만 있는 경우)도 "
                "독립 entry로 분리한다. 품사·등급은 반쪽별 여백 라벨과 반쪽 안 'N. 품사명' 인라인"
                "마커를 함께 읽어 좌/우 반쪽이 다른 챕터여도 정확히 배정한다."
            ),
            "totalExtracted": len(entries),
            "claimedTotal": 1500,
            "noStandardEquivalentCount": no_std_count,
            "coverageCaveat": (
                f"이번 추출은 {len(entries)}개(공식 1,500개 대비). 상세 수량·품사별 비교는 "
                "docs/basic-vocab-2025-extractor-fix.md 참고."
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
    print(f"항목 {len(entries)}개(PUA 포함 {pua_count}개, 표준어 대응 없음 {no_std_count}개), 역인덱스 {len(reverse_index)}개")
    print(f"저장: {JSON_OUT}")
    print(f"저장: {MD_OUT}")


if __name__ == "__main__":
    main()
