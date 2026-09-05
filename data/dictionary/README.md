# 제주어 사전 원본 (jeju.go.kr)

`jeju_dialect_full.json`은 제주특별자치도청 제주어사전 오픈API
(`https://www.jeju.go.kr/api/culture/dialect`)에서 받아온 7,159개 표제어
전체 스냅샷이다.

- 출처: 제주특별자치도청, 제주어사전
- 필드: `seq`, `category_code`, `category_name`, `name`(표제어, 합성어는
  하이픈으로 형태소 경계 표시), `siteName`, `index`, `contents`(뜻풀이 —
  `⇒표적어` 형태의 순수 교차참조나 `=이표기1=이표기2. 실제뜻` 형태의 이표기
  체인이 섞여 있을 수 있음), `engContents`/`janContents`/`chiContents`(영/일/중
  대역), `sound`/`soundUrl`(발음 파일 정보), `use`
- 수집 시점: 2026년 8월 (JEJUMAL 콘텐츠 재구성 작업 중)
- 라이선스: 공공누리(공공데이터 개방) — 제주특별자치도청 제공 공공데이터.
  상업적 이용·출처표시 조건 등 정확한 유형 번호는 재확인이 필요하다
  (`docs/product-improvement-plan.md`의 라이선스 관련 항목 참고).

## 알려진 주의사항

- `contents` 필드가 `⇒대상표제어` 형태면 그 표제어로 가서 뜻을 다시 찾아야
  하는 순수 교차참조다(최대 3단계까지 따라가야 하는 경우도 있음).
- `contents`가 `=이표기1=이표기2. 실제뜻` 형태면 마지막 마침표 뒤가 실제
  뜻풀이이고, 그 앞은 전부 이표기(異表記)다.
- `name` 필드에 유니코드 사용자 영역(PUA, U+E000~F8FF) 문자가 섞여 들어간
  항목이 있다(옛한글 자모를 사이트 자체 폰트로 표시하려고 매핑해둔 것으로
  추정). 표준 유니코드로 매핑하는 공식 대응표는 아직 없다.

## 재사용

`scripts/build-word-frequency.mjs`가 이 파일과 `data/aihub/tokens.json`을
교차 대조해서 `data/aihub/word-frequency.json`을 생성한다.
