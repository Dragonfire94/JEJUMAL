# 데이터

이 앱이 쓰는 말은 두 곳에서 왔습니다. **원본 zip/대화 txt는 GitHub에 올리지 않습니다.**

## 표제어 · 뜻 · 발음

- 출처: 제주특별자치도 [제주어 사전](https://www.jeju.go.kr/culture/dialect/dictionary.htm) 오픈API
- 규모: 학습용으로 고른 1,000개 (100유닛 × 10단어)
- 발음 파일은 `public/audio/{seq}.mp3`에 받아 두었습니다. 앱은 도청 서버를 부르지 않습니다.

## 예문

- 앱 예문: 표준어로 짧은 문장을 만든 뒤, 배울 단어만 제주어로 바꿉니다. `scripts/build_clean_examples.py`. 1,000단어 모두 예문 1개.
- 문장 뼈대는 단어마다 다릅니다. 말뭉치 대화(`기? 대변이라도 하영 보믄`)는 쓰지 않습니다.
- 단어별 목록: `src/data/examples.json` (앱은 `src/data/units.json`의 `examples` 필드를 읽습니다)

## 예문 전체 말뭉치 (연구용)

AI-HUB [한국어 방언 발화(제주도)](https://www.aihub.or.kr/aihubdata/data/view.do?dataSetSn=121) 대화 5,638파일을 예문만 뽑아 `data/aihub/`에 두었습니다. 앱 화면에는 안 넣습니다.

| 파일 | 내용 |
|---|---|
| `data/aihub/utterances/*.jsonl.gz` | 524,406문장 (제주어 + 표준어) |
| `data/aihub/tokens.json` | 방언 토큰 223,067개와 표준어 짝 |
| `data/aihub/coverage.json` | 1,000단어가 말뭉치에 있는지 |
| `data/aihub/sample.json` | 눈으로 볼 짧은 예 240개 |
| `scripts/search_aihub.py` | `python scripts/search_aihub.py 각씨` |
| `scripts/build_aihub_corpus.py` | 원본 txt에서 다시 뽑기 |

앱 퀴즈에는 이 말뭉치를 넣지 않습니다.

## 라이선스 메모

제주어 사전은 공공 데이터, AI-HUB 말뭉치는 AI-HUB 이용약관을 따릅니다. 이 저장소에는 원본 zip/대화 파일을 넣지 않고, 예문 문장만 정리해 둡니다.
