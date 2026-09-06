# 생활방언 파일럿 콘텐츠 (`content/life-dialect.json`)

`docs/product-improvement-plan.md`의 P2-1(3차)에서 계획한 생활방언 맥락 학습
파일럿의 데이터와 화면을 준비한 상태다. `/life-dialect`, `/life-dialect/$id`
라우트로 접근한다(홈 화면 "생활방언 파일럿" 버튼).

## 화면 흐름

계획서가 정한 8단계(상황 확인 → 자막 없이 듣기 → 의미 문항 → 제주어 자막 →
단어 하이라이트 → 인라인 미니퀴즈 → 표준어 확인 → 전체 듣기·자기평가) 중
"3. 무슨 상황인가?" 의미 문항은 지어내지 않았다 — 편마다 실제 상황 요약 문구가
데이터에 없어서, 만들면 검수 안 된 콘텐츠가 하나 늘어난다. 대신
`src/routes/life-dialect.$id.tsx`는 6단계로 구현했다:

1. 상황·주의사항 확인(`contentAdvisory` 있으면 노출)
2. 자막 없이 전체 음원 듣기(문장별 타임코드가 없어 편 전체 재생만 가능)
3. 제주어 자막 + 단어 하이라이트(탭하면 후보 뜻 노출, "정답"처럼 안 보이게 함)
4. 핵심 표현 인라인 미니퀴즈(`src/components/inline-question.tsx`, 오답은
   같은 편의 다른 문장 번역에서만 가져오고 지어내지 않음 — `QuizView`는 상태가
   무거워서 재사용하지 않음)
5. 표준어 전체 확인
6. 전체 다시 듣기 + 3단계 자기평가(처음 봄/복습 중/익숙함) 저장, 이전/다음 편 이동

숙련도·완료 상태는 `useProgress`의 `lifeDialectProgress`(progress.ts v5)에
저장한다.

## 왜 별도 원장인가

`content/{units,lexemes,examples}.json`과 같은 이유: 사람이 편집하는 원장과
앱이 읽는 빌드 산출물을 분리한다.

```
content/life-dialect.json  (원장, 사람이 편집)
  → scripts/build-life-dialect.mjs
  → src/data/life-dialect.json  (빌드 산출물, 손으로 고치지 말 것)
```

`npm run build:life-dialect`로 재생성한다. `build-content.mjs`를 먼저 돌려
`src/data/units.json`이 최신이어야 단어 후보 연결이 정확하다.

## 편 선정

`data/life-dialect/items.json`(도청 API 원문 100편) 중 계획서가 지정한 10편을
골랐다. 계획서의 "어느제 옵디가?"는 별도 편이 아니라 87번 편("어떵 살아
점쑤과?")의 첫 문장이었다 — 제목 목록에 중복이 생기므로 같은 인사말 범주의
70번 "어디 갔단 왐수과?"로 대체했다(`life-5.selectionNote`에 기록).

관광 홍보 성격이 있는 2번 "제주도 인사"는 계획서 지침대로
`requiredInCurriculum: false`로 표시해 필수 진도에서 뺐다.

## 문장 분리

원문 `contents`(현대 표기) / `original`(고어 표기) / `solution`(표준어 풀이)을
줄 단위로 정렬했다. 87번은 `solution`에만 괄호 주석 한 줄이 더 있어서
(`※오랜만에 서로 만나 인사하는 말들`) 문장 배열에서 빼고 `passage.note`로 옮겼다.

`solutionOriginal`/`solutionEdited`를 분리해 뒀지만(계획서가 요구한 필드), 이번
패스에서는 명백한 오탈자를 찾지 못해 둘이 동일하다. `editReason`이 채워지지
않은 문장은 아직 교정 검토가 없었다는 뜻이지, 검토를 마치고 문제없다고
확정했다는 뜻이 아니다.

## 단어 연결은 전부 candidate다

`scripts/build-life-dialect.mjs`가 각 문장에 1,000단어 표제어와의 문자열
일치 후보를 계산해 붙인다(`wordLinks`). 활용형이 붙은 용언은 문자열 일치로
못 잡으므로 이 목록은 절대 "정답"이 아니다 — 화면을 만들 때 승인 전 후보로만
보여줘야 한다(P2-2에서 계획한 "자동 후보 생성 후 사람이 승인" 원칙).

## 공공누리 라이선스 — 미확인 상태로 남김

`sourceLicense.kogl.typeVerified: false`. 이 세션의 네트워크 정책이
jeju.go.kr 접속을 차단해 실제 공공누리 유형 번호, 상업적 이용 가능 여부,
변경(재가공) 허용 여부를 확인하지 못했다. **정식 화면에 노출하기 전에 반드시
사람이 직접 확인하고 이 필드를 갱신할 것.** 계획서도 이 항목을 "반드시
선행할 것"으로 못박아 두었다.

## 아직 안 한 것

- 단어 카드 쪽에서 "이 단어가 나오는 대화" 역방향 링크, 퀴즈 오답 → 생활방언
  추천, 복습 카드 뒤 실제 문장 음원 재생 (P2-2, 아직 시작 안 함)
- 문장별 타임코드가 없어 "무슨 상황인가?" 의미 문항과 문장 단위 음원 재생은
  구현하지 않음 — 지어내지 않기로 한 판단이지, 빠뜨린 게 아님
- 나머지 90편에 대한 동일 작업, `solutionEdited` 실제 오탈자 교정
- E2E/스크린샷 검증은 아직 없음 — 유닛 테스트(`src/lib/life-dialect.test.ts`,
  `scripts/build-life-dialect.test.mjs`)와 tsc/eslint/vitest만 확인함
