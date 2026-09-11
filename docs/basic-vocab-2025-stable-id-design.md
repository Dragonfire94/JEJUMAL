# 3A단계 — 2025 기본어휘 Stable ID 설계 + 기존 content 마이그레이션 영향 전수 감사

PR #3(extractor 재구성 + 2.5단계 잔여 감사)이 `main`에 merge된 뒤 진행한
설계·감사 전용 단계. **이번 단계에서는 `content/lexemes.json` 등 어떤
production 파일도 수정하지 않았다.** 결과는 설계 제안 + 655건 전수
매핑 데이터 + 영향 분석이며, 실제 마이그레이션(3B)은 사용자 검토 뒤
별도로 진행한다.

브랜치: `docs/2025-vocab-stable-id-design` (main은
`f2f041c`=PR #3 병합 커밋에서 시작).

## 0. 시작 조건 확인

- PR #3: merge 완료(`f2f041ceda5bfec55ae9fe56cd2a759411cb7155`), main에 반영됨.
- 로컬 `main`을 fetch+pull로 동기화, working tree clean 확인 후 이 브랜치를 팠다.
- `content/lexemes.json`, `content/units.json`, `content/examples.json`,
  `src/data/units.json`, `src/lib/*`, `src/routes/*`, `public/audio/*`는
  이번 커밋에서 전혀 건드리지 않았다(신규 파일만 추가).

## 1. 결론

- **추천 ID 방식**: source locator(문서+PDF 페이지+반쪽+표준어 칸
  블록 시작 y좌표) 기반 결정론적 ID(후보 D, 6절). 순번 기반(현재
  방식)은 삽입에 취약해서 탈락, 표제어 기반은 동형이의어·표기
  변이에 취약해서 탈락.
- 655건 중 **자동 마이그레이션 가능(A) 582건(88.9%)**, **기계적
  교정 후 자동화 가능(B) 42건(6.4%, 전부 동일 원인)**, **오염
  교정 필요(E) 31건(4.7%)**, 다중 후보(D)·유실(F) **0건**.
- metadata 오염(E) 31건은 전부 "표준어 칸 헤드워드 없는 항목이 직전
  entry에 흡수되던" 그 구조적 버그의 흔적이 `otherJejuForms`/
  `definition`에 남은 것 — 이미 어떤 새 entry로 옮겨야 하는지도
  자동으로 확정됐다.
- corrected 초급+중급(950개) 중 현재 content에 정확히 존재 866개,
  변이형으로 존재 12개, **앱에 추가 가능한 신규 제주어 lexeme 후보
  71개**(그 중 70개는 표준어 대응 없는 제주 고유어), **원자료 자체의
  제주어형 공백(source gap) 1개**([3A.1] `jbv2025-0146`="옆" —
  표준어 항목·정의는 있지만 대응 제주어 형태가 PDF에 없음, 앱
  lexeme 후보 아님).

## 2. ID 사용 현황

| ID 종류 | 예시 | 의미 | 현재 사용처 | 문제 |
|---|---|---|---|---|
| `content/lexemes.json`의 `seq` | `"90008"` | 앱 lexeme 고유 식별자(문자열 숫자) | `units.json`의 `wordSeqs`, `examples.json`의 `seq` | 이번 작업 대상 아님 — 그대로 유지 |
| 제주 사전(jeju.go.kr) 원본 seq | (자체 사전 내부 seq) | 1차 출처 사전의 표제어 번호 | 초기 1,000단어 도입 당시 참고 | 이번 작업과 무관 |
| 2025 기본어휘 `bookMeta.bookId` | `"jbv2025-0744"` | content lexeme가 참조하는 2025책 source entry 식별자 | `content/lexemes.json`의 655개 lexeme | **순수 배열 순번이라 재추출 시 97% drift**(2.5단계에서 확인) |
| `vocab.json`의 `id` | `"jbv2025-0744"` | 2025책 추출 entry 자체의 식별자(=위와 동일 문자열 체계) | `data/jeju-basic-vocab-2025/vocab.json` | 이번 설계 대상 — `for i, e in enumerate(entries): e["id"] = f"jbv2025-{i+1:04d}"`(순번 기반, `scripts/extract_jeju_basic_vocab_2025.py`) |

`seq`와 `bookId`는 완전히 다른 체계이며 이번 작업은 `bookId`/
`vocab.json`의 `id`만 대상으로 한다. `seq`는 바꾸지 않는다.

## 3. Stable ID 후보 비교

| 후보 | 설명 | insertion 안정 | PUA 안정 | 표기수정 안정 | split 대응 | 충돌 위험 | 추적성 | 추천 |
|---|---|---|---|---|---|---|---|---|
| A. 현재(전역 순번) | `jbv2025-{i:04d}` | ✗ (2.5단계에서 97% drift 실증) | ✓ | ✓ | ✗(합쳐진 3개가 순번상 흩어짐) | 없음 | 낮음(순번만으론 원문 위치 모름) | 비추천 |
| B. 제주어 표제어 기반 | `jbv2025-오름` 또는 slug | ✓ | ✗(PUA 복원 전/후 문자열이 다름) | ✗(표기 수정 시 ID 변경) | ✗(동형이의어·변이형 충돌) | 높음(동형이의어, 여러 jeju_forms) | 중간 | 비추천 |
| C. 순수 좌표 해시 | `hash(page,half,y0)` | ✓ | ✓ | ✓ | ✓ | 매우 낮음(4절 실측) | 낮음(해시만으론 위치 역추적 불가) | 조건부 |
| **D. 좌표 locator 문자열(추천)** | `jbv2025-p{page:03d}{half}-y{y0*10:05d}` | ✓(실측, 5절) | ✓(설계상 보장) | ✓(설계상 보장) | ✓(각 split 조각이 자기 좌표를 가짐) | 매우 낮음(실측 0건, 5절) | 높음(id 자체가 PDF 위치) | **추천** |

### 왜 순번(A)을 탈락시켰나

2.5단계에서 이미 실측했다: `content/lexemes.json`의 `bookMeta.bookId`
655건 중 636건(97.1%)이 이번 재추출로 다른 단어를 가리키게 됐다.
이유는 entry 246개가 새로 추가되면서 그 뒤 순번이 전부 밀렸기
때문이다. 다음 extractor 수정(예: 고급/명사 +1 원인이 나중에
밝혀져서 entry가 1개 더 추가/제거되는 경우)에도 똑같은 일이
반복된다 — 근본 원인을 안 고치면 이 작업을 계속 반복하게 된다.

### 왜 표제어 기반(B)을 탈락시켰나

- 동형이의어: `말축1`(메뚜기) / `말축2`(사마귀)처럼 같은 표기가
  서로 다른 entry.
- PUA 복원 전/후 문자열이 다르다: `다1` → `ᄀᆞ다1`처럼
  복원되면 표제어 기반 ID가 통째로 바뀐다 — 4-2 조건 위반.
- 여러 `jeju_forms`(변이형) 중 어느 것을 ID로 쓸지 모호하고, 변이형
  구성이 나중에 바뀌면(예: 오탐으로 분류된 변이형을 재검토해서
  분리) ID도 바뀐다.

## 4. 최종 추천 ID 설계

```json
{
  "id": "jbv2025-p103l-y03595",
  "sourceLocator": {
    "document": "jeju-basic-vocab-2025",
    "pdfPage": 103,
    "half": "left",
    "yStart": 359.5
  }
}
```

- `id`는 `sourceLocator`로부터 결정론적으로 생성하지만, **생성 시점에
  값을 확정해서 vocab.json에 커밋하고, 이후엔 다시 계산하지 않는다**
  (extractor 버전이 바뀌어 좌표 소수점 처리가 미세하게 달라져도 이미
  커밋된 entry의 id가 조용히 바뀌는 일을 막기 위해 — 7절 참고).
- `half`는 `left`/`right`(현재 코드의 `L`/`R`을 그대로 문자열화).
- `yStart`는 표준어 칸에서 이 entry 블록이 시작하는 첫 줄의 y좌표
  (현재 코드의 `parse_half`가 이미 `y_start`로 들고 있다가
  `assign_chapters`에서 지우는 값 — 지우지 않고 보존하면 된다).
- y좌표는 소수점 첫째 자리(0.1pt)까지만 쓴다 — 5절에서 실측한 최소
  entry-간 간격(32.8pt)의 1/300 수준이라 충돌 여지가 사실상 없다.

의사코드:

```python
def make_id(entry):
    half_code = "l" if entry["half"] == "left" else "r"
    y10 = round(entry["y_start"] * 10)
    return f"jbv2025-p{entry['pdf_page']:03d}{half_code}-y{y10:05d}"
```

## 5. 안정성 시뮬레이션

production 파일은 건드리지 않고 scratch에서 시뮬레이션했다
(`scripts/extract_jeju_basic_vocab_2025.py`의 내부 함수를 import해서
재사용 — 재현 방법은 이 문서의 9절과 동일한 방식).

| 시뮬레이션 | 결과 |
|---|---|
| 1,501개 전체에 stable id 부여 | **1,501개 unique, collision 0** |
| 동일 코드로 2회 재실행 | 두 번 다 동일한 1,501개 id 집합(2.5단계에서 확인한 vocab.json SHA256 재현성과 별개로 재확인) |
| 중간 삽입 시뮬레이션(레벨 구분자 필터를 일부러 약화해서 7개 spurious entry가 새로 잡히게 함, 1,501→1,508) | **기존 1,501개의 id 전부 변경 없음(0건 사라짐), 새 7개만 새 id로 추가됨** — 현재 순번 방식이었다면 이 시점 이후 순번이 전부 밀렸을 상황 |
| PUA 복원 전/후 | 설계상 id가 좌표만으로 결정되므로 텍스트(PUA 포함)와 무관 — `restore_known_pua()` 호출 전/후 관계없이 동일 좌표면 동일 id(코드 검토로 확인, 별도 실행 불필요) |
| 표기/definition 수정 | 위와 동일한 이유로 id는 텍스트 내용과 무관 |

가장 중요한 결과는 삽입 시뮬레이션이다 — 이게 현재 순번 방식이
매번 실패하는 지점이고, 새 방식이 실제로 이 문제를 없앤다는 걸
직접 보여준다.

## 6. 기존 655 bookId 매핑

매칭 절차: ① PUA 문자를 제거한(눈에 보이는 글자만 비교) 제주어형
정확 일치 → ② 후보가 여러 개면 표준어 정확 일치로 좁힘 → ③ 그래도
여러 개면 level+품사로 좁힘. **655건 전부가 이 절차만으로 정확히
1개의 corrected entry에 매칭됐다**(동형이의어 번호가 실제 결정적
신호였다 — PUA를 제거하면 `다1`/`다2`가 `다1`/`다2`로
정확히 갈라진다).

| confidence | 개수 | 자동 migration 가능 여부 |
|---|--:|---|
| A(제주어·표준어·품사·등급 전부 일치) | 582 | 가능 |
| B(제주어·표준어·등급 일치, 품사만 불일치) | 42 | `bookId`/`bookMeta` 매핑 자체는 가능 — `partOfSpeech` 교정은 별도 스키마 정책 결정 필요(3B-2, 아래 참고) |
| C(변이형 매칭) | 0 | - |
| D(다의어/다중 후보) | 0 | - |
| E(오염된 bookMeta) | 31 | 불가(자동 정제 필요, 대상은 확정됨) |
| F(대응 entry 없음) | 0 | - |
| **합계** | **655** | |

### B(42건)의 정체 — 전부 같은 원인

42건 전부 "품사만 다르고 나머지(제주어형·표준어·등급)는 완전히
일치"하는 패턴이었다. 원인을 추적해보니 **전부 구 extractor의
우측 반쪽 품사 라벨 미독 버그(2단계에서 고침) 때문에, 당시
`bookMeta.posLabel`에 잘못된 품사가 찍혔고, 그게 앱의
`partOfSpeech`로 그대로 옮겨진 것**이었다. 예: `하나/둘/넷`이
당시 "대명사"로 잘못 추출돼 `partOfSpeech: "pronoun"`이 됐지만,
고친 extractor는 정확히 "수사"로 분류한다.

**[2026-09-11, 3A.1에서 수정] 자동 교정 규칙을 이 문서에서 확정하지
않는다.** 명사↔동사↔형용사↔부사↔대명사↔수사↔감탄사처럼 앱
`partOfSpeech` enum에 이미 있는 품사끼리는 corrected `pos`로 바로
대응시키면 되지만, 의존명사·관형사는 앱 enum에 대응 카테고리가
아예 없다 — 이걸 `noun`/`adjective`로 "근사"하는 건 **원자료
메타데이터 교정이 아니라 앱 품사 모델(스키마) 자체를 결정하는
일**이라 이 단계에서 섞으면 안 된다(특히 관형사를 형용사로
근사하는 건 언어학적으로도 부정확하다). 42건의 정확한 목록과
원인은 확정됐지만, **실제 교정 규칙(schema에 새 카테고리를 추가할지,
근사 매핑을 쓸지)은 3B-2에서 별도로 결정한다** — 10절 참고.

### E(31건) — 병합 오염, 대상 확정됨

31건 전부 `otherJejuForms`에 지금은 별개 entry로 확인된 단어가
그대로 남아있거나(예: `빗`(빛)의 `otherJejuForms: ["빙떡"]`),
`definition`에 다른 개념의 뜻풀이가 이어붙어 있다. **다행히 이
31건 모두 자기 자신(주 표제어)이 가리켜야 할 corrected entry는
이미 정확히 1개로 확정된다** — 오염된 건 부가 필드(`otherJejuForms`,
`definition`)뿐이고 `jeju`/`standard`/`bookId` 매핑 자체는 깨지지
않았다.

전체 매핑 데이터(655건)는
`data/jeju-basic-vocab-2025/content-migration-mapping-3a.json`에
저장했다(seq, 기존 값, confidence, corrected entry 전체를 포함).

## 7. 현재 content 오염

| 항목 | 개수 | 비고 |
|---|--:|---|
| `otherJejuForms`에 다른 개념 단어가 섞임 | 31 | 6절의 E 전체 |
| `bookMeta.definition`이 다른 개념 뜻풀이와 이어붙음 | 31 | E와 동일 집합(항상 같이 나타남) |
| `partOfSpeech`가 잘못됨(구 버그 전파) | 42 | 6절의 B 전체 |
| `bookId`가 다른 entry를 가리킴(재추출 후 drift) | 655(97.1%인 636건이 실제 drift) | 2.5단계에서 이미 확인 — 이번엔 재확인만 |
| 위 문제 없이 정상 | 582 | 6절의 A |

대표 사례(E):

| seq | jeju | standard | 오염 내용 | corrected 대상 |
|---|---|---|---|---|
| 90050 | 빗 | 빛 | `otherJejuForms: ["빙떡"]`, definition에 빙떡 뜻풀이가 이어붙음 | `jbv2025-0078`(빛만) |
| 90059 | 송펜 | 송편 | `otherJejuForms: ["숨비소리"]` | `jbv2025-0101` |
| 90674 | 아따가라 | 아따 | `otherJejuForms: ["옴마가라","ᄎᆞ마가라"]` | `jbv2025-0948` |

대표 사례(B):

| seq | jeju | 구 posLabel(당시 책 라벨, 틀림) | 구 partOfSpeech | corrected pos | 원인 |
|---|---|---|---|---|---|
| 90129 | ᄒᆞᆞ나 | 대명사 | pronoun | 수사 | 구 extractor 우측라벨 미독 버그 |
| 90138 | 가오다 | 수사 | number | 동사 | 상동(더 심한 사례 — 동사가 수사로) |
| 90672 | 게2 | 부사 | adverb | 감탄사 | 상동 |

**"현재 존재하는 lexeme의 오류"(유형 1·2)와 "old extractor 때문에
후보 선정에서 아예 빠진 신규 단어"(유형 3)는 서로 다른 문제다** —
전자는 위 표, 후자는 8절.

## 8. corrected 초급+중급 차집합

**[2026-09-11, 3A.1에서 수정]** 최초 집계는 `jeju_forms`가 빈
source entry(`jbv2025-0146`="옆" — 표준어 항목·정의는 있지만 PDF에
대응 제주어 형태가 아예 없는 경우) 1건을 "신규 후보"에 잘못
포함시켰다. 이건 앱에 추가할 제주어 lexeme가 아니라 **원자료
자체의 공백(source gap)**이라 별도로 분리했다.

| 유형 | 개수 |
|---|--:|
| 현재 content에 정확히 존재(제주어형 일치) | 866 |
| 변이형으로 존재(표준어 일치, 제주어 표기 다름) | 12 |
| **앱에 추가 가능한 신규 제주어 lexeme 후보** | **71** |
| **원자료 제주어형 공백(source gap, lexeme 후보 아님)** | **1** |
| 판정 불확실 | 0 |
| **합계(corrected 초중급 전체)** | **950** |

71개 actionable 후보 중 70개가 `has_standard_equivalent: false`(표준어
대응 없는 제주 고유어 — 오름, 올레, 빙떡, 삼춘, 숨비소리, 셋딸,
셋아덜, 말젯딸/말젯아덜/말젯아방/말젯어멍, 살아지다, 알아지다,
먹어지다, 그추룩/이추룩/저추룩, 곶자왈, 가문잔치, 오분자기,
정주석, 산담, 신구간, 물소중의/물수건/물적삼, 불턱, 빗창,
반지기밥 등)이고, 나머지 1개는 표준어도 있고 형태도 완전히
다른 진짜 신규 표제어(`절`=파도, `jbv2025-0619`)다. 이 71개 전체
목록은 `data/jeju-basic-vocab-2025/content-new-candidates-3a.json`에,
source gap 1건은 `data/jeju-basic-vocab-2025/content-source-gaps-3a.json`에
저장했다.

이 71개 중 상당수(39개, 7절의 31 E건에서 뜯겨져 나온 단어들 — 예:
빙떡, 숨비소리, 옴마가라 등)는 "예전에 이미 다른 단어에 잘못
흡수됐던 단어가 이제 독립 entry로 확인된 것"이고, 나머지
32개는 애초에 old extractor의 1,255개 결과 자체에 아예 없었거나
초중급 통합 라운드(`basic-vocab-2025-full-integration.md`) 당시
선정에서 빠졌던 순수 신규다.

**검증(invariant)**: `content-new-candidates-3a.json`의 모든 항목은
`jeju_forms.length >= 1`이어야 한다(3A.1에서 확인, 위반 0건). 그리고
`866 + 12 + 71(actionable) + 1(source gap) == 950`이 성립한다(확인됨).

## 9. 재현 방법

이 문서의 수치는 scratch 스크립트로 만들었고 저장소에는 커밋하지
않았다(`scratchpad/audit3a/*.py`). 재현하려면:

1. `scripts/extract_jeju_basic_vocab_2025.py`를 모듈로 import해서
   `parse_page_halves`와 동일한 루프를 직접 돌리되,
   `assign_chapters`가 지우기 전에 `y_start`를 별도 필드로 보존한다
   (`_y_start_for_id` 같은 이름으로 복사).
2. 매핑(6절)은 `content/lexemes.json`의 `bookMeta.sourceId ==
   "jeju-basic-vocab-2025"`인 655개 lexeme마다, PUA 문자를 제거한
   `jeju` 문자열을 새 `vocab.json`의 `jeju_forms`(역시 PUA 제거)와
   정확히 비교해서 후보를 찾고, 후보가 여럿이면 표준어 → level+품사
   순으로 좁힌다.
3. 오염(E) 판정은 `bookMeta.otherJejuForms` 중 corrected entry의
   `jeju_forms`에 없는 게 있는지, `bookMeta.definition`이 corrected
   `definition`의 진짜 상위집합(다른 문장이 이어붙음)인지로 판단한다.

## 10. 실제 migration 계획(제안, 미실행) — 3단계로 분할

**[2026-09-11, 3A.1에서 수정]** 처음엔 하나의 "3B"로 묶어 제안했지만,
source metadata 교정(bookId/오염 정리)과 앱 품사 모델 결정, 신규
단어를 실제로 앱에 넣을지 선별하는 건 성격이 다른 판단이라 사용자
지시에 따라 3단계로 나눈다.

### 3B-1 — stable ID 도입 + bookId/bookMeta만 안전하게 마이그레이션

1. `scripts/extract_jeju_basic_vocab_2025.py`에 4절의 stable id
   생성 로직을 추가하고, `id`(순번 기반, 하위호환용으로 유지 가능)와
   별도로 `stableId`/`sourceLocator` 필드를 vocab.json에 추가.
2. `content/lexemes.json`의 `bookMeta.bookId` 655건을
   `data/jeju-basic-vocab-2025/content-migration-mapping-3a.json`
   기준으로 `stableId`로 교체하는 스크립트 작성(legacy 숫자 id는
   `bookMeta.legacyBookId`로 보존 — confidence A/B/E 전부 실제
   대응이 확인됐으므로 안전).
3. A(582) 자동 적용.
4. E(31) — `otherJejuForms`에서 stray 항목 제거,
   `bookMeta.definition`을 corrected entry의 정의로 교체(사람이
   최종 diff 한 번 확인 권장).
5. **B(42)의 `partOfSpeech`는 이 단계에서 건드리지 않는다** —
   `bookId`/`bookMeta`만 옮기고 앱에 노출되는 `partOfSpeech` 필드는
   그대로 둔다(3B-2로 이월). 신규 71개도 이 단계에서 추가하지 않는다.
6. `node scripts/build-content.mjs`, `node scripts/qc-check.mjs`, diff report(2.5단계 방식 재사용).
7. PR 생성, 사용자 검토.

### 3B-2 — B(42건)의 `partOfSpeech` 처리

먼저 스키마 정책을 결정한다: 의존명사·관형사를 위한 카테고리를
`PART_OF_SPEECH`(`scripts/content-schema.mjs`)에 추가할지, 아니면
근사 매핑을 쓸지(쓴다면 어떤 근사가 언어학적으로 맞는지) — 이건
source metadata 교정이 아니라 앱 품사 모델 결정이므로 3B-1과
분리했다. 결정 후 42건에 적용.

### 3C — 신규 71개 실제 반영 여부 선별

71개 전체를 기계적으로 다 넣지 않는다. "공식 기본어휘에 있다"와
"앱 핵심 1,000단어에 넣는다"는 별개 판단이므로, 오름·올레·빙떡·
숨비소리처럼 채택이 명백한 것과 말젯어멍처럼 우선순위가 낮을 수
있는 것을 나눠서 사용자와 함께 선별한 뒤, 8절 목록
(`content-new-candidates-3a.json`)을 기준으로 유닛 배치까지
진행한다(랭크 그리드 확장 논의와 연결 — `docs/NEXT-STEPS.md`
A-3 참고).

## 11. 내가 결정해야 할 것

- **stable id 문자열 포맷(4절)을 이대로 채택할지** — 페이지/반쪽/y좌표를
  그대로 노출하는 게 싫다면(예: PDF가 개정판으로 바뀌면 이 포맷 자체가
  의미 없어짐) 완전 불투명 해시로 바꿀 수도 있다. 추적성을 포기하는
  대신 포맷 변경에 더 자유로워진다 — 트레이드오프 판단 필요.
- **3B-2에서 의존명사/관형사를 앱 스키마에 새 카테고리로 추가할지,
  근사 매핑을 쓸지**(쓴다면 어떤 매핑이 맞을지) — B(42건) 처리의
  전제가 되는 결정.
- **3C에서 신규 71개 중 어디까지 실제로 앱 핵심 단어로 넣을지** —
  "공식 기본어휘에 있다"만으로 자동 채택하지 않고 개별 판단 필요.
