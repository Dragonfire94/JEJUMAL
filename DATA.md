# 데이터

이 앱이 쓰는 말은 두 곳에서 왔습니다. **원본 zip/대화 txt는 GitHub에 올리지 않습니다.**

## 표제어 · 뜻 · 발음

- 출처: 제주특별자치도 [제주어 사전](https://www.jeju.go.kr/culture/dialect/dictionary.htm) 오픈API
- 규모: 학습용으로 고른 1,000개 (100유닛 × 10단어)
- 발음 파일은 `public/audio/{seq}.mp3`에 받아 두었습니다. 앱은 도청 서버를 부르지 않습니다.

## 예문

- 출처: AI-HUB [한국어 방언 발화(제주도)](https://www.aihub.or.kr/aihubdata/data/view.do?dataSetSn=121)
- 원본은 대화 파일 5,638개입니다. 예문 문장은 파일당 여러 개라, 정리하면 **524,406문장**입니다.
- 앱이 읽는 것은 그중 우리 1,000단어와 뜻이 맞게 고른 짧은 말뿐입니다. 지금 **452개** 단어에 예문 1~2개 (653문장). 가짜 템플릿은 넣지 않았습니다.
- 고르는 기준:
  - 방언 표기가 실제로 쓰인 발화, 또는 그 문장의 표준어 자리에 우리 표제어만 끼운 문장
  - 한 문장 뼈대는 한 단어만. 같은 예문을 여러 단어에 돌려 쓰지 않음
  - 6~40자
  - 짝인 표준어가 그 단어의 뜻과 맞음
  - `#이름#` `@웃음` `xx`/`xxx` 같은 비식별 표시는 제외
  - 뜻을 설명하는 메타발화(`란 말`, `봉그다. 줍다`)는 제외
  - `막` `그` `어`로 끊긴 미완성 문장은 제외
- 앱에 붙이는 스크립트: `scripts/extract_aihub_examples.py` (표제어가 실제로 나온 발화), `scripts/assemble_examples.py` (표준어가 나온 자리에 제주 표제어를 끼움)
- 단어별 목록: `src/data/examples.json` (앱은 `src/data/units.json`의 `examples` 필드를 읽습니다)

## 예문 전체 말뭉치 (생성용)

나머지 단어용 예문을 만들기 위해, 원본에서 예문만 뽑아 `data/aihub/`에 두었습니다. 앱은 이 폴더를 번들에 넣지 않습니다.

| 파일 | 내용 |
|---|---|
| `data/aihub/utterances/*.jsonl.gz` | 524,406문장 (제주어 + 표준어) |
| `data/aihub/tokens.json` | 방언 토큰 223,067개와 표준어 짝 |
| `data/aihub/coverage.json` | 1,000단어가 말뭉치에 있는지 |
| `data/aihub/sample.json` | 눈으로 볼 짧은 예 240개 |
| `scripts/search_aihub.py` | `python scripts/search_aihub.py 각씨` |
| `scripts/build_aihub_corpus.py` | 원본 txt에서 다시 뽑기 |
| `scripts/assemble_examples.py` | 명사 빈칸에 말뭉치 문장을 치환 조립 |
| `data/aihub/assembled.json` | 조립 결과 감사 로그 |

1,000단어 기준 대략: 표제어가 나온 실사용 244 · 표준어 자리에 표제어를 끼운 명사 208 · 아직 빈칸 548. 빈칸은 말뭉치에 안전한 자리가 없는 희귀어입니다. 문장 뼈대는 단어마다 다릅니다. 한 문장에 단어 여러 개를 돌려 막지 않습니다.

## 라이선스 메모

제주어 사전은 공공 데이터, AI-HUB 말뭉치는 AI-HUB 이용약관을 따릅니다. 이 저장소에는 원본 zip/대화 파일을 넣지 않고, 예문 문장만 정리해 둡니다.
