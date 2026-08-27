# 데이터

이 앱이 쓰는 말은 두 곳에서 왔습니다. **원본 zip/대화 txt는 GitHub에 올리지 않습니다.**

## 표제어 · 뜻 · 발음

- 출처: 제주특별자치도 [제주어 사전](https://www.jeju.go.kr/culture/dialect/dictionary.htm) 오픈API
- 규모: 학습용으로 고른 1,000개 (100유닛 × 10단어)
- 발음 파일은 `public/audio/{seq}.mp3`에 받아 두었습니다. 앱은 도청 서버를 부르지 않습니다.

## 예문

- 출처: AI-HUB [한국어 방언 발화(제주도)](https://www.aihub.or.kr/aihubdata/data/view.do?dataSetSn=121)
- 원본은 대화 파일 5,638개입니다. 예문 문장은 파일당 여러 개라, 정리하면 **531,249문장**입니다.
- 앱이 읽는 것은 그중 우리 1,000단어와 뜻이 맞게 고른 짧은 말뿐입니다. 지금 241개 단어에 예문 1~2개.
- 고르는 기준:
  - 방언 표기가 실제로 쓰인 발화
  - 6~40자
  - 짝인 표준어가 그 단어의 뜻과 맞음
  - `#이름#` 같은 비식별 표시, `@웃음` 같은 잡음은 제외
- 앱에 붙이는 스크립트: `scripts/extract_aihub_examples.py`
- 단어별 목록: `src/data/examples.json` (앱은 `src/data/units.json`의 `examples` 필드를 읽습니다)

## 예문 전체 말뭉치 (생성용)

나머지 759개 단어용 예문을 나중에 만들기 위해, 원본에서 예문만 뽑아 `data/aihub/`에 두었습니다. 앱은 이 폴더를 번들에 넣지 않습니다.

| 파일 | 내용 |
|---|---|
| `data/aihub/utterances/*.jsonl.gz` | 531,249문장 (제주어 + 표준어) |
| `data/aihub/tokens.json` | 방언 토큰 226,600개와 표준어 짝 |
| `data/aihub/coverage.json` | 1,000단어가 말뭉치에 있는지 |
| `data/aihub/sample.json` | 눈으로 볼 짧은 예 240개 |
| `scripts/search_aihub.py` | `python scripts/search_aihub.py 각씨` |
| `scripts/build_aihub_corpus.py` | 원본 txt에서 다시 뽑기 |

1,000단어 기준 대략: 표제어 그대로 284 · 조사 붙은 형태 +77 · 대화에 거의 안 나옴 639. 안 나오는 쪽은 사전 희귀어라 말뭉치만으로 예문을 못 만듭니다. 그 자리는 손문장이나 다른 출처가 필요합니다.

## 라이선스 메모

제주어 사전은 공공 데이터, AI-HUB 말뭉치는 AI-HUB 이용약관을 따릅니다. 이 저장소에는 원본 zip/대화 파일을 넣지 않고, 예문 문장만 정리해 둡니다.
