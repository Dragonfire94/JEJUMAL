# 3B-1B — 2025 기본어휘 content reference 655건 stable ID 마이그레이션

3B-1A(`docs/basic-vocab-2025-stable-id-production.md`)에서 도입한
stableId production 인프라를 이용해, `content/lexemes.json`의 2025
기본어휘 출처 참조 655건을 순번 기반 `jbv2025-XXXX`에서 stableId로
옮기고, 구 extractor의 병합 오류로 오염된 `bookMeta`(31건)만 정제했다.
**단어 자체(jeju/standard), top-level `partOfSpeech`, 유닛 배치,
예문, 신규 71개 추가는 이번 단계에서 건드리지 않았다.**

> **3C-3A.1 보정**: 이 655는 "2025 기본어휘 출처 lexeme은 영원히
> 655개"라는 뜻이 아니라, 3B-1B가 migration해야 했던 당시 historical
> cohort의 크기다. `scripts/migrate_basic_vocab_content_refs.mjs`의
> migration 대상은 `content-migration-mapping-3a.json`의 seq가
> 정의하며, 이후 3C 등에서 새로 추가되는 2025-source lexeme(stable
> ID로 처음부터 생성됨, 예: 삼춘/나냥으로)은 이 mapping cohort 밖이라
> 이 스크립트가 건드리지 않는다.

## 1. canonical reference 정책

- `bookMeta.bookId` — 이제부터 **stable source entry id**만 담는다
  (예: `"jbv2025-p020r-y03564"`). 순번 기반 값은 더 이상 없다.
- `bookMeta.legacyBookId` — migration 직전 old numeric bookId를 보존
  하는 audit/debug 전용 필드(신규). 새 데이터는 이 값을 참조하면 안 된다.

## 2. A/B/E 처리

| confidence | 건수 | 수행 내용 |
|---|--:|---|
| A | 582 | `bookId`→stableId, `legacyBookId` 추가만(다른 변경 없음) |
| B | 42 | `bookId`→stableId, `legacyBookId` 추가 + `bookMeta.posLabel`이 실제로 틀린 18건만 corrected 기준으로 교정(나머지 24건은 의존명사/관형사 근사 문제일 뿐 `posLabel` 자체는 이미 정확했음 — 3절 참고). **top-level `partOfSpeech`는 절대 변경 안 함** |
| E | 31 | `bookId`→stableId, `legacyBookId` 추가 + `bookMeta.definition`을 corrected definition으로 정확히 교체 + `bookMeta.otherJejuForms`에서 다른 source entry로 분리된 stray form 제거 + `posLabel`/`level` 필요시 교정 |

## 3. B(42건)에 대한 추가 발견 — 원인이 하나가 아니었다

3A는 "B 42건 전부 구 extractor의 우측라벨 버그가 원인"이라고 봤지만,
실제로 `bookMeta.posLabel`을 직접 비교해보니 **42건 중 18건만
`posLabel` 자체가 틀렸다**(진짜 구 extractor 버그 — 예: 하나/둘/넷이
"대명사"로 잘못 찍혔던 것). 나머지 **24건은 `posLabel`이 이미
정확했다**(예: "디"=의존명사 "데"는 `posLabel: "의존명사"`로 이미
맞게 찍혀 있었음). 이 24건이 B로 분류된 진짜 이유는 앱
`partOfSpeech`(`scripts/content-schema.mjs`의 7개 카테고리:
noun/verb/adjective/adverb/pronoun/number/interjection)에 "의존명사"·
"관형사"에 대응하는 카테고리가 아예 없어서, 콘텐츠 큐레이션 당시
`noun`/`adjective`로 근사했기 때문이다 — 이건 **source metadata 오류가
아니라 앱 품사 스키마의 표현력 문제**다. 이번 단계에서는 `posLabel`이
실제로 틀린 18건만 고쳤고, 24건의 스키마 근사 문제는 3B-2(품사 스키마
정책 결정)로 그대로 남겨뒀다.

## 4. E(31건) 정제 결과

- definition corrected: **31/31**
- otherJejuForms corrected: **31/31**
- remaining contamination: **0**(직접 재검증 — 5절)

### 대표 fixture

| 사례 | 결과 |
|---|---|
| 빛(빗)/빙떡 | `otherJejuForms: ["빙떡"]` → `[]`, definition에서 빙떡 뜻풀이 제거 확인 |
| 송편(송펜)/숨비소리 | `otherJejuForms: ["숨비소리"]` → `[]`, definition 정제 확인 |
| 사람(사름)/삼춘, 오빠(오라방)/오름/올레, 혀/셋딸/셋아덜 | **이번 마이그레이션 대상 아님** — `content/lexemes.json`에서 확인해보니 이 표제어들의 lexeme(seq 537/2695 등)은 애초에 `bookMeta.sourceId`가 없다(2025책이 아니라 기존 jeju.go.kr 사전에서 온 항목). 그래서 이 655건 migration의 범위 밖이고, 이번에 손대지 않았다 — 억지로 끼워 맞추지 않고 있는 그대로 보고한다. |

## 5. 변경 안전성

| 금지 대상 | 변경 수 |
|---|--:|
| jeju | 0 |
| standard | 0 |
| top-level partOfSpeech | 0 |
| seq | 0 |
| units(`content/units.json`) | 0 |
| examples(`content/examples.json`) | 0 |
| 신규 lexeme | 0 |
| `src/data/units.json`(재생성 후 diff) | 0 |

`node scripts/migrate_basic_vocab_content_refs.mjs`의 top-level diff
guard가 `bookMeta`를 제외한 모든 top-level lexeme 필드(seq, jeju,
standard, partOfSpeech, reviewStatus, pendingExample,
pendingPlacement, containsPua)의 변경을 0건으로 강제한다 — 위반이
있으면 write 자체가 실패한다.

## 6. Idempotency

- 1차 실행(`--write`): 655건 처리, 그 중 655건 reference·31건
  definition·31건 otherJejuForms·18건 posLabel 실제 변경.
- 2차 실행(`--write`): pending 0건 — `content/lexemes.json` 재작성은
  일어나지만 내용이 동일하고, audit artifact는 "이미 반영된 상태"를
  감지해 기존 migration 기록을 덮어쓰지 않고 보존한다.

## 7. 변경 파일

- `content/lexemes.json` — 655개 lexeme의 `bookMeta.bookId`/
  `bookMeta.legacyBookId`(신규) 갱신, 31개는 `definition`/
  `otherJejuForms`도 정제, 18개는 `posLabel` 교정
- `scripts/migrate_basic_vocab_content_refs.mjs` — 신규, migration script
- `scripts/migrate_basic_vocab_content_refs.test.mjs` — 신규, 12개 테스트
- `data/jeju-basic-vocab-2025/content-migration-applied-3b1b.json` — 신규,
  655건 전체 audit artifact
- `docs/basic-vocab-2025-content-reference-migration.md` — 이 문서(신규)
- `docs/NEXT-STEPS.md`, `data/jeju-basic-vocab-2025/README.md` — 링크 갱신

`content/units.json`, `content/examples.json`, `src/data/units.json`,
`src/lib/*`, `src/routes/*`, `public/audio/*`는 건드리지 않았다.

## 8. 테스트

- `node scripts/build-content.mjs`: 유닛 100개·단어 989개(변경 없음),
  `src/data/units.json` diff 0(bookMeta는 빌드 산출물에 안 나가므로
  당연한 결과)
- `node scripts/qc-check.mjs`: error 0건(기존 warn 82건과 동일, 무관)
- `node --test scripts/migrate_basic_vocab_content_refs.test.mjs`: **12/12 통과**
- `node --test scripts/extract_jeju_basic_vocab_2025.test.mjs`: 20/20 통과(영향 없음)
- `npx tsc --noEmit`, `npx eslint .`: 통과(기존 warning 5건 무관)
- `npx vitest run`: 42/42 통과
- `node --test 'scripts/**/*.test.mjs'`: 216/225 통과(신규 12건 포함,
  실패 9건은 이번 작업과 무관한 기존 실패 — og:title/share-card,
  이전 단계들과 동일)

## 9. Git

- branch: `codex/basic-vocab-content-reference-migration`
- commit: 이 문서와 같은 커밋(SHA는 push 후 확인)
- PR: 생성 후 URL 기재 — **merge하지 않음**

## 10. 다음 단계

### READY

`3B-1B` content source-reference migration이 완료되었습니다. 다음
단계에서는 B 42건 중 실제로 스키마 근사 문제인 24건(3절)을 포함해,
`partOfSpeech` top-level 필드를 현재 앱 schema에서 어떻게 표현할지
(의존명사/관형사 카테고리 신설 vs 근사 유지) 먼저 설계·감사할 수
있습니다(3B-2). 그 다음 신규 71개를 실제 앱 핵심 단어로 넣을지
개별 선별하는 3C로 이어집니다.
