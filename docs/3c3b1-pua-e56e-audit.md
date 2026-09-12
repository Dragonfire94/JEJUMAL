# 3C-3B.1 — Culture 후보 `U+E56E` PUA 단일 글리프 감사

> 이 문서는 **조사·판정 전용**이다. `pua-glyph-mapping.json`,
> `vocab.json`, `content/culture-items.json`(아직 없음), main
> lexeme/unit — 어느 것도 이번 단계에서 수정하지 않는다. 대상은
> 오직 `U+E56E` 하나이며, 다른 medium/low confidence PUA는 범위 밖이다.
> PR #13(3C-3B)은 이 단계 시작 전에 검증 후 병합했다.

## PR #13 검증

| 항목 | 기대값 | 실제값 | 일치 |
| --- | --- | --- | --- |
| state | open | open | ✅ |
| mergeable | true | `mergeable_state: clean` | ✅ |
| head sha | `a7582cde173077f83b675190d45320c353b68eaf` | `a7582cde173077f83b675190d45320c353b68eaf` | ✅ |
| commits | 1 | 1 | ✅ |
| changed files | 2개(docs/3c3b-culture-track-contract.md, data/jeju-basic-vocab-2025/culture-track-proposal-3c3b.json) | 정확히 그 2개 | ✅ |

전부 일치해 **PR #13을 merge**했다(merge commit
`c9339863f59548fb70e0e2ed96dba5b62fcfca74`). `main`을 fetch +
`--ff-only`로 동기화하고 `codex/3c3b1-pua-e56e-audit` 브랜치를 새로
팠다.

## 1. Target 고정

```text
PUA: U+E56E
sourceStableId: jbv2025-p063l-y00581
legacySourceId: jbv2025-0540
definition: 돼지고기를 삶은 육수에 불린 모자반을 넣어 끓인 국.
level: 중급 / POS: 명사 / chapter_no: 1 / pdf_page: 63(0-based, doc[63])
```

## 2. Raw codepoint 재검증

`vocab.json`의 해당 entry `jeju_forms[0]`을 직접 codePointAt으로
재확인했다(화면에 보이는 "국"이라는 렌더링을 믿지 않음):

```text
문자열 길이: 2 codepoints
[0] U+E56E — PUA(Private Use Area, U+E000–F8FF 범위)
[1] U+AD6D — 정상 유니코드 완성형 음절 "국"
```

`vocab.json` 자체에도 이 항목은 이미 `contains_pua: true`로 표시돼
있었다(추출기가 PUA임을 인지는 하고 있었으나 매핑을 못한 상태).

## 3. Extraction pipeline 역추적

`sourceLocator: {pdfPage: 63, half: "left", yStart: 58.1}`를 이용해
`scripts/extract_jeju_basic_vocab_2025.py`의 좌표 규칙(`doc[pno]`,
0-based)대로 PDF를 직접 열어 같은 위치의 원문 word box를 재추출했다:

```text
PyMuPDF get_text("words")로 page index 63(=vocab.json의 pdf_page: 63)
좌측 절반, y≈58.1 부근을 검색한 결과:

bbox (42.5, 55.1, 70.1, 77.6) → 텍스트 "국" (block 3, line 1)
같은 줄(block 3, line 0)의 정의문: "돼지고기를 삶은 육수에 불린
모자반을 넣어 끓인 국." — vocab.json의 definition과 정확히 일치.
```

즉 원본 PDF 텍스트 레이어 자체가 이미 이 위치에 `U+E56E`를 담고
있다 — 이번 3A/3B 추출·수정 과정에서 새로 생긴 오류가 아니라, PDF
원본 폰트가 이 글리프에 대해서만 표준 유니코드 매핑(ToUnicode)을
갖지 않은 것으로 보인다(기존 81개 PUA와 같은 유형의 문제).

**기존 mapping에서 왜 빠졌는가**: `pua-glyph-mapping.json`은 3A
단계에서 "초중급 298개 표제어"를 스캔해 만든 81개 고유 glyph
목록이다. 이번 감사에서 `vocab.json` 전체를 다시 스캔한 결과
`U+E56E`는 **정확히 1회**(이 entry 하나)만 등장한다 — 발생 빈도가
매우 낮아 원래 스캔 모집단(신규 71개 후보를 뽑아낸 교정된 추출기의
산출물)에 포함되지 않았거나 그 시점에 다른 이유로 누락된 것으로
보인다. 이 문서에서는 "왜 빠졌는가"의 원인을 이 정도로만 기록하고,
mapping 파일 자체는 고치지 않는다(범위 밖).

## 4. Evidence

### 4.1 PDF glyph (source page 직접 렌더링)

12배·24배 확대 크롭을 직접 만들어 확인했다(`review-images/pua-e56e-crop-p63l.png`,
24배 크롭 저장):

```text
source page: data/jeju-basic-vocab-2025/source.pdf, page index 63(0-based)
bounding area: PDF 좌표 (42.5, 55.1) – (70.1, 77.6), 좌측 절반
```

글리프 구조(육안 확인, 24배 확대):

```text
위: 사각형(ㅁ 모양) 블록
중간: 채워진 점(아래아 ᆞ)
아래: 사각형(ㅁ 모양) 블록
```

이는 `README-pua-mapping.md`가 문서화한 기존 81개 PUA의 지배적
패턴("초성+아래아(+종성)")과 정확히 같은 형태 — **초성 ㅁ + 중성
아래아 + 종성 ㅁ**로 읽힌다.

### 4.2 기존 PUA mapping과의 glyph 비교

`pua-glyph-mapping.json`에는 `U+E56E` 항목이 없다(재확인, 81건 전체
`pua` 필드에서 검색해 없음을 확인). 다만 **같은 "ㅁ+아래아+ㅁ" 계열
패턴**을 가진 기존 high-confidence 항목이 다수 있어(예:
`ᄆᆞᆮ이`(맏이) 등 ㅁ초성 계열), 이 프로젝트의 PDF가 초성/종성을
독립된 사각형 블록으로, 아래아를 독립된 점으로 렌더링하는 폰트임을
다시 확인했다. "모양이 비슷하다"만으로 확정하지 않기 위해, 아래
4.3~4.4의 독립 근거로 교차검증했다.

### 4.3 공식/외부 자료 — 표제어의 실제 정체

`definition`(돼지고기 삶은 육수 + 불린 모자반 + 끓인 국)이 가리키는
음식명을 공식/신뢰 가능한 자료에서 조사했다(A-6 우선순위에 따라
공공/학술·백과 자료 확인):

- 위키백과 "몸국" 항목: "몸국(제주어: **ᄆᆞᆷ국**)은 제주도의 향토
  음식으로, 돼지고기를 삶아 얻은 국물에 모자반을 넣어 끓인 국이다.
  여기서 'ᄆᆞᆷ'은 모자반을 뜻하는 제주 방언이다." — **definition과
  단어 그대로 일치.**
- 같은 자료: "원래 표기는 아래아가 들어가서 'ᄆᆞᆷ국, ᄆᆞᆷ쿡'이지만,
  아래아의 입력이 힘들기에 보통 '몸국'이라고 한다." — **PDF가
  아래아를 그대로 보존해 인쇄했고, 우리가 지금 보고 있는 PUA가 바로
  그 아래아 표기라는 것과 정확히 부합.**
- 나무위키 문서 제목 자체가 `ᄆᆞᆷ국`(옛한글 원문 그대로)으로 등록돼
  있어, 이 표기가 실제로 통용되는 학술/백과 표기임을 뒷받침한다.

(출처: [몸국 - 위키백과](https://ko.wikipedia.org/wiki/%EB%AA%B8%EA%B5%AD),
[ᄆᆞᆷ국 - 나무위키](https://namu.wiki/w/%E1%84%86%E1%86%9E%E1%86%B7%EA%B5%AD))

블로그/카페 스니펫만으로 확정하지 않는다는 원칙에 따라, 위 두
근거는 **백과사전 문서 자체**를 근거로 삼았다(A-6 우선순위 4단계
"공공기관/학술 자료"에 준함 — 1~2단계인 제주도 공식 사전/제주학연구센터
사이트에서 "몸국" 단독 항목을 직접 확인하지는 못했으나, 정의·표기·
어원이 세 자료 모두 일치해 교차검증 강도는 충분하다고 판단한다).

### 4.4 저장소 내부 중복 증거 — AI Hub 말뭉치

`data/aihub/tokens.json`(제주어 토큰 → 표준어 매핑, 빈도 포함)에서
`몸` 관련 키를 전수 검색했다:

```text
"몸국"    → [["모자반국", 16]]
"몸국이지" → [["모자반국이지", 1]]
"몸국이랑" → [["몸국이나", 1], ["모자반국이랑", 1]]
"몸국이영" → [["몸국이랑", 3]]
"몸국이주" → [["몸국이지", 1]]
"몸국게"   → [["몸국말야", 1]]
"몸"      → [["모자반", 12], ["마음", 6], ["미역", 3], ["맘", 2], ["메밀", 1], ["마음에", 1]]
"몸을"    → [["메밀", 4], ["모자반을", 1]]
```

`"몸을"→"모자반을"`이 특히 결정적이다 — 2025 source definition의
"불린 **모자반을** 넣어"와 표현까지 정확히 겹친다. `몸`이 제주어에서
동음이의어(마음/미역/메밀/모자반)로 쓰이지만, "몸국" 복합어 문맥에서는
말뭉치가 **16회 전부** "모자반국"으로만 매핑해 애매성이 없다.

## 5. Candidate mappings

| candidate | codepoints | evidence for | evidence against |
| --- | --- | --- | --- |
| **ᄆᆞᆷ**(초성ㅁ+아래아+종성ㅁ) | U+1106, U+119E, U+11B7 | PDF glyph 구조 일치(4.1) + 위키백과/나무위키가 "몸국(ᄆᆞᆷ국)"의 원표기로 명시(4.3) + AI Hub "몸국"→"모자반국" 16회, "몸을"→"모자반을"(4.4) + definition 완전 일치 | 없음(모든 축이 수렴) |
| ᄆᆞᆼ(초성ㅁ+아래아+종성ㅇ) | U+1106, U+119E, U+11BC | 초성 유사 | 크롭에서 종성이 열린 원(ㅇ)이 아니라 닫힌 사각형(ㅁ)으로 뚜렷이 보임(4.1) — 시각적으로 기각. 외부 자료도 전부 "ᄆᆞᆷ"만 언급, "ᄆᆞᆼ" 표기는 어디에도 없음 |
| 종성 없는 ᄆᆞ + 별개 자모 | U+1106, U+119E, (jongseong 없음) | — | 크롭에 명확히 세 번째 사각형 블록(종성)이 보임 — 2-jamo만으로는 glyph 형태를 설명 못함 |

후보가 사실상 하나로 수렴하는 이유: PDF glyph 형태(닫힌 사각형×2 +
점)가 종성 있는 ㅁ-아래아-ㅁ 구조를 명확히 가리키고, 이와 별개로
정의문·말뭉치·외부 백과 자료 세 가지가 전부 "몸국(ᄆᆞᆷ국)"이라는
동일한 결론으로 수렴한다 — "모양이 닮았다"는 단일 근거가 아니라
4개의 독립 축(glyph, definition, corpus, 외부 백과)이 전부 일치하는
경우다.

## 6. Unicode normalization

```text
Codepoints: U+1106 (HANGUL CHOSEONG MIEUM)
            U+119E (HANGUL JUNGSEONG ARAEA)
            U+11B7 (HANGUL JONGSEONG MIEUM)
```

이 세 codepoint는 **첫가끝(Johab 계열이 아닌 U+1100 Hangul Jamo
block) 자모 시퀀스**이며, 프로젝트가 이미 쓰고 있는 `ᄒᆞ다`
(U+1112 U+119E), `ᄎᆞᆯ레`(U+110E U+119E U+11AF)와 **정확히 같은
codepoint 대역·구성 방식**이다 — 새 표기 관례를 만들지 않고 기존
관례를 그대로 따른다. NFC로 정규화해도 아래아를 포함한 옛한글
자모는 현대 완성형 음절로 합성되지 않으므로(유니코드에 ᄆᆞᆷ에 대응하는
완성형 코드포인트가 없음), 첫가끝 자모 시퀀스 그대로 저장하는 것이
맞다 — 기존 프로젝트 관례와 동일하다.

라운드트립 렌더링 검증: 위 3-codepoint 시퀀스를 Noto Serif CJK KR로
직접 렌더링해 PDF 크롭과 비교했다 — 초성 ㅁ 사각형·중간 아래아
점·종성 ㅁ 사각형의 3단 구조가 PDF 원본과 일치했다(글꼴 스타일
차이로 점의 위치가 살짝 다르게 보일 뿐, 자모 구성 자체는 동일).

## 7. Decision

```text
RESOLVED_HIGH
```

근거(README-pua-mapping.md의 high 승급 기준 — "PDF glyph 일치 +
공식/신뢰 자료 표기 일치 + 의미 일치 + 다른 plausible mapping이
사실상 없음"을 전부 충족):

1. PDF glyph가 초성ㅁ+아래아+종성ㅁ 구조와 명확히 일치(4.1, 6).
2. 2025 source definition이 "몸국"의 표준 정의(돼지고기 육수+모자반)와
   완전히 일치(4.3).
3. AI Hub 말뭉치가 "몸국"→"모자반국"(16회), "몸을"→"모자반을"을
   애매성 없이 뒷받침(4.4).
4. 위키백과·나무위키가 이 단어의 원표기를 정확히 "ᄆᆞᆷ국"으로
   명시(4.3) — 우리가 유도한 codepoint 시퀀스와 정확히 같다.
5. 대안 후보(ᄆᆞᆼ, 종성 없는 형태 등)는 glyph 형태와 외부 근거 둘 다에서
   기각된다(5절 표).

## 8. Recommended replacement

```text
visible form: ᄆᆞᆷ국 (PUA U+E56E → 3-codepoint 시퀀스로 치환, 뒤의
  "국"(U+AD6D)은 이미 정상이라 그대로 둔다)
codepoints: U+1106, U+119E, U+11B7, U+AD6D
normalization: 첫가끝 자모 시퀀스(기존 ᄒᆞ다/ᄎᆞᆯ레와 동일 관례), NFC 비대상
confidence: HIGH
```

**이번 단계에서 이 치환을 실제로 적용하지 않았다** —
`pua-glyph-mapping.json`/`vocab.json`은 조사 대상이지 수정 대상이
아니다(D-13). 적용은 다음 단계의 몫이다.

## 9. `containsPua` 처리 방향 제안 (다음 단계용, 이번엔 미적용)

RESOLVED_HIGH이므로 **resolved 경로**를 제안한다:

```text
PUA(U+E56E) → 표준 유니코드 자모 시퀀스(U+1106 U+119E U+11B7)로 치환
containsPua: 이 항목은 치환 후에도 첫가끝 자모(옛한글)를 포함하므로,
  main lexeme의 기존 관례(ᄒᆞ다/ᄎᆞᆯ레 등도 containsPua로 표시하지
  않고 일반 유니코드 옛한글로 취급하는 관례)를 그대로 따르면 false로
  둘 수 있다. 다만 "PUA 자체는 해소됐다"는 의미로 false, "여전히
  일반 폰트에서 깨질 수 있는 특수 자모"라는 의미를 살리고 싶다면
  true로 유지 — 이 판단은 Culture Track 구현 단계에서 UI 렌더링
  검증(다른 브라우저/폰트에서 실제로 깨지는지) 후 정하는 것을
  권장한다.
```

Culture MVP에서 이 항목을 비노출/blocked로 둘 필요는 **없다** —
RESOLVED_HIGH이므로 다음 단계에서 매핑을 적용하고 정상 항목으로
진행하면 된다.

## Production impact

```text
mapping changed = 0
vocab changed = 0
main content changed = 0
runtime changed = 0
```

```bash
git diff -- content src scripts public
→ (빈 출력)
git diff -- data/jeju-basic-vocab-2025/pua-glyph-mapping.json
→ (빈 출력)
```

이번 단계에서 추가한 파일은 이 문서(`docs/3c3b1-pua-e56e-audit.md`),
`data/jeju-basic-vocab-2025/pua-e56e-audit-3c3b1.json`(조사
아티팩트), `data/jeju-basic-vocab-2025/review-images/pua-e56e-crop-p63l.png`
(source PDF에서 직접 만든 소형 리뷰 크롭 이미지, 폰트 파일 공유
없음) 세 개뿐이다.

## Git

- PR #13 merge commit: `c9339863f59548fb70e0e2ed96dba5b62fcfca74`
- 작업 브랜치: `codex/3c3b1-pua-e56e-audit`

## 다음 단계

### READY_FOR_MAPPING

> `U+E56E`의 복원값을 `ᄆᆞᆷ`(U+1106 U+119E U+11B7)로, PDF glyph·
> 2025 definition·AI Hub 말뭉치·외부 백과(위키백과/나무위키) 4개
> 독립 근거로 충분히 확정했습니다("몸국" = 돼지고기 육수+모자반
> 국, 제주 향토음식). 사용자 승인 후 다음 단계에서
> `pua-glyph-mapping.json`/`vocab.json`을 실제 수정하고, `containsPua`
> 처리 방향(§9)을 정한 뒤 재생성 검증할 수 있습니다.
