# 3C-3C — 제주 문화어 25개 별도 Culture Track MVP 구현

> **이 PR이 3C의 마지막 PR이다.** 병합 후 3C는 종료된다. 이후
> `3C-3C.1`/`3C-3D`/`3C-4` 같은 하위 작업을 만들지 않는다. 남은
> learnerGloss 사람 검수·culture progress·quiz·이미지·공식 음원·
> 풍부한 문화 해설·life-dialect 양방향 UI는 전부 Post-3C backlog다.

## PR #15 검증

| 항목 | 기대값 | 실제값 | 일치 |
| --- | --- | --- | --- |
| state | open | open | ✅ |
| mergeable | true | `mergeable_state: clean` | ✅ |
| head sha | `30cda58c3e1382ea90ca36a735f347c108030487` | `30cda58c3e1382ea90ca36a735f347c108030487` | ✅ |
| commits | 1 | 1 | ✅ |
| changed files | 10개 | 정확히 그 10개 | ✅ |

전부 일치해 **PR #15를 merge**했다(merge commit
`7350724903b452943205e057eb5f386995435a5c`). `main`을 fetch +
`--ff-only`로 동기화하고 `codex/3c3c-culture-track-mvp` 브랜치를
새로 팠다.

## 1. Source snapshot 재검증 (D-1)

`data/jeju-basic-vocab-2025/culture-track-proposal-3c3b.json`을
fresh `vocab.json`과 다시 대조했다:

```text
items: 25
unique id: 25
unique sourceStableId: 25
culture-12.jeju: ᄆᆞᆷ국 ✅
culture-12.containsPua: false ✅
vocab.json provenance mismatch: 0건
```

## 2. Schema — `scripts/culture-schema.mjs`

life-dialect-schema.mjs 스타일(Zod + 별도 cross-reference 검사
함수)을 따랐다. REQUIRED/OPTIONAL 구분은 3C-3B §3 설계 그대로다.
learnerGloss transitional invariant(`learnerGloss === null ⟺
pendingGloss === true`)를 `superRefine`으로 스키마 레벨에서
강제한다.

## 3. `content/culture-items.json`

`culture-track-proposal-3c3b.json`의 25개 item을 production
source로 옮겼다 — id/sourceStableId/legacySourceId/definition/
sourcePosLabel/level/linguisticType/hasStandardEquivalent/
usageEvidenceRef 전부 그대로, `hasAudio: false`/`culturalNote:
null`/`culturalSources: []`/`learnerGloss: null`/`pendingGloss:
true`로 시작한다. `relatedMainLexemeSeqs`/`relatedLifeDialectIds`는
원장에 없다 — build-time에만 계산된다(§5).

## 4. Build — `scripts/build-culture.mjs`

1. `content/culture-items.json` 로드 + Zod 검증 + id/stableId
   uniqueness 검증(`checkCultureCrossReferences`)
2. `checkVocabProvenance()`로 25개 전부 현재 `vocab.json`과
   sourceStableId/jeju/level/pos/definition/hasStandardEquivalent
   일치 대조 — 불일치 시 hard fail
3. `src/data/units.json`/`src/data/life-dialect.json`을 읽어
   build-time candidate cross-link 계산
4. `src/data/culture-items.json` 생성

실행 결과:

```text
culture item 25개
gloss 대기(pendingGloss) 25개
main lexeme 후보 연결(candidate) 3개  — 곶자왈↔자왈(4004), 물소중의↔소중의(90394), 웃드르↔드르(90005)
life-dialect 후보 연결(candidate) 0개 — 파일럿 10편에 등장 없음(정상, 오류 아님)
```

`build-culture.mjs`가 `content/lexemes.json`/`content/units.json`/
`content/examples.json`을 문자열로도 참조하지 않는다는 것을
`scripts/culture-isolation.test.mjs`가 정적으로 고정한다(§7).

## 5. Cross-link — main lexeme / life-dialect

`findCandidateMainLexemeLinks`/`findCandidateLifeDialectLinks`는
`build-life-dialect.mjs`의 `findCandidateWordLinks`와 같은 방식
(문자열 매칭, `MIN_MATCH_LEN=2`, `status: "candidate"` 고정,
`reviewStatus: "blocked"` 단어 제외)이다. 레코드를 합치지 않고
culture item에만 별도 필드로 붙는다 — main lexeme 쪽 대칭 역링크는
이번에 만들지 않았다(Post-3C).

## 6. Runtime — `src/lib/culture.ts`

`life-dialect.ts`와 대칭 구조: `listItems()`, `getItem(id)`,
`getItemsByLevel(level)`. repository/service layer를 추가로 만들지
않았다.

## 7. Routes

- `/culture` (`src/routes/culture.index.tsx`) — 25개 목록, source
  순서(`culture-1`..`culture-25`) 유지, level 배지, definition
  미리보기. 검색/필터 없음(MVP 범위 밖).
- `/culture/$id` (`src/routes/culture.$id.tsx`) — jeju/definition/
  level/sourcePosLabel/otherJejuForms 표시. `learnerGloss`가
  `null`이면 gloss 영역 자체를 숨기고 definition만 보여준다 —
  `pendingGloss` 내부 상태는 화면에 노출하지 않는다. **audio 버튼
  없음** — main `AudioButton`/`playWord`를 import하지 않아 TTS
  폴백 경로 자체가 차단된다.
- 홈 화면(`src/routes/index.tsx`)에 life-dialect 진입 카드 바로
  아래 "제주 문화어" 진입 버튼을 추가했다 — 100-unit grid 구조,
  rank/진도 수치, "학습 완료" 표현은 전혀 건드리지 않았다.

`routeTree.gen.ts`는 `npx vite build --mode development` 1회
실행으로 재생성했다(TanStack Router 플러그인이 자동 처리, 손으로
편집하지 않음) — 빌드 산출물(`.vercel/output/*`)은 되돌리고
`routeTree.gen.ts`만 커밋에 남겼다.

## 8. Isolation proof (D-15)

`scripts/culture-isolation.test.mjs`(7개) + `scripts/build-culture.test.mjs`(12개) = 19개
신규 테스트로 5개 invariant를 고정했다:

| Test | 확인 내용 |
| --- | --- |
| INVARIANT 1 | `culture.ts`/culture 라우트가 `@/lib/units`를 import하지 않음 |
| INVARIANT 2 | `culture.ts`/culture 라우트가 `@/lib/quiz`를 import하지 않음 |
| INVARIANT 3 | `culture.$id.tsx`가 `@/lib/progress`(main SRS)를 import하지 않음 |
| INVARIANT 5(일부) | `build-culture.mjs`의 `writeFileSync` 호출이 `OUT_PATH`(`src/data/culture-items.json`) 하나뿐, `content/lexemes.json`/`units.json`/`examples.json` 문자열 참조 없음 |
| audio 금지 | `culture.$id.tsx`가 `audio-button`/`@/lib/audio`/`speechSynthesis`를 참조하지 않음 |
| quiz 없음 | culture 라우트에 `quiz-view`/`inline-question`/`buildLesson`/`buildInlineQuestions` 없음 |
| main 불변 | `content/lexemes.json` 1048개, placed 989, pendingPlacement 59, units 100 — 그대로 |
| PUA 회귀 | 25개 production source(`jeju`/`definition`/`otherJejuForms`) 전체에 PUA(U+E000–F8FF) 0건 |
| provenance | 25개 전부 fresh `vocab.json`과 stableId 기준 일치 |

INVARIANT 4(rank/wave 진행 무영향)는 홈 화면 변경이 `RANKS`/
`unitsInRank`/`progressPercent` 등 진행 계산 함수를 전혀 호출하지
않는 순수 신규 버튼 추가라는 것을 코드 리뷰로 직접 확인했다(§7).

## 9. PUA proof

25개 production source(`content/culture-items.json`) 전체
(`jeju`/`definition`/`otherJejuForms`)를 codePointAt 기준으로
스캔한 결과 PUA(U+E000–F8FF) **0건**이다. `culture-12`(`ᄆᆞᆷ국`)와
`culture-23`(`ᄎᆞᆯ레`)는 표준 유니코드 첫가끝 자모이지 PUA가
아니다 — 3C-3B.1/3C-3B.2에서 이미 해소됐다.

## 10. Tests

```text
node --test scripts/build-culture.test.mjs        → 12/12 통과
node --test scripts/culture-isolation.test.mjs    → 7/7 통과
node scripts/build-content.mjs                    → 989 단어, 59 pendingPlacement, 무변경
node scripts/build-culture.mjs                    → 25 item, 재현 가능(재실행 결과 동일)
node scripts/qc-check.mjs                         → error 0 / warn 82 (기존과 동일)
npx tsc --noEmit                                  → 통과
npx eslint .                                      → 0 error / 5 warning (기존과 동일)
npx vitest run                                    → 42/42 통과
node --test 'scripts/**/*.test.mjs'               → 249/258 통과 — 기존 무관 9건만 남음, 신규 regression 0
npx vite build --mode development                 → 성공(culture.index/culture.$id 청크 생성 확인)
```

## 11. UI smoke (dev server)

```text
GET /culture              → 200, "제주 문화어" 25건 렌더 확인
GET /culture/culture-12   → 200, "ᄆᆞᆷ국" 2회 렌더(제목+본문), PUA tofu 없음
GET /culture/culture-23   → 200, "ᄎᆞᆯ레" 2회 렌더, PUA tofu 없음
GET /culture/culture-12 본문에 audio-button/playWord/재생·발음 듣기 문자열 0건
GET /                     → 200, "제주 문화어" 진입 버튼 1건 렌더
```

## 12. Isolation 결과 요약

```text
main lexemes diff: 0
main units diff: 0
main examples diff: 0
main placed: 989 (불변)
main pending: 59 (불변)
quiz.ts diff: 0
progress.ts diff: 0
public/audio diff: 0
```

## Post-3C backlog

```text
learnerGloss 25개 사람 검수
cultureProgress 실제 구현
culture quiz
풍부한 문화 해설(culturalNote/culturalSources 실채움)
이미지/사진
공식 음원
bookmark
life-dialect ↔ culture 양방향 UI 통합
```

이 항목들은 3C 완료를 막는 blocker가 아니다.

## Git

- PR #15 merge commit: `7350724903b452943205e057eb5f386995435a5c`
- 작업 브랜치: `codex/3c3c-culture-track-mvp`

## 3C 종료 기준 체크

```text
[x] CORE 2개 main 반영 완료(3C-3A)
[x] Culture 25개 별도 source 생성(content/culture-items.json)
[x] Culture 25개 build 성공(scripts/build-culture.mjs)
[x] /culture 목록 route
[x] /culture/$id 상세 route
[x] main units/quiz/SRS 오염 0
[x] PUA blocker 0
[x] audio fallback 없음
[x] tests 신규 regression 0
[x] NEXT-STEPS에 3C COMPLETE 기록
```

## 3C 상태

### `3C COMPLETE — READY TO MERGE FINAL PR`

CORE 2개 반영, Culture 25개 별도 Track 구현, PUA blocker 해소, main
curriculum 격리까지 완료했습니다. 이 PR이 3C의 마지막 PR입니다.
사용자 검토 후 이 PR을 병합하면 3C는 종료됩니다. 남은 gloss/quiz/
progress/이미지/음원/문화 해설은 Post-3C backlog이며 3C 완료를
막지 않습니다.
