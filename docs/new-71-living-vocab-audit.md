# 3C-1 — 신규 71개 생활 제주어 감사

> 3C-1.2에서 사용증거 입력과 의미중복 전수 검토를 보정했다. 이 PR은 감사 원장과 재현 스크립트만 바꾸며 production content는 변경하지 않는다.

## 판정 의미

| decision | 의미 |
| --- | --- |
| CORE_ADD | 생활 핵심 반영 우선 후보 |
| CULTURE_ADD | 문화 트랙 반영 우선 후보 |
| HOLD | 추가 검증 전 보류 |
| DO_NOT_ADD | 현재 핵심 앱 우선순위에서 제외 |

이름에 `ADD`가 들어가도 자동 production 반영을 뜻하지 않는다.

## 방법론 보정 (3C-1.2)

3C-1.1에 남은 두 결함을 고쳤다.

1. **AI Hub 의미 검증 입력.** 이전 스크립트는 `auditAll(..., standard: source.definition)`처럼 긴 뜻풀이 문장을 matcher에 넣었다. `meaningMatches()`는 `삼촌`, `그렇게` 같은 짧은 표준어와 mapping을 비교하도록 설계돼 있어, `삼춘`의 실제 `삼촌` mapping이 있어도 실패했고 CORE 대부분이 `NONE`으로 나왔다. 이제 71개 각각에 concise `meaningAnchors.standardTerms`를 두고 그 앵커로만 mapping을 분류한다.
2. **의미중복 68건이 전수 검토가 아님.** 이전 `semanticReview()`는 맛좋다/절/메만 특별 처리하고 나머지를 `NO_DUPLICATE`로 찍었다. 이제 제주어 형태·표준어 앵커·개념 탐색어로 후보를 만든 뒤, 각 후보의 뜻을 대조한 `candidateConceptsReviewed` trail을 남긴다.

추가로:

- AI Hub는 `rawFormHits`와 `meaningMatchedMappingHits`를 분리한다. `tokens.json`에 발화 ID/원문이 없어 **meaning-matched mapping**이지 발화 문맥 확인이 아니다. `verifiedContextHits` 필드를 AI Hub에 쓰지 않는다.
- 생활방언은 줄 정렬이 맞는 쌍만 쓰고, 표준어 풀이가 의미 앵커와 맞을 때만 `contextVerifiedHits`로 센다. 같은 표준어 풀이(본문/원문 중복)는 한 번만 센다.
- `usageEvidence`와 `score`는 `decision`을 참조하지 않는다.
- CULTURE_ADD 25개에 `linguisticType`(`JEJU_DIALECT_FORM` / `JEJU_CULTURAL_TERM` / `BOTH`)을 붙였다.

## 최종 판정

| decision | 3C-1 | 3C-1.1 | 3C-1.2 |
| --- | ---: | ---: | ---: |
| CORE_ADD | 8 | 7 | 2 |
| CULTURE_ADD | 25 | 25 | 25 |
| HOLD | 28 | 29 | 34 |
| DO_NOT_ADD | 10 | 10 | 10 |
| total | 71 | 71 | 71 |

### 기존 대비 변경

| candidate | 3C-1 | 3C-1.1 | 3C-1.2 | reason |
| --- | --- | --- | --- | --- |
| 맛좋다 | CORE_ADD | HOLD | HOLD | 기존 맛싯다와 같은 ‘음식의 맛이 좋다’ 개념. |
| 그추룩 | CORE_ADD | CORE_ADD | HOLD | 기존 경/그렇게와 같은 지시 부사 개념. 사용 근거는 STRONG. |
| 이추룩 | CORE_ADD | CORE_ADD | HOLD | 기존 영/이렇게와 같은 지시 부사 개념. 사용 근거는 STRONG. |
| 저추룩 | CORE_ADD | CORE_ADD | HOLD | 기존 졍/저렇게와 같은 지시 부사 개념. 사용 근거는 STRONG. |
| 요자기 | CORE_ADD | CORE_ADD | HOLD | 기존 요지금/요즘과 같은 시점 개념. 사용 근거는 STRONG. |
| 봅서 | CORE_ADD | CORE_ADD | HOLD | 책은 호격 감탄사인데, 확인된 현대 용례는 보다 존대 명령. 호격 앵커의 meaning-matched mapping은 0. |

나머지 65개는 3C-1.1 판정을 유지했다. 숫자를 지키려고 유지한 것이 아니라, 의미 앵커와 중복 trail을 다시 본 뒤에도 등급이 바뀌지 않았다는 뜻이다.

## 현대 사용 근거

| usageEvidence | 3C-1.1 | 3C-1.2 |
| --- | ---: | ---: |
| STRONG | 2 | 16 |
| MEDIUM | 2 | 7 |
| WEAK | 1 | 17 |
| NONE | 66 | 31 |

분포가 오른 이유는 말뭉치 빈도가 늘어서가 아니라, **짧은 의미 앵커로 mapping을 다시 분류했기** 때문이다. 3C-1.1에서 CORE 6개가 `NONE`이었던 것은 `삼촌`/`그렇게` mapping을 긴 뜻풀이와 비교해 놓친 결과였다.

문턱(decision 비참조):

- STRONG: meaning-matched mapping ≥ 20 또는 생활방언 context verified ≥ 2
- MEDIUM: meaning-matched mapping ≥ 5 또는 생활방언 context verified ≥ 1
- WEAK: meaning-matched mapping ≥ 1
- NONE: 의미 맞는 현대 사용 근거를 이 두 자료에서 확인하지 못함

`NONE`은 사어 판정이 아니다. 문화 중요성이나 최종 판정으로 사용 근거 등급을 올리지 않는다.

## CORE_ADD — 개별 근거

| 후보 | meaning anchor | AI Hub meaning-matched | life context | duplicate | final |
| --- | --- | ---: | ---: | --- | --- |
| 삼춘 | 삼촌, 아저씨, 어르신 | 146 | 0 | NO_DUPLICATE (아주방/아저씨는 다른 슬롯) | CORE_ADD |
| 나냥으로 | 나대로, 내 스스로, 나 스스로, 내 힘으로, 저 스스로 | 27 | 0 | NO_DUPLICATE | CORE_ADD |

삼춘의 할머니/이모/형님 mapping은 거부했다. 아저씨·어르신 mapping은 2025 뜻 2) 연장자 호칭에 해당해 포함했다.

## 3C-1.1 CORE에서 HOLD로 내린 후보

| 후보 | meaning anchor | AI Hub meaning-matched | life context | duplicate | final |
| --- | --- | ---: | ---: | --- | --- |
| 그추룩 | 그렇게, 그처럼, 그만큼 | 1728 | 0 | SAME_CONCEPT 경/그렇게 | HOLD |
| 이추룩 | 이렇게, 이처럼, 이만큼 | 627 | 0 | SAME_CONCEPT 영/이렇게 | HOLD |
| 저추룩 | 저렇게, 저처럼, 저만큼 | 125 | 0 | SAME_CONCEPT 졍/저렇게 | HOLD |
| 요자기 | 요새, 요사이, 요즘 | 27 | 0 | SAME_CONCEPT 요지금/요즘 | HOLD |
| 봅서 | 여보세요, 이봐요, 여보시오 | 0 | 0 | POSSIBLE 베리다/보다 | HOLD |
| 맛좋다 | 맛있다 | 551 | 0 | SAME_CONCEPT 맛싯다/맛있다 | HOLD |

사용 근거가 STRONG이어도, 이미 같은 학습 개념이 있으면 CORE로 두지 않는다.

## 봅서 재검토

- 2025 POS: 감탄사. 뜻: “가까이에 있는 사람이나 듣는 이를 부를 때 쓰는 말.”
- 사전: 표제어 `봅서`는 없고, `날봅서`(seq 7555)만 “여보시오”.
- AI Hub exact `봅서` 162회 mapping은 `보세요` 138, `봐요` 14, `봐` 7 등 **보다 존대 명령**이다. 호격 앵커(여보세요/이봐요/여보시오)와는 일치하지 않아 meaning-matched 0, 나머지는 ambiguous로 둔다.
- 생활방언 정렬 문장도 “어서 와서 보십시오”, “꽃 보십시오”, “먹어 보십시오”, “가서 보십시오”처럼 보다 명령이다. 호격 앵커로 context verified 0.
- 3C-1.1의 “듣는 이를 부르는 실용적 감탄사”는 책 뜻과는 맞지만, 확인된 현대 용례의 중심 뜻이 아니다.
- 기존 베리다/보다와 말뭉치 용법이 겹칠 수 있어 `POSSIBLE_DUPLICATE`로 표시하고 CORE에서 보류한다.

## 절·메 재검토

### 절

- 2025 표준어 필드가 `파도`, 뜻은 “바다에 이는 물결.”
- AI Hub exact 2회 모두 `파도`. 생활방언 “절 쎄어서라” / “파도가 거세더라” context verified 1.
- 현재 앱에 파도·물결 표제어 없음 → `NO_DUPLICATE`.
- 사전 절(seq 5429)은 “결(節理)/결(사이)”로 **다른 동형이의어**. 표준어 절(사찰·절하다)과도 동형.
- 사용 근거는 MEDIUM이지만 1글자 동형 위험이 있어 HOLD.

### 메

- 2025 POS: 감탄사. 뜻: “남이 하는 짓이나 말이 너무도 기가 막힐 적에 내는 소리.” 형태: 메 / 메께라 / 메시께라.
- 사전 동형 3개: 7556 메=메께라(느낌씨, 책 뜻과 일치), 4326 모종, 3589 멥밥.
- AI Hub 의미 일치: 어머나/아이고/어머/기가막혀 합 65 (STRONG). 면서/밥/뽑아 mapping은 오염으로 거부.
- 생활방언의 `게메`는 글쎄라서 이 감탄사의 context verified가 아니다 (raw 0).
- 기존 아고/아이고와 감탄사 슬롯이 겹칠 수 있어 `POSSIBLE_DUPLICATE`. 게메마씸/글쎄요는 다른 말이다.
- HOLD.

## 의미 중복 감사

| status | count |
| --- | ---: |
| NO_DUPLICATE | 62 |
| VARIANT_ALREADY_PRESENT | 0 |
| SAME_CONCEPT_ALREADY_PRESENT | 5 |
| POSSIBLE_DUPLICATE | 4 |

SAME_CONCEPT_ALREADY_PRESENT:

- 맛좋다 ↔ 맛싯다/맛있다 (90237)
- 그추룩 ↔ 경/그렇게 (7357)
- 이추룩 ↔ 영/이렇게 (7463)
- 저추룩 ↔ 졍/저렇게 (90299)
- 요자기 ↔ 요지금/요즘 (90080)

POSSIBLE_DUPLICATE:

- 조고만하다 ↔ 족다/작다, 족다2/적다, ᄒᆞ꼼/조금
- 쪼끌락하다 ↔ 위와 같음
- 메 ↔ 아고/아이고
- 봅서 ↔ 베리다/보다 (말뭉치 용법 기준)

71개 모두 `semanticDuplicateReview.candidateConceptsReviewed`를 남겼다. 후보가 없으면 빈 배열과 함께 어떤 앵커로 검색했는지를 기록한다. 기본값 `NO_DUPLICATE`만 찍는 구조가 아니다.

## 문화어 유형

| linguisticType | count |
| --- | ---: |
| JEJU_DIALECT_FORM | 1 |
| JEJU_CULTURAL_TERM | 22 |
| BOTH | 2 |

- BOTH: 돌담, 올레 (방언 형태 + 제주 문화 경관)
- JEJU_DIALECT_FORM: ᄎᆞᆯ레
- 나머지 22개는 제주 문화 개념(지형·음식·해녀·의례 등)

외부 공식 근거 URL을 확보한 문화 후보는 오름, 올레, 빙떡, 망사리, 불턱, 테왁이다. 이는 문화 맥락의 보조 근거이며 현대 회화 빈도의 증거로 해석하지 않는다.

## DO_NOT_ADD

말젯딸·말젯아덜·말젯아방·말젯어멍·셋딸·셋아덜은 매우 좁은 친족 서열어, 설남은은 좁은 수사 슬롯, 조고만하다·쪼끌락하다 계열은 기존 작은 정도 표현과 겹침, 매기독닥은 특정 상황 감탄사다. 단어가 존재하지 않거나 가치가 없다는 판정이 아니다.

조고만하다·쪼끌락하다는 3C-1.1에서 중복 상태만 `NO_DUPLICATE`로 잘못 찍혀 있었고, 이번 전수 검토에서 `POSSIBLE_DUPLICATE`로 고쳤다. 최종 decision은 그대로 `DO_NOT_ADD`다.

## 재현과 한계

```bash
node scripts/audit_new_basic_vocab_candidates.mjs
node --test scripts/audit_new_basic_vocab_candidates.test.mjs
```

불변식: 71 rows, 71 unique stable IDs, 모든 행에 `meaningAnchors`·`semanticDuplicateReview`·`decisionBasis`, AI Hub에 `verifiedContextHits` 필드 없음, usage/score는 decision 비참조.

한계: AI Hub 원문 ID가 없어 meaning-matched mapping을 발화 문맥 확인으로 주장하지 않는다. 말뭉치 화자/주제 편향이 있다. 실제 반영은 별도 승인 단계다.

## 안전성

```text
production content changed = 0
units changed = 0
examples changed = 0
runtime changed = 0
```
