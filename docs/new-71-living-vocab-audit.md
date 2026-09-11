# 3C-1 — 신규 71개 생활 제주어 학습 가치 전수 감사

이번 단계는 선별·기록 전용이다. `content/lexemes.json`,
`content/units.json`, `content/examples.json`, `src/data/units.json`에는
변경을 가하지 않았다.

## 방법과 한계

- 공식 학습어 근거: 2025 제주어 기본어휘 원장(`vocab.json`)의 stable ID,
  등급, 품사, 뜻풀이를 전수 대조했다.
- 현대 사용 근거: AI Hub 토큰의 원형 문자열 hit와 제주특별자치도 생활방언
  100편의 원문 문자열 hit를 각각 기록했다.
- 사전 근거: 기존 제주어 사전의 표제어/사이트명과, 동형이의어 번호를 뺀
  표기를 대조했다.
- 현재 앱 중복: `content/lexemes.json`의 주표제어와 `otherJejuForms`를
  같은 정규화 규칙으로 대조했다. 문자열 대조만으로 뜻의 동일성을 확정하지
  않았다.

70개가 표준어 대응 없는 제주 고유어다. 이 경우 원시 문자열 hit만으로는
같은 뜻의 용례인지 자동 판별할 수 없으므로, 짧은 표제어와 동형이의어 가능
항목을 과장하지 않았다. `NONE`은 사어 판정이 아니며, `DO_NOT_ADD`는
현 핵심 앱의 우선순위 판단일 뿐 단어의 존재·가치를 부정하는 말이 아니다.

재현 명령:

```bash
node scripts/audit_new_basic_vocab_candidates.mjs
```

결과 원장은
`data/jeju-basic-vocab-2025/new-candidates-living-audit-3c1.json`에 있다.

## 최종 판정

| decision | count |
|---|---:|
| CORE_ADD | 8 |
| CULTURE_ADD | 25 |
| HOLD | 28 |
| DO_NOT_ADD | 10 |
| 합계 | 71 |

## 사용 증거

| usageEvidence | count |
|---|---:|
| STRONG | 10 |
| MEDIUM | 9 |
| WEAK | 42 |
| NONE | 10 |
| 합계 | 71 |

## CORE_ADD 상위 후보

| 후보 | 근거 요약 |
|---|---|
| 삼춘 | 친족어이면서 성인 호칭으로 쓰이는 기본 상호작용 어휘; AI Hub 원형 hit가 높다. |
| 그추룩 / 이추룩 / 저추룩 | 지시·상태를 설명하는 고빈도 부사군으로, 세 형태 모두 AI Hub 원형 hit가 높다. |
| 봅서 | 청자를 부르는 실용적 표현이며 AI Hub·생활방언 양쪽에 원시 hit가 있다. |
| 나냥으로 | ‘자기 힘으로’라는 독자적 표현으로 AI Hub 원형 hit가 있다. |
| 요자기 | 최근 시점을 말하는 표현으로 AI Hub 원형 hit가 있다. |
| 맛좋다 | 일상 음식 평가에 바로 쓰이는 초급 표현으로 AI Hub 원형 hit가 있다. |

## CULTURE_ADD

장소·음식·해녀·의례·주거 맥락을 이해하는 데 표준어 한 단어로 대체하기
어려운 후보를 문화 학습군으로 분리했다. 돌담, 빙떡, 숨비소리, 오름, 올레,
가문잔치, 곶자왈, 망사리, 물소중의, 물수건, 물적삼, 국, 반지기밥,
불턱, 빗창, 산담, 신구간, 오메기떡, 오분자기, 웃드르, 정주석, 족은눈,
ᄎᆞᆯ레, 큰눈, 테왁이 해당한다.

외부 공식 자료는 문화 맥락의 근거로만 사용했다. 제주특별자치도는
[오름 368개를 안내](https://www.jeju.go.kr/is/oreum/info/jejuoreum/list.wp?menuId=MENU000000000000261)하고,
교육청 자료에는 [빙떡 제작 수업](https://www.jeju.go.kr/jedu/data/data.htm?act=view&page=118&seq=1538402)이 있으며,
도 공식 어업 자료는 [테왁·물적삼 등 해녀 장비의 변천](https://www.jeju.go.kr/jori/reference/report.htm?act=download&no=1&page=3&seq=1479413)을 기록한다.
이는 현대 회화 고빈도 자체의 증거로 해석하지 않았다.

## HOLD / DO_NOT_ADD

- HOLD(28): 먹어지다·살아지다·알아지다 같은 파생 용언, 전문적 감각어,
  드문 감탄사·부사는 공식 수록과 일부 문자열 hit가 있어도 현 자료만으로
  핵심 학습 슬롯의 우선순위를 확정하기 어렵다. 다음 단계에서 제주어 화자
  또는 추가 현대 자료로 용례·활용을 확인할 대상이다.
- DO_NOT_ADD(10): 말젯딸·말젯아덜·말젯아방·말젯어멍, 셋딸·셋아덜은
  매우 특정한 친족 서열어라 초급 핵심 효용이 낮다. 설남은은 좁은 수사
  슬롯이고, 조고만하다/쪼끌락하다 계열은 의미 중복 위험이 크다.
  매기독닥은 현 자료에서 생활 핵심어로 우선할 근거가 약하다.

## 현재 앱과 중복

| type | count |
|---|---:|
| TRUE_NEW | 69 |
| VARIANT_EXISTS | 0 |
| SAME_MEANING_EXISTS | 0 |
| POSSIBLE_DUPLICATE | 2 |

`절`과 `메` 계열은 짧은 형태여서 자동 문자열 대조만으로 의미를 확정할 수
없어 `POSSIBLE_DUPLICATE`로 남겼다. 나머지 69개는 현재 content에서 같은
정규화 표기의 주표제어나 변이형을 찾지 못했다. 이는 의미 중복이 없다는
단정이 아니라, 추가 수동 대조가 필요한 출발점이다.

## 교체 검토 제안

이번 단계에서는 기존 항목의 삭제·교체를 제안하지 않는다. 새 후보의 실제
추가와 유닛 배치는 다음 단계의 사용자 검토 후 결정한다.

## 검증

- audit rows: 71
- unique stableId: 71
- decision 합계: 71
- production content diff: 0

## READY

신규 71개 후보의 사용성·교육가치 감사가 완료되었습니다. 사용자 검토 후
다음 단계에서 CORE_ADD/CULTURE_ADD 중 실제 앱에 반영할 단어를 확정할 수
있습니다.
