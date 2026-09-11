# 아보카, 제주어 기본어휘 (제주학총서 84, 2025)

제주특별자치도 **제주학연구센터**가 2025년 발행한 공식 교육용 제주어
기본어휘 자료집. 사용자가 PDF를 업로드해서 받았다. 2025 교육발전특구
지원 사업 <제주어 교육과정 개발 연구>의 기초 자료를 바탕으로 **구술
말뭉치 빈도 분석**, 기존 교재 검토, 전문가 자문을 거쳐 선정한
1,500개 교육용 어휘를 초급/중급/고급 3단계 × 품사별로 정리했다.
비매품/무료, ISBN 979-11-995729-6-6(93700).

`scripts/audit-word-usage.mjs`가 지금 쓰는 AI Hub 말뭉치·생활방언
100편과는 다른, **세 번째 독립 자료원**이다. 그것들보다 최신이고
(2025년 발행), 구술 말뭉치 빈도까지 반영해 골랐다는 점에서 신뢰도가
높다.

## 파일

```
data/jeju-basic-vocab-2025/
  README.md     이 파일
  source.pdf    원본 PDF (사용자 업로드, 159쪽)
  vocab.json    추출한 구조화 데이터 (아래 스키마)
  vocab.md      사람이 읽기 좋은 등급·품사별 목록
```

다시 뽑으려면:

```bash
pip install pymupdf   # 이 환경의 시스템 cryptography가 깨져 있으면
                       # 가상환경에 설치해야 할 수 있다
python scripts/extract_jeju_basic_vocab_2025.py
```

## vocab.json 스키마

```jsonc
{
  "source": { "title": ..., "publisher": ..., "authors": [...], "publishedDate": ..., "isbn": ..., "note": ... },
  "extraction": { "method": ..., "totalExtracted": 1501, "claimedTotal": 1500, "noStandardEquivalentCount": 246, "coverageCaveat": ..., "puaCaveat": ... },
  "entries": [
    {
      "id": "jbv2025-0001",
      "standard_raw": "다리1",           // 책 원문 그대로(동형이의어 번호 포함)
      "standard": ["다리"],              // 쉼표로 나열된 동의어를 배열로 분리
      "standard_homograph_no": 1,        // 있으면 숫자, 없으면 null
      "jeju_forms": ["가달"],            // 이 개념에 대응하는 제주어 형태(복수 가능)
      "definition": "...",               // 뜻풀이(여러 뜻은 "1) ... 2) ..."로 이어붙임)
      "level": "초급",                   // 초급/중급/고급
      "pos": "명사",                     // 품사
      "chapter_no": 1,                   // 품사 내 장 번호
      "pdf_page": 8,                     // 0-based PDF 페이지 인덱스(source.pdf 기준)
      "contains_pua": false,             // 제주어형/뜻풀이/표준어 표기에 PUA 문자가 남아있는지
      "has_standard_equivalent": true,   // false면 일대일 대응 표준어가 없는 제주 고유어(오름 등) — standard_raw는 null, standard는 []
      "sourceLocator": { "document": "jeju-basic-vocab-2025", "pdfPage": 8, "half": "left", "yStart": 86.6 }, // PDF 안에서 이 entry를 찾은 위치(provenance, 미세하게 바뀔 수 있음)
      "stableId": "jbv2025-p008l-y00866" // 영구 참조용 id — 다른 데이터는 "id"(순번) 대신 이걸 참조할 것. stable-id-registry.json에 영구 보존됨(3B-1A, docs/basic-vocab-2025-stable-id-production.md 참고)
    }
  ],
  "reverseIndex": { "가까이": [190], "가깝다1": [79], ... }  // 표준어 → 책 쪽번호(가나다순 부록)
}
```

## 추출 방법과 알려진 한계 — 반드시 읽을 것

PDF는 텍스트를 선형으로 뽑으면 열(제주어 형태 칸과 표준어+뜻풀이 칸)이
뒤섞여 나온다. `scripts/extract_jeju_basic_vocab_2025.py`는 PyMuPDF로
각 텍스트 줄의 좌표를 읽어, x좌표로 칸을 나누고 y좌표 인접성으로
제주어 형태를 표제어에 대응시켰다. PDF 한 쪽이 실제로는 책의 서로 다른
두 쪽(좌/우 반쪽)을 담고 있다는 것도 확인해서 반영했다.

**1) [2026-09-11 수정 완료] 1,500개 중 1,255개만 추출되던 문제 —
지금은 1,501개.** 원인 2가지를 구조적으로 고쳤다: (a) 일대일 대응
표준어가 없는 제주 고유어(오름·정낭·빙떡 등)가 헤드워드 줄 없이
정의문만 인쇄돼 직전 entry에 흡수되던 문제, (b) 우측 반쪽 품사/등급
여백 라벨을 아예 안 읽어서 좌/우 반쪽이 다른 챕터면 통째로 잘못
분류되던 문제. 자세한 경위·검증 결과는
`docs/basic-vocab-2025-extractor-fix.md` 참고. **알려진 잔여
불일치 1건**(고급/명사 266 vs 공식 265, 원인 미확정)이 남아 있다 —
같은 문서에 기록.

**2) [2026-09-11 부분 해결] PUA(유니코드 사용자 영역, U+E000–F8FF)
문자.** 이전 라운드(`README-pua-mapping*.md`)에서 사람이 눈으로
확정한 81개 중 58개(confidence: high)는 이제 `scripts/extract_jeju_basic_vocab_2025.py`가
재추출할 때마다 자동으로 다시 적용한다(`pua-glyph-mapping.json`
참고) — 재추출 후 PUA 포함 entry는 59개(이전 57개와 비슷한 수준).
medium 16개·low 7개는 아직 미확정이라 원문 그대로 남아 있다. 이 책이
쓰는 폰트가 아래아(ㆍ) 같은 옛한글 자모를 전용 글리프로 그려서 생기는
문제로, `data/dictionary/`·`data/life-dialect/`에서 이미 겪은 것과
같다. `contains_pua: true`인 항목은 화면에 깨져 보이거나 안 보일 수
있고, 정확한 표기를 알려면 `source.pdf`를 직접 열어 확인해야 한다.

**3) 이 데이터는 아직 앱 파이프라인(`content/`, `scripts/audit-word-usage.mjs`)에
연결하지 않았다.** 지금은 참고 자료로만 저장소에 있다. 재추출된
1,501개를 아직 `content/lexemes.json`에 자동 반영하지 않았다 — 기존
1,058개(391 유지+667 신규)는 옛 추출(1,255개 버전)의 `jbv2025-XXXX`
id를 참조하는데, 재추출로 id가 크게 흔들려서(아래 "ID 안정성" 참고)
그대로 자동 대조하면 안 된다. **[2026-09-11, 3A/3A.1단계에서 완료]**
655건 전수를 새 1,501개 원장과 대조·분류했다(자동 마이그레이션 가능
582건, bookId 매핑은 가능하나 품사 스키마 정책 결정 필요 42건, 병합
오염 정리 필요 31건, 대응 없음 0건) — `docs/basic-vocab-2025-stable-id-design.md`와
`content-migration-mapping-3a.json` 참고. corrected 초중급 950개 중
현재 content에 없는 항목도 앱에 추가 가능한 신규 lexeme 후보 71개
(`content-new-candidates-3a.json`)와 원자료 자체의 제주어형 공백
1건(`content-source-gaps-3a.json`, `jbv2025-0146`="옆")으로 구분해
정리했다. **[2026-09-11, 3B-1A에서 완료]** entry마다 `stableId`/
`sourceLocator`가 추가됐고(`stable-id-registry.json`에 영구
보존, `docs/basic-vocab-2025-stable-id-production.md` 참고), 위
3A/3A.1 산출물의 stableId가 전부 이 값과 일치함을 확인했다. **아직
`content/lexemes.json`의 655개 `bookMeta.bookId`는 바꾸지 않았다**
(3B-1B에서 진행 예정).
1,000단어 실사용 감사에 세 번째 근거로 넣으려면:
- `entries[].jeju_forms`를 `content/lexemes.json`의 표제어와 대조(정확
  일치 + 활용형, `scripts/audit-word-usage.mjs`의 동형이의어 방지
  로직을 그대로 재사용)
- 대조 결과를 `word-usage-audit.json`에 세 번째 근거 필드로 추가
- 표기가 다른데 뜻이 같은 경우(변이형)는 `entries[].standard`와
  `entries[].definition`으로 뜻을 먼저 확인한 뒤 수동 검토

## 사용 시 주의

- 비매품/무료 공공 자료이지만, 저작권자는 제주학연구센터다. 재배포·가공
  범위는 명시된 라이선스 문구가 없어 확인이 필요하다 — 지금은 이
  저장소(비공개 개발용)에만 둔다.
- `reverseIndex`의 쪽번호는 **책 내부 페이지 번호**(표지 기준)이지
  `source.pdf`의 PDF 페이지 인덱스가 아니다. PDF 페이지 인덱스로
  환산하려면 대략 `(책_페이지 + 6) // 2`(front matter 오프셋 + 한
  PDF쪽에 책 두쪽) 정도지만 정확히 검증하지 않았다.
