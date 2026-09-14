# 다음 할 일 (처음 보는 사람용)

이 문서 하나만 읽으면 "지금 뭘 하고 있고, 다음에 뭘 할 건지" 알 수
있게 정리했다. 지나간 작업의 자세한 경위는
[`product-improvement-plan.md`](product-improvement-plan.md)의
"현재 상태와 문서 지도"를 보면 된다.

이 프로젝트에는 성격이 다른 두 트랙이 있다.

- **A. 콘텐츠 정합성 트랙** — "이 1,000단어가 진짜 쓰이는 제주어가
  맞나?"를 확인하고 고치는 작업. 예문 채우기(P1-A~H)가 최근에
  집중적으로 진행됐다.
- **B. 제품/UX 트랙** — 퀴즈 버그·복습 알고리즘·트랙 구조 같은 앱
  기능 개선. 이전에 "체크리스트가 코드를 못 따라간다"고 지적했던
  재감사가 **완료됐고(P0-1~P0-4), PR #17~#22로 반영·병합됐다.**

---

## A. 콘텐츠 정합성 트랙 — 남은 일 (우선순위 순)

### A-1. 예문 채우기 — 제일 중요 (474개 남음)

2025년 제주학연구센터 기본어휘에서 새로 들어온 단어 중 예문이 없던
것이 원래 약 598개(유닛 배치된 것 기준)였는데, **P1-A~H(PR #23~#31)에서
124개를 실제 근거 있는 예문으로 채웠다.** 유닛에 배치된 단어 기준
`pendingExample`이 **474개 남았다**(전체 `pendingExample`은 533개,
그중 59개는 아직 유닛 미배치 — A-3 참고). `content/examples.json`은
391개 → 515개로 늘었다.

- 진행 방식(P1-A~H에서 확립된 원칙, 계속 지킨다):
  - AI Hub 말뭉치(`data/aihub/`) 원문에서 그 단어가 실제 쓰인 문장을
    최우선으로 찾는다. 없으면 `scripts/report-example-candidates.mjs`로
    후보를 자동 추출하되, **자동 판정은 우선순위 정렬일 뿐 승인이
    아니다** — 사람(PM) 검토를 거친 것만 반영한다.
  - 완결된 학습 문장이 안 되는 파편·동형이의 오탐·근거 불명은 억지로
    채우지 않고 `pendingExample`을 그대로 둔다(각 wave에서 "SOURCE_GAP"으로
    남긴 항목들 — Wave 0~5는 이후 라운드에서도 다시 열지 않기로 함).
  - 예문을 지어낼 땐 `review.naturalness: "provisional"`로 명시하고
    검증 안 된 걸 검증됐다고 표시하지 않는다.
  - **제주특별자치도·제주학연구센터 구술자료집(2017–2020)**을
    P1-G부터 추가 출처로 쓰기 시작했다(공공누리 **제1유형**,
    출처표시만 하면 재사용 가능). ⚠️ 같은 플랫폼의 **'제주어 교육
    자료' 아카이브는 공공누리 제4유형**이라 이 앱(상업적 이용 포함)의
    예문 출처로 **재사용/변형해서는 안 된다** — 별도 허가 없이 절대
    가져다 쓰지 말 것(`DATA.md`에 출처·이용조건 주석으로 기록됨).
  - CONTENT_CONTROLLED로 분류돼 종결형·문장틀이 지나치게 반복되던
    기존 예문 154개(P1-H, 2회 배치)는 PM 확정 문장으로 교체해 다양성을
    높였다 — 새 단어를 채운 건 아니고 기존 예문 품질 개선.
- 남은 474개도 같은 원칙(말뭉치 우선 → 후보추출기 → PM 승인)으로
  wave 단위(Wave 6~9는 진행 중, 나머지는 미착수 wave)로 계속
  진행하면 된다.

### A-2. PUA(옛한글 표기 깨짐) 마무리 — medium 16개 / low 7개

`data/jeju-basic-vocab-2025/pua-glyph-mapping.json`(고유 glyph 82개 —
3C-3B에서 U+E56E 1건이 추가돼 81→82) 기준 confidence 분포는
**high 59 / medium 16 / low 7**이다(초기 36/23/22에서, 사전·말뭉치
대조 재검토로 다수가 high/medium으로 승급했고 U+E56E는 이번 3C에서
`ᄆᆞᆷ국`으로 확정 완료됨 — 그 1건은 이 82개 중 high로 반영됨).

- medium 16개: 모양+뜻은 통하는데 확증까지는 못한 것들 — 자체
  사전(`data/dictionary/jeju_dialect_full.json`)·말뭉치와 다시
  대조해보면 몇 개는 더 확정할 수 있을 것으로 보인다.
- low 7개: 여러 번 봐도 애매해서 사람(실제 화자나 국어사 전문가)
  판단이 필요하다. `data/jeju-basic-vocab-2025/pua-low-review-7.png`에
  실제 PDF 크롭 이미지가 정리돼 있으니 그걸 보여주면 된다.

### A-3. 유닛 미배치 59개 배치

랭크 시스템(`src/lib/units.ts`)이 "테마 10개 × 유닛 10개" 정확히
100유닛 그리드에 고정돼 있어서, 지금 배치 못한 59개(형용사·감탄사
위주 57개 + 3C-3A에서 되돌린 `저펜`/`어느제2` 2개)를 넣으려면 이
그리드 자체를 어떻게 늘릴지 먼저 정해야 한다. 두 방향이 있다:

1. 기존 10개 테마 각각을 유닛 11개, 12개... 로 늘리기 (랭크 승급
   기준값도 같이 조정 필요)
2. 11번째 테마를 새로 만들고 랭크/웨이브 구조 자체를 재설계

`same_meaning_different_form 정리` 라운드에서 유닛 크기를 8~10개로
유연하게 만든 전례가 있으니, 완전히 새로 설계하기보다 그 위에서
확장하는 게 자연스러울 수 있다.

### A-3.5. 2025 기본어휘 stable ID 마이그레이션 — 3B-2.1까지 완료

`docs/basic-vocab-2025-stable-id-design.md`(3A) → `docs/basic-vocab-2025-stable-id-production.md`(3B-1A) →
`docs/basic-vocab-2025-content-reference-migration.md`(3B-1B) →
`docs/part-of-speech-schema-audit.md`(3B-2) 순서로 진행했다.
`content/lexemes.json`의 655개 `bookMeta.bookId`가 이제 stableId다
(`bookMeta.legacyBookId`에 예전 값 보존). E(31건) 병합 오염도 전부
정제했다.

B(42건) 중 진짜 source 오류였던 18건은 고쳤고, 나머지 **26건**
(`posLabel`은 이미 정확했고 앱 `partOfSpeech`에 의존명사/관형사
카테고리가 없어서 noun/adjective로 근사된 것)은 **안 C(내부 coarse
POS 유지 + 정확한 원자료 품사가 필요하면 `bookMeta.posLabel` 사용)로
정책이 확정됐다** — `AGENTS.project.md`/`DATA.md`에 공식 규칙으로
기록(3B-2.1). `partOfSpeech`가 사용자 화면에 노출되는 곳이 없고
신규 71개에도 이 문제가 재발하지 않아, 스키마 확장(`dependent_noun`/
`determiner` 신설)은 지금 하지 않는다 — 26건의 top-level
`partOfSpeech`도 그대로 둔다.

### A-3.6. 3C — 신규 71개 개별 선별 및 반영 — **COMPLETE**

`docs/new-71-living-vocab-audit.md`(3C-1~3C-1.2) → `docs/3c2-vocab-integration-design.md`(3C-2) →
`docs/3c2-1-core-placement-validation.md`(3C-2.1) 순서로 71개
신규 후보를 감사하고 통합 방식을 설계한 뒤, 다음을 실제 반영했다.

- **CORE_ADD 2개**(`삼춘`, `나냥으로`) — main curriculum에 실제
  반영 완료(3C-3A). 자리 확보를 위해 `저펜`(90128)·`어느제2`(90294)를
  하드 삭제하지 않고 `pendingPlacement: true`로 되돌렸다
  (3C-3A/3C-3A.1). `standard`가 없는 2025 source 항목의 learner
  gloss 정책도 이때 확정했다(`DATA.md` 참고).
- **CULTURE_ADD 25개** — main 100유닛에 섞지 않고 별도
  Culture Track(`content/culture-items.json` → `scripts/build-culture.mjs` →
  `src/data/culture-items.json` → `/culture`, `/culture/$id`)으로
  구현 완료(3C-3B 설계 → 3C-3B.1/3C-3B.2 PUA 선행 이슈 해소 →
  3C-3C 구현). main 유닛/퀴즈/SRS와 완전히 분리돼 있다
  (`docs/3c3b-culture-track-contract.md`, `docs/3c3c-culture-track-mvp.md`).
- **HOLD 34개 / DO_NOT_ADD 10개** — 이번 반영 대상 아님(근거는
  `docs/new-71-living-vocab-audit.md` 참고), 향후 근거가 바뀌면
  재검토 가능.

**Post-3C backlog**(3C 완료의 blocker 아님, 향후 별도 작업 — 아직
착수 안 됨):

- Culture 25개 `learnerGloss` 사람 검수(현재 전부
  `pendingGloss: true`, 상세 화면은 definition 원문으로 대체)
- Culture 전용 progress(`cultureProgress`, 열람 여부 저장) 실제 구현
- Culture 전용 quiz
- 풍부한 문화 해설(`culturalNote`/`culturalSources` 실채움, 공식
  출처 확보 필요)
- 이미지/사진
- 공식 음원
- bookmark
- life-dialect ↔ culture 양방향 UI 통합

### A-4. (참고용, 액션 불필요) same_meaning_different_form 나머지

`same-meaning-different-form-review.md`의 (B) 둘 다 확인된 진짜
변이형 10개, (C) 둘 다 증거 약한 6개는 **의도적으로 손 안 댐** —
재검토 필요 없음.

---

## B. 제품/UX 트랙 — P0 재감사 완료, PR #17~#22로 반영됨

이전 버전의 이 문서는 `product-improvement-plan.md`의 P0 체크리스트가
실제 코드 상태와 안 맞는 것 같다며 재감사를 먼저 하자고 제안했다.
**그 재감사가 실제로 이뤄졌고, 확인 결과 반영이 필요했던 부분은
고쳐서 각각 별도 브랜치 + PR로 병합됐다(PR #17~#22).**

- **B-1A** — 퀴즈 인트로 화면이 "듣기 10 + 읽기 10"을 항상 그대로
  표시하던 걸, `getLessonQuestionCounts()`로 `buildLesson()`이 실제
  생성하는 문제 수(오디오 없는 유닛은 듣기 문제가 적음)와 일치시켰다.
- **B-1B** — **한국어 TTS(`speechSynthesis`) 폴백을 오디오 재생
  경로에서 완전히 제거했다**(`src/lib/audio.ts`). 검증된 로컬
  음원(`hasVerifiedAudio()`)이 없으면 조용히 표준어 발음으로
  때우는 대신, "발음 음원 준비 중"이라고 명시하고 자동재생도 걸지
  않는다(`flashcard.tsx`) — 제주어/옛한글 표기를 표준어 TTS가
  잘못 발음할 위험을 원천 차단.
- **B-2A** — `reviewStatus: "blocked"` 단어를 빌드 단계
  (`assembleUnits()`)에서부터 `src/data/units.json` 생성 시 제외하도록
  강화했다(기존엔 퀴즈 단계에서만 걸렀음). 현재 `blocked` 단어가
  0개라 눈에 보이는 변화는 없지만 회귀를 막는 안전장치.
- **B-2B** — lexeme 스키마에 선택적 `conceptId` 오버라이드 필드를
  추가하고, 퀴즈의 동의어 오답 중복 제거 로직이 `standard` 문자열
  대신 이 값을 우선 쓰도록 했다.
- **B-2D / B-2E** — 동형이의어 "concept" 분리·묶음 작업(줍다/줍다¹,
  다리·달·달다·띠·살·쓰다·열다·갈다·감다·뜨다·맡다 등 총 17개
  lexeme)을 `conceptId`/`quizGloss`로 반영해, **읽기 퀴즈**에서
  뜻이 다른 동형이의어끼리 오답 후보로 섞이지 않게 했다(듣기 퀴즈는
  여전히 `standard` 기준). B-2E 커밋이 "P0 종료를 검증한다"고 명시.

**결론: P0(출시 전 필수) 4개 항목 모두 코드에 실제로 반영돼 있고
테스트로 고정됐다.** `product-improvement-plan.md`의 체크박스 자체를
갱신하는 건 이번 스코프에 포함하지 않았다(이 문서와 별개로 필요하면
후속 작업으로).

### B트랙 작업 방식 — 모듈별 브랜치 + PR (계속 유지)

P0 재감사 항목들은 실제로 이 방식대로 진행됐다: 항목마다 새 작업
브랜치를 파고, PR을 열어 리뷰 가능하게 하고, 병합 여부는 사용자가
결정했다. **앞으로 B트랙에 남는 항목(P1 이후)도 같은 방식을 유지한다.**
콘텐츠 트랙(A)은 지금처럼 한 브랜치
(`claude/jeju-dialect-education-feedback-2dtss7`)에 계속 커밋을
쌓는 방식을 유지한다.

P1 이후 로드맵은 `product-improvement-plan.md`를 참고하되, P0와
마찬가지로 착수 전에 코드에 이미 반영돼 있지 않은지 먼저 확인하는
습관을 유지한다.

---

## 지금 당장 뭐부터?

우선순위 추천(이유는 각 항목 참고):

1. **A-1 예문 채우기 계속(남은 474개)** — B의 P0 재감사가 끝났으니
   콘텐츠 트랙에서 가장 사용자 체감 효과가 큰 이 작업이 다시
   최우선이다. Wave 6~9는 진행 중이니 이어서, 이후 wave는 순서대로.
2. **B트랙 P1 항목 확인** — `product-improvement-plan.md`의 P1~P5도
   P0처럼 실제 코드 상태를 먼저 확인한 뒤 필요한 것만 브랜치+PR로
   진행한다.
3. A-2(PUA), A-3(유닛 배치)는 순서 상관없이 병행 가능.
