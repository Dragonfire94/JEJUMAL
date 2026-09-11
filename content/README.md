# 콘텐츠 원장 (content/)

`src/data/units.json`(앱이 실제로 읽는 파일)의 **소스**다. 이제부터
`src/data/units.json`을 직접 손으로 고치지 않는다 — 다음에 누군가
`node scripts/build-content.mjs`를 돌리면 여기 있는 값으로 조용히
덮어써진다. 콘텐츠를 바꾸려면 아래 세 파일을 고친 뒤 빌드 스크립트를
다시 실행한다.

```
node scripts/build-content.mjs   # content/ → src/data/units.json 생성
node scripts/qc-check.mjs        # 생성된 결과에 QC 규칙 실행, 보고서 출력
npm run test                     # quiz.test.ts 등 회귀 테스트
```

`scripts/build-content.test.mjs`가 "커밋된 units.json이 content/에서 그대로
재생성되는가"를 매 테스트 실행마다 확인한다. 이 테스트가 실패한다는 건 누군가
units.json을 직접 고쳤거나, content/를 고친 뒤 빌드를 안 돌렸다는 뜻이다.

## 파일 구성

- **`units.json`** — 커리큘럼 배치. 어느 유닛에 어떤 표제어(seq)들이 몇 번째
  순서로 들어가는지만 담는다. 실제 단어 내용은 없다.
- **`lexemes.json`** — 표제어 1,000개의 사전 정보(제주어, 표준어 뜻, 품사,
  뜻 확정 상태). `reviewStatus`가 없으면 `approved`(승인됨)로 간주한다.
- **`examples.json`** — 표제어별 예문과 그 **출처·검수 이력**.
  - `source.type`: `legacy`(이 원장 체계 이전부터 있던 콘텐츠, 개별 이력
    미보존) / `authored`(이번에 말뭉치를 참고해 새로 씀) / `official`·
    `corpus`·`adapted`(향후 생활방언 콘텐츠 등에 쓸 값)
  - `source.originalText`: 말뭉치 원문이 있었다면 다듬기 전 그대로 보존
  - `review.{meaning,naturalness,translation}`: 세 축을 따로 관리한다.
    말뭉치 원문이라고 자연스러움이 보장되지 않고, 화자가 확인했다고 사전
    의미가 보장되지 않기 때문이다(각각 `approved`/`provisional`/`blocked`).
    현재 `naturalness`는 1,000개 전부 `provisional`이다 — 원어민 화자
    검수 게이트가 아직 실행되지 않았기 때문에 정직하게 이렇게 표시해뒀다
    (개선안 문서 P1-3 참고).

## 왜 굳이 나눴는가

이전에는 신규 107개 단어를 편입할 때 "이 예문이 말뭉치 원문인지 창작인지"가
`units.json`에는 전혀 남지 않았다. 다음 재구성 라운드에서 이 이력이 조용히
사라지는 문제가 실제로 있었다(개선안 문서 3번 항목). 이제는 `examples.json`이
그 근거를 담는 단일 기준이고, `units.json`은 여기서 파생된 결과물일 뿐이다.

## 신규 107개의 출처를 어떻게 복구했는가

이번 재구성 세션에서 신규 107개는 AI Hub 말뭉치의 구어체 파편을 완결
문장으로 다시 쓴 것들이다. `examples.json`의 해당 107건은 `source.type:
"authored"`이고, 말뭉치 원문이 남아있는 건은 `source.originalText`에
그대로 들어있다. 기존 893개는 이 세션 이전 여러 라운드를 거치며 개별 출처
기록 없이 통합됐기 때문에 `source.type: "legacy"`로 정직하게 표시했다 —
없는 이력을 지어내지 않았다.
