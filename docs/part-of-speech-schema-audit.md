# 3B-2 — 앱 `partOfSpeech` 스키마 감사 및 정책 제안

3B-1B(`docs/basic-vocab-2025-content-reference-migration.md`)에서 B(42건)
중 18건은 진짜 source 오류였고, 나머지 26건(문서에선 "24건"으로 추정했으나
실제로는 26건 — 3절)은 앱 `partOfSpeech` 스키마가 의존명사/관형사를
표현하지 못해서 생긴 근사 문제임을 확인했다. 이번 단계는 **조사·설계
전용**이다 — `content/lexemes.json`의 top-level `partOfSpeech`는
한 글자도 바꾸지 않았다.

## 1. 현재 앱 품사 스키마

코드 기준(`scripts/content-schema.mjs`, `src/lib/units.ts`)으로 확정:

```js
// scripts/content-schema.mjs
export const PART_OF_SPEECH = [
  "noun", "verb", "adjective", "adverb", "pronoun", "number", "interjection",
];
```

`src/lib/units.ts`의 TypeScript `PartOfSpeech` union도 동일한 7개다.
**의존명사·관형사에 대응하는 카테고리가 없다.**

### 사용처

| 사용 위치 | 용도 | 새 품사 추가 시 영향 |
|---|---|---|
| `scripts/content-schema.mjs` (`LexemeSchema.partOfSpeech`) | `content/lexemes.json` 스키마 검증(Zod enum) | enum에 새 값 추가 필요 |
| `scripts/build-content.mjs` | `content/`→`src/data/units.json` 그대로 복사 | 무변경(그대로 통과시킴) |
| `src/lib/units.ts` (`PartOfSpeech` type) | TypeScript 타입 | union에 새 값 추가 필요 |
| `src/lib/quiz.ts` `distractorPools()` | **같은 품사 단어를 우선 오답 후보로 고름**(`item.partOfSpeech === word.partOfSpeech`) — 실제 로직 사용, 정답성에는 영향 없음(폴백 티어가 있어 오답 후보가 부족해도 전체 풀에서 채움) | 카테고리가 세분화되면 해당 단어들의 "우선 풀"이 작아짐(폴백으로 흡수됨, 8절) |
| `scripts/audit-word-usage.mjs` `inflectionRoots()`/`auditWord()` | `partOfSpeech==="verb"\|\|"adjective"`일 때만 용언 활용 어미(다/하다 등) 제거 로직 적용 | 관형사가 "adjective"로 남아있으면 활용 어미 제거 로직이 잘못 걸릴 수 있으나, **실측 결과 8건 전부 "다"로 끝나지 않아 현재는 무해함**(4절) |
| 앱 UI(`src/components/*`, `src/routes/*`) | **검색 결과 없음 — 사용자 화면에 품사가 전혀 표시되지 않는다** | 없음 |

## 2. 24건 재확인 결과 — 실제로는 26건

3B-1B 보고서는 "B 42건 중 18건 real bug + 24건 schema 근사"로 어림잡았다.
직접 재계산한 결과:

- **18건**: `bookMeta.posLabel` 자체가 구 extractor 버그로 틀렸던 것(3B-1B에서 이미 교정 완료)
- **나머지는 24건이 아니라 26건**이다.

**source posLabel 분포(26건)**:

| source posLabel | 건수 |
|---|--:|
| 의존명사 | 18 |
| 관형사 | 8 |
| **합계** | **26** |

전체 26건 목록은 `data/jeju-basic-vocab-2025/part-of-speech-schema-audit.json`에
저장했다(seq/jeju/standard/sourcePosLabel/currentPartOfSpeech/sourceStableId/unitPlaced
필드). **26건 전부 이미 유닛에 배정되어 현재 앱에서 학습 가능한 상태다**
(`unitPlaced: true`).

예시(전체는 JSON 참고):

| seq | jeju | standard | source posLabel | current partOfSpeech |
|---|---|---|---|---|
| 90108 | 디 | 데 | 의존명사 | noun |
| 90114 | 설 | 살 | 의존명사 | noun |
| 90270 | ᄒᆞᆫ | 한 | 관형사 | adjective |
| 90272 | 시 | 세 | 관형사 | adjective |
| 90449 | 뒈 | 되 | 의존명사 | noun |

## 3. 전체 원장 검사

`content/lexemes.json` 전체(1,046개 lexeme)를 다시 훑었다.

- `bookMeta.posLabel == "의존명사"`인데 `partOfSpeech == noun`인 항목: **18건**(2절과 동일 집합, 새로 발견된 것 없음)
- `bookMeta.posLabel == "관형사"`인데 `partOfSpeech == adjective`인 항목: **8건**(동일)
- **2025 기본어휘 출처가 아닌 391개 lexeme**(`bookMeta` 필드 자체가 없음, 기존 jeju.go.kr 사전 출처)는 **이 방식으로 감사가 불가능하다** — 원본 사전(`data/dictionary/jeju_dialect_full.json`)을 직접 확인한 결과 `category_code`/`category_name`이 "때·기후" 같은 **주제 분류**일 뿐 **문법 품사 정보를 아예 담고 있지 않다**. 즉 이 391개 중에도 의존명사/관형사를 다른 품사로 잘못 근사한 사례가 있을 수 있지만, source에 품사 라벨 자체가 없어서 **이번 방식(source posLabel과 대조)으로는 발견도 검증도 못 한다** — 별도의 언어학적 재검토가 필요하며 이번 범위 밖이다.

결론: **이번에 감사로 확인 가능한 근사 문제는 정확히 26건, 전부 2025
기본어휘 출처 안에 있다.**

## 4. 세 가지 정책안 비교

### 안 A — 현재 근사 유지(의존명사→noun, 관형사→adjective)

- **장점**: 코드 변경 없음, 기존 989개 학습 데이터·퀴즈 로직 무영향.
- **단점**: 관형사(한/두/세/네/다섯...)를 "형용사"라고 부르는 건 국어 문법상
  명백히 틀리다 — 다만 **1절에서 확인했듯 이 라벨을 사용자에게 보여주는
  화면이 현재 하나도 없다.** 그래서 "틀린 걸 사용자에게 보여준다"는
  피해는 **지금은 발생하지 않는다.**
- 향후 신규 71개 후보 중 의존명사/관형사는 **0건**(9절) — 당장 이 문제가
  더 커질 일은 없다.

### 안 B — `dependent_noun`/`determiner` 정식 카테고리 신설

영향 분석:

| 항목 | 영향 |
|---|---|
| `scripts/content-schema.mjs` | `PART_OF_SPEECH` 배열에 2개 추가 |
| `src/lib/units.ts` | `PartOfSpeech` union에 2개 추가 |
| `content/lexemes.json` | 26개 lexeme의 top-level `partOfSpeech` 변경 필요(이번 단계 금지 대상) |
| `src/lib/quiz.ts` | 코드 수정은 불필요(이미 `===` 비교라 새 값도 그대로 동작). 다만 의존명사 18개·관형사 8개가 각각 새 카테고리로 쪼개지면, 그 단어들의 "우선 오답 풀"이 지금(noun 490개/adjective 100개)보다 훨씬 작아진다(18개/8개) — 폴백 티어가 있어 **정답성엔 문제 없지만 오답 다양성이 줄 수 있다.** |
| `scripts/audit-word-usage.mjs` | `isVerbLike` 조건에서 관형사가 빠지면 오히려 더 정확해짐(현재도 무해하지만 원칙적으로 더 맞음) |
| 기존 989개 | 26개만 영향, 나머지 963개 무관 |
| 신규 71개 | 영향 없음(의존명사/관형사 0건) |
| 하위 호환 | `bookMeta.posLabel`은 이미 정확해서 별도 마이그레이션 불필요 — `partOfSpeech`만 바꾸면 됨 |

### 안 C — 내부 coarse POS 유지 + 표시용 source POS 분리

```json
{
  "partOfSpeech": "noun",           // 내부 로직(quiz 등)용, 그대로 유지
  "bookMeta": { "posLabel": "의존명사" }  // 이미 존재하는 필드 — 표시가 필요해지면 이걸 쓴다
}
```

- **핵심 발견**: 이 필드는 **이미 존재한다.** 2025 기본어휘 출처 655건은
  전부 `bookMeta.posLabel`에 정확한 한국어 품사가 있다(3B-1B에서 18건
  교정 완료). 즉 안 C는 **새로 만들 게 없다** — "`partOfSpeech`는 내부
  coarse 로직 전용이고 문법적 진실이 아니다"라는 **정책만 명문화**하면
  된다.
- 391개(비-2025책 출처)는 이 방식의 혜택을 못 받는다(source POS 자체가
  없음, 3절) — 하지만 이 문제는 안 B를 택해도 똑같이 못 푼다(source에
  품사 정보가 없으니 뭘 넣어도 근거가 없다).
- 코드 변경량이 사실상 0에 가깝다(문서화 + 향후 UI가 품사를 보여줄
  일이 생기면 `bookMeta.posLabel ?? koreanLabelOf(partOfSpeech)` 같은
  헬퍼 하나만 추가하면 됨 — 지금 당장은 그 UI 자체가 없으므로 이마저도
  안 만들어도 된다).

## 5. 판단 기준 비교표

| 기준 | A 근사 유지 | B 카테고리 신설 | C 로직/표시 분리 |
|---|---|---|---|
| 언어학적 정확성(내부 데이터) | 낮음(정확한 라벨은 `bookMeta`에 이미 있지만 `partOfSpeech`는 틀림) | 높음 | 중간(내부 `partOfSpeech`는 여전히 근사, 표시용은 정확) |
| 사용자 이해 | 영향 없음(품사 비노출) | 영향 없음(품사 비노출) | 영향 없음(품사 비노출), **미래에 노출해도 안전** |
| 코드 변경량 | 0 | 중간(schema+type+26개 데이터, quiz 오답 풀 재검토 권장) | 거의 0(정책 문서화만) |
| 기존 데이터 호환성 | 완전 호환 | 26개 lexeme 값 변경 필요 | 완전 호환(필드 추가 없음, 이미 있는 필드 재해석) |
| 퀴즈 영향 | 없음 | 오답 풀 다양성 소폭 감소 가능(정답성 영향 없음) | 없음 |
| 향후 확장성 | 낮음(같은 문제 반복 시 임시방편만 쌓임) | 높음(정식 카테고리) | 중간(coarse 로직은 그대로, 표시 정확도만 확보 — 새 품사가 로직에 필요해지면 그때 안 B로 승격 가능) |
| 유지보수 난이도 | 낮음 | 중간(스키마 변경은 항상 회귀 위험 수반) | 낮음 |

## 6. 최종 추천 — **안 C**

**JEJUMAL에는 안 C(내부 coarse POS 유지 + `bookMeta.posLabel`을
표시용 source POS로 재해석)를 추천한다.**

이유 3가지:

1. **`partOfSpeech`가 사용자에게 전혀 노출되지 않는다**(1절 — 검색
   결과 0건). "틀린 품사명을 사용자에게 보여주는 설계는 피한다"는
   원칙이 지키려는 피해가 지금은 애초에 발생하지 않는다 — 안 B로
   급하게 스키마를 확장할 압박이 없다.
2. **정확한 라벨이 이미 존재한다.** `bookMeta.posLabel`이 이미 26건
   전부 정확한 한국어 품사를 담고 있어서(3B-1B에서 검증 완료), 안 C는
   새 데이터를 만들 필요 없이 **"이 필드를 표시용으로도 쓸 수 있다"는
   정책만 정하면 끝난다** — 안 B의 스키마 확장·26개 데이터 마이그레이션·
   quiz 오답 풀 재검토라는 비용이 전부 불필요해진다.
3. **신규 71개에서 이 문제가 재발하지 않는다**(9절, 의존명사/관형사
   0건). 지금 스키마를 확장해도 앞으로 막을 문제가 없다 — 나중에 실제로
   품사를 UI에 보여줘야 하거나(예: 학습 화면에 "관형사" 배지 추가) quiz
   로직이 의존명사/관형사를 진짜 다르게 취급해야 할 필요가 생기면 그때
   안 B로 승격하면 된다(이 결정은 되돌릴 수 없는 게 아니다).

**안 C의 실제 정책**: `partOfSpeech`는 앱 내부 coarse 그룹핑(퀴즈 오답
풀링, 스키마 검증)에만 쓰는 값이지 문법적 진실이 아니라고 명문화한다.
2025 기본어휘 출처 lexeme의 정확한 품사가 필요하면 `partOfSpeech`가
아니라 `bookMeta.posLabel`을 본다. 391개(비-2025책 출처)는 애초에
이런 정밀 라벨이 없으므로 이번 정책의 적용 대상이 아니다(3절).

## 7. 사용자 UI 노출 여부

`src/components/*`, `src/routes/*` 전체를 검색한 결과 **`partOfSpeech`를
렌더링하는 코드는 없다.** 학습 화면·퀴즈 화면 어디에도 품사가 표시되지
않는다. 따라서 "관형사를 형용사로 잘못 표시"하는 실제 사용자 피해는
**현재 0건**이다.

## 8. 퀴즈 정답성 영향

`src/lib/quiz.ts`의 `distractorPools()`만 `partOfSpeech`를 쓴다 — 정답
후보가 아니라 **오답(distractor) 후보 풀**을 고르는 데만 쓰인다.

- 1순위 풀: 같은 유닛의 다른 단어
- 2순위 풀: `partOfSpeech`가 같은 단어(전체 989개 중)
- 3순위 풀: 전체 단어(폴백, `take(false)`로 유사도 제한 없이 채움)

새 카테고리를 만들어 26개(18+8)가 작은 풀로 옮겨가도, 2순위 풀이
작아질 뿐 3순위 폴백이 항상 채워주므로 **정답성 버그가 생길 가능성은
없다.** 다만 그 26개 단어의 오답이 "전혀 무관한 품사"에서 뽑힐 확률이
약간 올라갈 수 있다(예: 의존명사 "디"의 오답 후보가 지금은 noun 490개
풀에서 나오지만, 새 카테고리를 만들면 의존명사 17개 풀 우선 → 부족분만
전체 폴백) — 미미한 품질 변화이지 정답성 문제는 아니다.

`scripts/audit-word-usage.mjs`의 `isVerbLike` 로직은 26건 중 어느
표제어도 "다"로 끝나지 않아(관형사 8개: 한/한두/시/니2/다슷2/ᄋᆞ섯2/
ᄋᆞ답2/아옵2 — 전부 활용하지 않는 형태) 실질적 영향이 없음을 직접
확인했다.

## 9. 신규 71개와의 연관성

`data/jeju-basic-vocab-2025/content-new-candidates-3a.json`(71개, 아직
미반영)의 품사 분포:

| pos | 건수 |
|---|--:|
| 명사 | 34 |
| 형용사 | 13 |
| 동사 | 10 |
| 부사 | 7 |
| 감탄사 | 6 |
| 수사 | 1 |
| **의존명사** | **0** |
| **관형사** | **0** |

**의존명사·관형사는 신규 후보에 하나도 없다.** 지금 26건만을 위한
일회성 문제이지, 앞으로 반복될 문제가 아니다 — 6절 추천의 근거 중
하나다.

## 10. 실제 구현 시 변경 파일(안 C 기준, 이번엔 실행하지 않음)

- `AGENTS.project.md` 또는 `DATA.md` — "`partOfSpeech`는 내부 coarse
  그룹핑용, 정확한 품사가 필요하면 `bookMeta.posLabel`을 본다"는 정책
  한 문단 추가.
- `src/lib/units.ts` — (선택) `Word` 타입에 이미 있는 `bookMeta` 같은
  표시용 필드가 없으므로, 미래에 UI가 품사를 보여줘야 할 때만 build
  파이프라인에서 `displayPartOfSpeech` 같은 필드를 새로 뽑으면 된다
  — **지금 당장은 파일 변경 불필요.**
- 코드 변경 0건으로도 정책 문서화만으로 충분하다는 게 이 안의 핵심.

(참고: 안 B를 나중에 선택하게 되면 `scripts/content-schema.mjs`,
`src/lib/units.ts`, `content/lexemes.json`(26건), `src/lib/quiz.ts`의
오답 풀 크기 재검토가 필요하다 — 5절 표 참고.)

## 11. Git

- branch: `codex/part-of-speech-schema-audit`
- commit: 이 문서와 같은 커밋
- PR: 생성 후 URL 기재 — **merge하지 않음**

## 12. 다음 단계

### READY

품사 정책이 확정됐습니다(안 C 추천: 내부 coarse POS 유지 +
`bookMeta.posLabel`을 표시용 source POS로 재해석, 코드 변경 없음).
사용자 승인 후 정책 문서화만 반영하거나, 다른 안을 택할 경우 5절
표를 기준으로 구현 범위를 정할 수 있습니다. 그 다음 3C(신규 71개
중 실제 앱 핵심 단어로 넣을 것 개별 선별)로 진행할 수 있습니다.
