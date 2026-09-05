# 생활방언 파일럿 콘텐츠 (`content/life-dialect.json`)

`docs/product-improvement-plan.md`의 P2-1(3차)에서 계획한 생활방언 맥락 학습
파일럿의 **데이터만** 준비한 상태다. 화면/라우트는 아직 없다.

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

- 라우트/화면(패시지 목록, 재생 화면, 인라인 미니퀴즈) — P2-1의 UI 전부
- 단어 카드 ↔ 생활방언 역방향 링크, 복습 카드 연동 (P2-2)
- 3단계 숙련도(처음 봄/복습 중/익숙함) 상태 저장 (progress.ts 확장 필요)
- 나머지 90편에 대한 동일 작업, 오탈자 실제 교정
