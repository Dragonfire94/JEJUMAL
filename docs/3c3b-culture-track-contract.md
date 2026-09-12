# 3C-3B — CULTURE_ADD 25개용 별도 Culture Track 데이터/런타임 계약

> 이 문서는 **설계 문서**다. Culture 25개를 `content/lexemes.json`에
> 추가하지 않는다. route/UI/quiz/progress 코드를 구현하지 않는다. 예문·
> 오디오를 생성하지 않는다. 기존 lexeme schema에 `track` 필드를 즉시
> 추가하지 않는다. PR #12(3C-3A)는 이 단계 시작 전에 검증 후 병합했다.

## PR #12 검증

| 항목 | 기대값 | 실제값 | 일치 |
| --- | --- | --- | --- |
| state | open | open | ✅ |
| mergeable | true | `mergeable_state: clean` | ✅ |
| head sha | `012c40dffa61511bf2304ba33ac7bf17f24bbac5` | `012c40dffa61511bf2304ba33ac7bf17f24bbac5` | ✅ |
| commits | 2 | 2 | ✅ |
| changed files | 8개(AGENTS.project.md/DATA.md/content/lexemes.json/content/units.json/docs/basic-vocab-2025-content-reference-migration.md/scripts/migrate_basic_vocab_content_refs.mjs/.test.mjs/src/data/units.json) | 정확히 그 8개 | ✅ |

전부 일치해 **PR #12를 merge**했다(merge commit
`a07a109872790c58c2a9da9e3b88b8987d083929`). `main`을 fetch +
`--ff-only`로 동기화하고 `codex/3c3b-culture-track-contract` 브랜치를
새로 팠다.

## 1. 현재 data-flow map — main vs life-dialect (실제 코드로 확인)

| 단계 | Main curriculum | Life Dialect |
| --- | --- | --- |
| 사람이 편집하는 source | `content/{units,lexemes,examples}.json` | `content/life-dialect.json` |
| 스키마 검증 | `scripts/content-schema.mjs`(Zod) | `scripts/life-dialect-schema.mjs`(Zod) |
| 빌드 스크립트 | `scripts/build-content.mjs` | `scripts/build-life-dialect.mjs`(**main build 산출물을 입력으로 다시 읽음** — `UNITS_PATH = src/data/units.json`) |
| 런타임 산출물 | `src/data/units.json` | `src/data/life-dialect.json` |
| 런타임 로더 | `src/lib/units.ts`(`units`, `getUnit`, `getWord` 등) | `src/lib/life-dialect.ts`(`listPassages`, `getPassage`, `appearancesForSeq`) |
| 라우트 | `src/routes/index.tsx`, `src/routes/learn.$unitId.tsx` | `src/routes/life-dialect.index.tsx`, `src/routes/life-dialect.$id.tsx` |
| progress 의존 | `src/lib/progress.ts`의 `completedUnitIds`/`wrongBySeq`(SRS) | 같은 store의 **별도 lightweight 키** `lifeDialectProgress: Record<passageId, {completedAt, selfRating}>` — SRS 아님, 완료 여부와 3단계 자기평가만 |
| quiz 의존 | `src/lib/quiz.ts`의 `allWords`(모든 유닛의 단어, 오답 pool 소스) | **완전 분리된 자체 인라인 미니퀴즈**(`buildInlineQuestions`) — 같은 지문의 다른 문장 번역에서만 오답을 뽑음, `quiz.ts`를 import하지 않음 |
| word-link 방식 | — | `build-life-dialect.mjs`가 **build-time에** main `src/data/units.json`의 모든 단어와 문자열 매칭해 `wordLinks`(status: `"candidate"`)를 문장마다 계산해 저장. 런타임에서 다시 계산하지 않는다. `word-appearance-links.tsx`가 "자동 후보·검수 전"이라고 명시하며 단어 카드 하단에 노출 |

핵심 확인: **life-dialect는 main 100-unit 그리드·SRS 복습 큐·퀴즈
오답 pool 어디에도 들어가지 않으면서도, 자체 route+data file+빌드
단계를 갖춘 독립 콘텐츠 표면**으로 이미 실제 운영 중이다. Culture
Track은 이 패턴을 그대로 재사용하는 것이 최소 위험 경로다.

## 2. Source-of-truth 선택

| 안 | 내용 | 장점 | 단점 |
| --- | --- | --- | --- |
| A | `content/culture-lexemes.json` | main lexeme schema/도구 재사용 가능 | "lexeme"이라는 이름이 main 표제어(SRS 대상)와 개념적으로 헷갈림. 실제로는 SRS 대상이 아니라 별도 build 계약이 필요해 이름의 장점이 실질적 이득으로 이어지지 않음 |
| B | `data/culture/items.json` | life-dialect의 원본 raw data 경로(`data/life-dialect/`)와 유사해 보임 | 실제로는 `data/`는 연구/원자료(사전, AI Hub, 2025 PDF 추출) 저장소이지 **사람이 계속 편집하는 product content**가 아니다. life-dialect의 진짜 source-of-truth는 `data/life-dialect/`가 아니라 `content/life-dialect.json`이다(확인됨) — B안은 이 확립된 경계를 흐린다 |
| C | 기존 `content/lexemes.json`에 `track:"culture"` 추가 | 스키마 재사용 | 명시적으로 금지됨(이번 지시문 A-2). `checkCrossReferences`/`build-content.mjs`/`quiz.ts`의 `allWords`가 전부 `content/lexemes.json` 전체를 무조건 순회하므로, 새 필드 하나로 격리를 보장할 수 없고 광범위한 조건 분기가 필요해짐 — 3C-2에서 이미 폐기됐던 A안(메인에 섞기)의 위험을 스키마 레벨로 재도입하는 셈 |

**최종 선택: `content/culture-items.json`** — B/C 각각의 결정적 단점을
피하면서, 이미 검증된 life-dialect 패턴(`content/life-dialect.json`)의
命名 관례를 그대로 따른다. "lexeme"이 아니라 "item"으로 이름 짓는
이유: culture 항목은 SRS 카드가 아니라 life-dialect의 "지문(passage)"에
더 가까운 열람형 콘텐츠 단위이기 때문이다.

## 3. Culture Item schema

| field | required? | type | purpose |
| --- | --- | --- | --- |
| `id` | REQUIRED | string (`culture-1`..`culture-25`) | route 주소·persist 키로 쓰는 안정적 slug. life-dialect의 `id`(`life-1`..)와 동일한 역할. 한 번 배정하면 재사용/재배치 금지 |
| `sourceStableId` | REQUIRED | string (`jbv2025-p...-y...`) | 2025 source 진짜 identity. A-6 정책 그대로 stable ID를 쓴다 |
| `legacySourceId` | REQUIRED | string (`jbv2025-XXXX`) | audit/debug 전용, main lexeme의 `bookMeta.legacyBookId`와 같은 역할 |
| `jeju` | REQUIRED | string | 제주어 표제 형태(원자료 그대로, PUA 포함 가능) |
| `learnerGloss` | REQUIRED | string | 학습자용 짧은 한국어 라벨. PR #12(3C-3A)에서 확정한 정책을 그대로 적용: `has_standard_equivalent`가 있으면 그 값, 없으면 공식 definition에서 도출한 concise gloss. **이번 단계에서 25개의 실제 gloss 문구를 새로 짓지 않는다** — 규칙만 확정 |
| `definition` | REQUIRED | string | 2025 source 원문 뜻풀이 그대로(가공 없음) |
| `sourcePosLabel` | REQUIRED | string | 2025 source POS(예: "명사") — main의 `bookMeta.posLabel`과 동일 역할. **runtime coarse `partOfSpeech`처럼 앱 로직에 쓰지 않는다**(A-7) — culture item에는 애초에 그런 coarse 분류가 필요 없다(quiz가 없으므로) |
| `level` | REQUIRED | string (`초급`/`중급`) | 2025 source level 그대로 |
| `linguisticType` | REQUIRED | enum (`JEJU_DIALECT_FORM`\|`JEJU_CULTURAL_TERM`\|`BOTH`) | 3C-1.2가 이미 25개 전부에 부여한 값을 그대로 옮긴다 |
| `hasStandardEquivalent` | REQUIRED | boolean | source의 `has_standard_equivalent`를 provenance로 보존(3C-3A 정책의 "no-equivalent 사실 유지" 요구사항) — main `bookMeta`에는 이 필드가 없어서 3C-3A가 문서로만 정책을 남겼지만, Culture Track은 스키마를 새로 만드는 단계이므로 처음부터 이 필드를 넣을 수 있다 |
| `otherJejuForms` | OPTIONAL | string[] | source의 변이 표기(있으면) |
| `containsPua` | OPTIONAL (기본 false) | boolean | main lexeme와 동일한 의미. **국(jbv2025-p063l-y00581)이 실제로 `U+E56E`+`국` 2-codepoint 조합**임을 이번 감사에서 발견(§8) — true로 설정해야 함 |
| `usageEvidenceRef` | OPTIONAL | string | 3C-1.2 감사의 `usageEvidence` 값(참고용, culture item 자체는 이 근거로 존재 여부를 정하지 않는다 — 이미 CULTURE_ADD로 확정됨) |
| `relatedMainLexemeSeqs` | OPTIONAL | `{seq, matchedOn, status:"candidate"}[]` | main lexeme와의 build-time 후보 링크(§6) |
| `relatedLifeDialectIds` | OPTIONAL | `{passageId, sentenceIndex, status:"candidate"}[]` | life-dialect와의 build-time 후보 링크(§6) |
| `culturalNote` | 지금은 불필요 | string \| null | 향후 공식 문화 출처 기반 설명(§7). 이번 25개는 전부 `null`로 시작 |
| `culturalSources` | 지금은 불필요 | `{url, publisher}[]` | `culturalNote`와 짝을 이루는 출처 목록. 스키마에 필드는 만들어 두되 이번 25개는 빈 배열 |
| `hasAudio` | REQUIRED (기본 false) | boolean | §7 오디오 정책. 25개 전부 현재 `false` |
| `reviewStatus` | OPTIONAL | `"approved"\|"provisional"\|"blocked"` | main과 동일한 관례 재사용 |

필드가 많아 보이지만 **REQUIRED 11개 + OPTIONAL 4개 + 지금은
불필요 2개(스키마에 자리만 예약)** 로 구분했다 — "필드가 많다고 좋은
schema"가 아니라는 원칙에 따라, `culturalNote`/`culturalSources`는
채우지 않고 타입만 확정해 향후 마이그레이션 없이 채울 수 있게 한다.

## 4. Identity 정책

| 안 | 설명 |
| --- | --- |
| A. 2025 stable ID를 그대로 culture item ID로 사용 | route 주소가 `/culture/jbv2025-p063l-y00581`처럼 길고, life-dialect의 `id`(`life-1`) 관례와 어긋난다 |
| **B. 별도 culture ID 발급 + sourceStableId 별도 보존 (채택)** | life-dialect의 실제 관례(`id: "life-1"`, 그 외 `seq`는 원본 순번 참조)와 정확히 같은 패턴. route가 짧고 안정적이며, 진짜 source identity(`sourceStableId`)는 별도 필드로 100% 보존돼 provenance 손실이 없다 |
| C. main seq를 새로 발급 | main lexeme `seq` 네임스페이스(90xxx 등)와 불필요하게 결합됨 — culture item은 main curriculum에 배치되지 않으므로 `seq` 발급 규칙(collision-free 확인, `content-schema.mjs` 검증 등)을 따를 이유가 없다. 최종 3C-3A.1 원칙("mapping cohort 밖은 건드리지 않는다")과도 같은 정신으로, culture item은 애초에 main seq 네임스페이스에 속하지 않아야 한다 |

**최종 선택: B.** `id`는 `culture-1`..`culture-25`(3C-1.2 감사 순서
그대로, 이번 문서 §8의 스냅샷 순서와 동일), `sourceStableId`가 진짜
identity다.

## 5. Main curriculum과의 isolation contract

life-dialect가 실제로 지키고 있는 격리를 그대로 명문화한다:

```text
INVARIANT 1: Culture item은 src/lib/units.ts가 export하는 `units`
  배열에 절대 들어가지 않는다(별도 파일 `src/data/culture-items.json`을
  읽는 별도 로더 `src/lib/culture.ts`만 culture item을 다룬다).

INVARIANT 2: Culture item은 src/lib/quiz.ts의 `allWords`
  (오답 후보 pool)에 절대 편입되지 않는다 — allWords는 오직
  `units.flatMap(u => u.words)`에서만 만들어지므로, INVARIANT 1이
  지켜지는 한 자동으로 보장된다.

INVARIANT 3: Culture 열람은 src/lib/progress.ts의 `completedUnitIds`/
  `wrongBySeq`(메인 SRS 큐)를 절대 변경하지 않는다. 별도의
  lightweight 키(§7)만 갱신한다.

INVARIANT 4: Culture item을 몇 개 보든/안 보든 메인 rank/wave 진행
  (`isRankOpen`, `openWaveIndex` 등)에 어떤 영향도 주지 않는다.

INVARIANT 5: content/lexemes.json, content/units.json,
  content/examples.json, src/data/units.json은 이 계약과 그 후속
  구현 PR에서 변경되지 않는다(문서/스키마/신규 파일만 추가).
```

이 5개는 life-dialect가 이미 코드로 만족하고 있는 것과 정확히 같은
성격의 불변식이며(§1 표), Culture Track 구현 PR의 완료 기준으로 그대로
재사용할 수 있다.

## 6. Cross-link 정책 — main lexeme / life-dialect

life-dialect가 실제로 쓰는 방식은 **build-time index**다(§1,
`findCandidateWordLinks`가 `build-life-dialect.mjs` 안에서 main
`src/data/units.json`을 읽어 문자열 매칭 후보를 미리 계산해
저장한다 — 런타임 계산도, 사람이 수동으로 정한 precomputed ID
목록도 아니다).

Culture Track도 같은 방식을 추천한다:

- **culture ↔ main lexeme**: `scripts/build-culture.mjs`(§9)가
  `src/data/units.json`을 읽어, culture item의 `jeju`/`otherJejuForms`가
  main lexeme의 `jeju`/`standard`와 문자열 일치하는 경우
  `relatedMainLexemeSeqs`에 `status:"candidate"`로 기록한다.
  `findCandidateWordLinks`와 같은 최소 길이 필터(`MIN_MATCH_LEN`)를
  재사용해 한 글자 오탐을 막는다.
- **culture ↔ life-dialect**: 같은 스크립트가 `src/data/life-dialect.json`을
  읽어 각 문장의 `solutionEdited`/`jeju`에 culture item의 표제 형태가
  등장하면 `relatedLifeDialectIds`에 `status:"candidate"`로 기록한다.
- 두 경우 모두 **"후보"이지 정답이 아니다** — `word-appearance-links.tsx`와
  똑같이 "자동 후보·검수 전"이라고 명시한 UI로만 노출한다(이번
  단계에서 UI는 구현하지 않지만 계약에 명시).
- **중복 데이터의 canonical source 문제**: `돌담`/`올레`처럼 향후
  `MAIN_ELIGIBLE`(3C-2의 참고 recommendation)이 되어 main lexeme으로도
  추가될 수 있는 항목이 있더라도, **같은 레코드로 합치지 않는다.**
  culture item과 main lexeme은 서로 다른 `id`/`seq` 네임스페이스를
  유지하고, `relatedMainLexemeSeqs`(culture → main)와 향후 main
  lexeme 쪽에 추가될 수 있는 대칭 필드(예: `relatedCultureItemIds`,
  **이번 단계에서 만들지 않음**)로만 연결한다. 즉 "같은 개념이 두
  표면에 동시에 존재할 수 있고, 그건 정상"이라는 원칙을 명문화한다 —
  life-dialect의 단어가 main lexeme과 별개 레코드로 남아 있는 것과
  같은 이유다.

## 7. Progress / Quiz / Audio 정책

### Progress

life-dialect의 `lifeDialectProgress: Record<passageId, {completedAt,
selfRating}>` 패턴을 그대로 재사용해 `cultureProgress: Record<itemId,
{viewedAt: number}>` 같은 **경량 열람 상태**만 추가하는 것을
추천한다(D-10의 B안) — `completedAt`+`selfRating` 조합처럼 세분화된
평가까지는 MVP에 불필요해 보이지만, "본 적 있음" 정도는 life-dialect
선례와 정확히 같은 구조로 값싸게 넣을 수 있다. **SRS 재사용(C안)은
추천하지 않는다** — culture item은 "정답을 맞혀야 하는 카드"가 아니라
"읽고 이해하면 끝나는 배경 지식"이라 `wrongBySeq`/복습 간격 개념 자체가
맞지 않는다. **이번 단계에서 `progress.ts`를 실제로 수정하지 않는다** —
계약만 남긴다.

### Quiz

life-dialect의 자체 인라인 미니퀴즈(`buildInlineQuestions`, 지문
문장들 사이에서만 오답을 뽑는 폐쇄형 로직)와 달리, culture item은
지문(여러 문장)이 아니라 **개별 단어+정의 카드**에 가깝다. 3C-2가
확인한 "저빈도 문화어가 main 퀴즈 오답 풀에 섞이면 안 된다"는 문제는
격리(§5 INVARIANT 2)로 이미 해결되므로, Culture Track 자체 퀴즈를
만들 필요성은 낮다.

**추천: MVP는 quiz 없음.** 열람형 카드/목록으로 시작하고, 필요성이
실제로 확인되면(예: 사용자가 이해도 확인을 원한다는 피드백) 후속
단계에서 life-dialect식 자체 인라인 퀴즈를 검토한다.

### Audio

기존 `playWord()`(`src/lib/audio.ts`) 구조를 확인했다: 로컬 mp3
파일 재생을 먼저 시도하고, **파일이 없거나 실패하면 브라우저 한국어
TTS로 자동 폴백**한다. 이 폴백은 main 표제어에서도 이미 부정확할
위험이 있지만, `quiz.ts`가 `hasAudio !== false` 조건으로 **듣기
문제에서만** 이 위험을 차단하고 있을 뿐, `AudioButton` 자체(예:
flashcard, 정답 확인 화면)는 `hasAudio`와 무관하게 항상 렌더링돼
TTS 폴백을 허용한다.

Culture item 25개는 전부 `hasAudio: false`가 될 것이 확실시된다(공식
녹음이 없음). 옛한글/PUA 표기(§8)가 섞인 표제어를 일반 한국어 TTS가
읽으면 **제주어 공식 발음처럼 오인될 위험이 main 단어보다 크다** —
`ᄎᆞᆯ레`, PUA 포함 `국` 같은 표기는 TTS가 임의로 근사 발음하거나 아예
깨질 수 있다.

**정책(D-17): Culture item 상세 화면에서는 `hasAudio: false`인 경우
재생 버튼 자체를 숨긴다(main의 `AudioButton`을 그대로 재사용하지
않는다) — TTS 폴백으로 이어지는 경로를 원천 차단한다.** 공식/검증
오디오가 확보된 항목만 재생 버튼을 노출한다. 실제 audio 구현/버튼
컴포넌트 작성은 다음 단계.

## 8. 25-item source integrity snapshot (production 반영 아님)

`content-new-candidates-3a.json`/`vocab.json`/3C-1.2 감사에서
**다시** 모은 값이다(과거 요약을 재사용하지 않음):

```text
items: 25
unique stableId: 25
unique primary identity(jeju form): 25 (main lexeme과 정확 일치 0건)
no-standard-equivalent: 25/25 (전부 has_standard_equivalent:false —
  즉 25개 전부 learnerGloss를 3C-3A 정책(§3)으로 직접 도출해야 하고,
  이번 단계에서는 그 문구를 짓지 않는다)
PUA/old-Hangul affected: 2/25
  - 국(jbv2025-p063l-y00581): 실제로는 U+E56E(PUA, 미매핑) + U+AD6D(국)
    2-codepoint 조합. `data/jeju-basic-vocab-2025/pua-glyph-mapping.json`
    81건 중 U+E56E는 없음 — **기존 PUA 정제 작업이 다루지 않은 새
    미매핑 글자.** 터미널/일부 폰트에서 그냥 "국"으로 보여 놓치기 쉽다
    (AGENTS.project.md 4절의 경고가 실제로 재현된 사례).
  - ᄎᆞᆯ레(jbv2025-p072r-y03485): U+110E/U+119E/U+11AF(옛한글
    첫가끝 자모) + U+B808. PUA는 아니고 이미 main content에도 같은
    자모대(예: ᄒᆞ다, ᄑᆞᆯ다)가 존재해 렌더링 선례가 있다.
existing main overlaps (exact jeju form match): 0/25
linguisticType 분포: JEJU_DIALECT_FORM 1(ᄎᆞᆯ레), JEJU_CULTURAL_TERM 22,
  BOTH 2(돌담, 올레)
usageEvidence 분포: STRONG 3(오름/올레/오분자기), MEDIUM 4, WEAK 5,
  NONE 13 — NONE이 13/25로 가장 많지만, 3C-1.2 정책상 NONE은 사어
  판정이 아니라 "이 두 자료(AI Hub/생활방언)에서 확인 못함"이라는
  뜻이고, CULTURE_ADD 결정 자체를 이번 단계에서 재검토하지 않는다.
level 분포: 초급 5, 중급 20
```

**"국" 항목은 이번 단계에서 표기를 고치지 않는다**(A-8/D-16 지시대로).
다만 실제 구현 PR 전에 `containsPua: true`로 표시해야 하고, 가능하면
기존 PUA 정제 방법론(`README-pua-mapping*.md`)으로 U+E56E의 실제 옛한글
자모를 확인하는 작업이 **선행되는 것이 안전하다** — 이 문서에서는
발견 사실만 기록하고 다음 단계로 넘긴다.

## 9. MVP 범위

| 포함(MVP) | 제외(후속) |
| --- | --- |
| `content/culture-items.json` 스키마 확정 + 25개 **레코드 구조**(gloss 제외 필드만) 채우기 | `learnerGloss` 25개 실제 문구 작성(3C-3A 정책 적용, 사람 검수 필요) |
| `scripts/culture-schema.mjs`(Zod) | culturalNote/culturalSources 실채움(공식 출처 확보 필요) |
| `scripts/build-culture.mjs` → `src/data/culture-items.json` (build-time cross-link 포함) | bookmark/저장 기능 |
| 목록 라우트(`/culture` 또는 `/culture.index.tsx`) | Culture 전용 quiz |
| 상세 라우트(`/culture/$id`) | life-dialect ↔ culture 양방향 UI(카드 하단 링크 등 시각적 통합) |
| main quiz/progress/units와 완전 분리(§5 5개 invariant) | 이미지/사진 |
| audio 없으면 버튼 없음(§7) | 실제 audio 녹음/TTS 정책 확장 |
| `cultureProgress`(경량 열람 상태) — **스키마 계약까지만, `progress.ts` 실제 코드 변경은 다음 단계** | main lexeme과의 대칭 역링크(`relatedCultureItemIds`) |

## 10. 다음 실제 구현 PR의 최소 scope (제안, 한 단계만)

**3C-3C(가칭): Culture Track 데이터 계층 + 정적 열람 MVP.**

1. `scripts/culture-schema.mjs`(Zod, §3 스키마 그대로) 작성.
2. `content/culture-items.json`에 25개 레코드 추가 — **단,
   `learnerGloss`는 3C-3A 정책에 따라 사람이 검수 가능한 초안으로
   채우거나, 정책이 요구하는 정확도가 자신 없으면 `null`로 비워두고
   `pendingGloss: true` 플래그를 붙인다**(3C-3A가 `pendingExample`에
   쓴 것과 같은 관례).
3. `scripts/build-culture.mjs` 작성 — 검증 + `src/data/units.json`/
   `src/data/life-dialect.json`을 읽어 build-time candidate cross-link
   계산 + `src/data/culture-items.json` 생성.
4. `src/lib/culture.ts`(life-dialect.ts와 대칭 구조: `listItems`,
   `getItem`).
5. `/culture`, `/culture/$id` 라우트(목록 + 상세, 정적 열람만, 퀴즈
   없음, audio 버튼은 `hasAudio` 기준으로 조건부 렌더).
6. `content-migration-cohort` 스타일의 **격리 테스트**를 추가한다 —
   "culture item의 어떤 표제어도 `src/lib/units.ts`의 `units`에
   등장하지 않는다", "`quiz.ts`의 `allWords`에 culture item seq/id가
   없다" 를 자동 검증(§5 INVARIANT 1/2를 코드로 고정).
7. `cultureProgress` progress.ts 실제 필드 추가는 **선택 사항으로
   scope 밖에 둔다** — 정적 열람만으로도 MVP 가치가 있다.

이 범위 밖(bookmark, quiz, life-dialect cross-link UI, 이미지,
공식 문화 출처 확보)은 이후 단계로 명시적으로 미룬다.

## Production 영향 확인

```text
main lexemes changed = 0
units changed = 0
examples changed = 0
runtime changed = 0
schema changed = 0 (scripts/content-schema.mjs 무변경)
```

```bash
git diff -- content/lexemes.json content/units.json content/examples.json src/data/units.json
→ (빈 출력)
git diff -- scripts/content-schema.mjs scripts/build-content.mjs src/lib src/routes src/data public/audio
→ (빈 출력)
```

이번 단계에서 추가한 파일은 이 문서(`docs/3c3b-culture-track-contract.md`)와
`data/jeju-basic-vocab-2025/culture-track-proposal-3c3b.json`(제안
아티팩트, production source 아님) 둘뿐이다.

## Git

- PR #12 merge commit: `a07a109872790c58c2a9da9e3b88b8987d083929`
- 작업 브랜치: `codex/3c3b-culture-track-contract`

## 결론

- source-of-truth: `content/culture-items.json`(신규, life-dialect
  패턴 재사용)
- item identity: culture 전용 `id`(`culture-1`..`culture-25`) +
  `sourceStableId`(2025 stable ID) 이원화
- main curriculum isolation: 5개 invariant(§5), life-dialect가 이미
  코드로 증명한 것과 동일한 성격
- progress: 경량 열람 상태(`cultureProgress`, life-dialect의
  `lifeDialectProgress`와 동형) — SRS 재사용 안 함
- quiz: MVP는 없음
- audio: `hasAudio:false`면 재생 버튼 자체 숨김, TTS 폴백 경로 차단
- life-dialect linking: build-time candidate cross-link(문자열 매칭,
  `status:"candidate"`), 레코드 병합 없음
- 25개 전부 `has_standard_equivalent:false` → `learnerGloss` 신규
  작성 필요(이번 단계 미실행), 2개는 PUA/옛한글 표기 이슈(국은 신규
  미매핑 PUA 발견)

**READY**

> Culture Track의 source-of-truth, item schema, main curriculum 격리
> 규칙, MVP 범위가 확정됐습니다. 사용자 승인 후 다음 단계(3C-3C 제안)에서
> 이 계약에 맞는 최소 Culture Track 구현을 시작할 수 있습니다. 단, "국"
> 항목의 미매핑 PUA(U+E56E)는 구현 전 별도로 짚어야 할 선행 이슈로
> 남겨둡니다.
