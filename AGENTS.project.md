# JEJUMAL — 프로젝트 전용 에이전트 지침

이 파일은 `AGENTS.md`(플랫폼 범용 계약서, TanStack Start 스캐폴딩 규칙 등)
보다 **이 프로젝트에 한해 우선한다.** 이 저장소를 처음 보는 에이전트는
아래를 순서대로 읽어라.

## 1. 이 프로젝트는 뭔가

소리로 배우는 **제주어(제주 방언) 학습 앱**. React + TanStack Start.
"앱 기능"보다 **콘텐츠(단어·뜻·예문)의 정확성**이 훨씬 중요한
프로젝트다 — 틀린 방언을 가르치면 학습 앱으로서 존재 이유가 없다.

## 2. 먼저 읽을 순서

1. [`README.md`](README.md) — 5분 개요
2. [`DATA.md`](DATA.md) — 콘텐츠가 어디서 왔고 어떻게 빌드되는지
3. [`docs/product-improvement-plan.md`](docs/product-improvement-plan.md)의
   "현재 상태와 문서 지도" — 지금까지 뭘 했는지, 개별 작업 기록 문서
   전체 링크
4. [`docs/NEXT-STEPS.md`](docs/NEXT-STEPS.md) — 다음에 뭘 할지, 우선순위

이 네 개만 읽으면 대화 기록 없이도 프로젝트를 파악할 수 있어야 한다.
**"아까 대화에서 말한 것처럼"이 아니라 이 문서들을 기준으로 판단할 것.**

## 3. 데이터 흐름 (절대 헷갈리면 안 되는 것)

```
content/{units,lexemes,examples}.json   ← 사람이 고치는 원장(source of truth)
        │  node scripts/build-content.mjs
        ▼
src/data/units.json                     ← 빌드 산출물, 직접 편집 금지
```

**`src/data/units.json`을 손으로 고치지 마라.** `content/` 아래를 고치고
`node scripts/build-content.mjs`를 실행해서 재생성한 뒤, 그 결과까지
같이 커밋한다. 둘이 어긋나면 `scripts/build-content.test.mjs`가 실패한다.

## 4. 콘텐츠 작업 시 지켜야 할 것 (이번 세션에서 실제로 문제가 됐던 것들)

- **제주어 단어·예문을 지어내지 마라.** 확실한 근거(자체 사전
  `data/dictionary/jeju_dialect_full.json`, AI Hub 말뭉치
  `data/aihub/`, 2025 기본어휘 `data/jeju-basic-vocab-2025/`, 생활방언
  `data/life-dialect/`) 없이 만든 예문은 `review.naturalness:
  "provisional"`로 명시하고, 검증됐다고 절대 표시하지 마라.
- **동형이의어 번호 표기가 세 가지 방식으로 섞여 있다**: 일반 숫자
  (`짓1`), 하이픈 없는 숫자(`뀌다2`), **위첨자 숫자**(`빈싹²`, 유니코드
  U+00B2 등). 이걸 벗겨내는 정규식에서 위첨자를 빼먹으면 "사전에 없다"고
  잘못 판단하게 된다 — 이번 세션에서 **세 번이나** 이 실수를 할
  뻔했다. 정규식은 `[0-9¹²³⁴⁵⁶⁷⁸⁹⁰-]+$` 처럼 위첨자까지 포함해야 한다.
- **PUA 문자(U+E000–F8FF)는 터미널/일부 폰트에서 안 보이거나 빈칸처럼
  보인다.** "글자가 없다"고 착각하지 말고 `codePointAt`/`hex(ord())`로
  실제 코드포인트를 확인해라. `data/jeju-basic-vocab-2025/README-pua-mapping*.md`
  세 파일에 이 문제와 해결 방법론이 다 있다.
- **2025년 책(`data/jeju-basic-vocab-2025/`)은 전체 제주어의 일부일
  뿐이다.** "이 책에 없다"가 "죽은 말이다"라는 뜻이 아니다 — 자체
  사전에도 없어야 진짜 근거 없는 말이다(`docs/basic-vocab-2025-full-integration.md`
  참고, 529개 후보를 자체 사전과 대조해보니 진짜는 7개뿐이었던 사례).
- **말뭉치 매칭에서 짧은 headword(1글자 등)는 뜻까지 확인해라.**
  homograph 오염 방지 로직이 `scripts/audit-word-usage.mjs`에 있으니
  비슷한 걸 새로 짤 땐 참고할 것.

## 5. 콘텐츠를 고쳤으면 커밋 전에 반드시 이 순서로 검증

```bash
node scripts/build-content.mjs                    # content/ → src/data/units.json
node scripts/qc-check.mjs                          # error 0건이어야 함(warn은 기존 이슈 무관하면 OK)
npx tsc --noEmit
npx eslint .
npx vitest run                                     # 42개 통과 기대
node --test 'scripts/**/*.test.mjs'                # 184/193 통과 기대(9개는 기존 실패, og:title 메타 관련, 무관)
node scripts/audit-word-usage.mjs --out data/aihub/word-usage-audit.json   # 콘텐츠 seq를 바꿨으면 재실행
node scripts/build-culture.mjs                     # content/culture-items.json을 고쳤으면 재실행
```

전부 통과(또는 기존과 동일한 기존 실패만 남음)한 뒤에만 커밋한다.
커밋 메시지에는 **무엇을 왜 바꿨는지, 무슨 근거로 판단했는지**를
한국어로 상세히 쓴다(이 저장소의 기존 커밋 로그가 그 톤의 예시다).

## 6. 작업 방식 — 트랙에 따라 다름

- **콘텐츠 트랙(단어/예문/뜻풀이 정확성)**: 지금 브랜치
  (`claude/jeju-dialect-education-feedback-2dtss7`)에 라운드별로 계속
  커밋. 새 브랜치 안 만듦.
- **제품/UX 트랙(퀴즈 로직, 복습 알고리즘, 트랙 구조 등 기능 코드)**:
  항목마다 **새 브랜치를 파고 PR을 만들어서** 사용자가 리뷰·로컬
  테스트 후 병합하는 방식으로 진행하기로 합의됨(`docs/NEXT-STEPS.md`의
  "B트랙 작업 방식" 참고). **코드 기능을 고칠 땐 이 방식을 따를 것.**
- 애매한 판단(단어를 지울지 말지, 표기를 뭘 주표기로 할지 등)은
  추측하지 말고 사용자에게 먼저 확인한다 — 이 저장소는 "일단 만들고
  나중에 고치기"보다 "확신 없으면 먼저 묻기"를 계속 지켜왔다.

## 7. 자주 헷갈리는 것

- `content/lexemes.json`의 표제어 수(1,046)와 실제 유닛에 배정돼
  화면에 나오는 수(989)가 다르다 — `pendingPlacement: true`인
  57개는 아직 유닛 미배정. `pendingExample: true`인 655개는 예문이
  없다. 둘 다 의도된 상태지 버그가 아니다.
- 유닛 크기가 전부 10개는 아니다(8~10개 허용, `UnitSchema` 참고) —
  `same_meaning_different_form 정리` 라운드에서 대체 재고 부족으로
  일부 유닛만 줄었다.
- 랭크 시스템(`src/lib/units.ts`)은 "테마 10개 × 유닛 10개" 고정
  그리드다. 여기에 없는 테마/유닛 ID를 만들면 앱 진행 화면에서
  절대 도달 불가능한 콘텐츠가 된다 — 새 콘텐츠를 유닛에 넣을 땐 반드시
  이 그리드 구조를 먼저 확인할 것.
- **`partOfSpeech`는 정확한 국어학적 품사가 아니라 앱 내부용 coarse
  분류다**(noun/verb/adjective/adverb/pronoun/number/interjection
  7개뿐 — `scripts/content-schema.mjs`). 의존명사는 `noun`, 관형사는
  `adjective`로 근사돼 있다(3B-2 감사, `docs/part-of-speech-schema-audit.md`
  참고, 실측 26건: 의존명사 18 + 관형사 8). 2025 기본어휘 출처
  lexeme의 **정확한 원자료 품사가 필요하면 `bookMeta.posLabel`을
  우선 참고할 것** — `partOfSpeech`를 문법적 진실로 오해하지 마라.
  향후 품사를 화면에 표시하게 되면 `bookMeta.posLabel`이 있으면
  그걸 우선 쓰고, 없을 때만 `partOfSpeech`의 한국어 라벨로 대체한다.
  이 근사 mismatch를 발견했다고 자동으로 top-level `partOfSpeech`를
  고치지 말 것 — 스키마에 새 카테고리(`dependent_noun`, `determiner`
  등)를 추가할지는 quiz/문법학습 로직이 실제로 세부 품사를 요구하게
  되거나, 신규 데이터에서 이 문제가 반복 증가하거나, UI가 세부 품사를
  직접 가르치게 될 때 재검토한다(현재 신규 후보 71개에는 의존명사·
  관형사가 0건이라 스키마를 지금 늘릴 근거가 없다).
- 2025 source가 `has_standard_equivalent:false`이면 `standard`를
  임의 동의어로 만들지 말고, 공식 definition에서 직접 도출한 concise
  learner gloss를 사용하며 no-equivalent provenance를 유지한다
  (`DATA.md`의 "`standard` 필드와 '표준어 대응 없음' 항목" 참고).
- **제주 문화어(Culture Track)는 `content/culture-items.json`이
  source of truth다.** main `content/lexemes.json`/`content/units.json`에
  직접 섞지 않는다 — main 유닛/퀴즈 오답 pool/SRS 복습 큐 어디에도
  들어가면 안 된다(`docs/3c3b-culture-track-contract.md`,
  `scripts/culture-isolation.test.mjs` 참고). 새 문화어를 넣을 땐
  `node scripts/build-culture.mjs`로 검증·재생성한다.
