# 데이터

이 앱이 쓰는 말은 두 곳에서 왔습니다. **원본 zip/대화 txt는 GitHub에 올리지 않습니다.**

## 표제어 · 뜻 · 발음

- 출처: 제주특별자치도 [제주어 사전](https://www.jeju.go.kr/culture/dialect/dictionary.htm) 오픈API
- 규모: 학습용으로 고른 1,000개 (100유닛 × 10단어)
- 발음 파일은 `public/audio/{seq}.mp3`에 받아 두었습니다. 앱은 도청 서버를 부르지 않습니다.

## 예문

- 1,000단어 모두 예문 1개. 뜻(사람·동물·식물·몸·음식·장소·도구·날씨·추상)별로 문형을 여러 개 두어 같은 카테고리 안에서도 반복되지 않게 했습니다.
- 제주어 줄은 표제어만 바꾼 게 아니라 문장 전체를 제주 방언 종결형(-마씸, 에서→이서 등)으로 바꿨습니다. 사람이 직접 두 차례 전수 검토하면서 어색한 문맥과 오역을 실제 상황이 있는 문장으로 다시 썼고, 제주특별자치도 방언사전 원본 전체 뜻풀이로 동형이의어를 교차검증했습니다.
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
