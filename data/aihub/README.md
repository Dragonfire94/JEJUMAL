# AI Hub 제주 방언 예문 말뭉치

원본 5,638개 대화 파일에서 **예문만** 골라 정리한 데이터입니다.  
앱이 직접 읽지 않습니다. 1,000단어 중 예문이 비는 칸에 새 문장을 만들 때 씁니다.

원본 zip·txt는 넣지 않았습니다. AI-HUB [한국어 방언 발화(제주도)](https://www.aihub.or.kr/aihubdata/data/view.do?dataSetSn=121) 이용약관이 이 파생 데이터에도 적용됩니다.

## 한 줄 요약

| 항목 | 규모 |
|---|---|
| 원본 파일 | 5,638개 (DZES 1,366 · DZHF 2,396 · DZJD 1,876) |
| 중복 제거한 예문 | **524,406** |
| 방언 토큰 | **223,067** |
| 앱에 붙인 예문 | 말뭉치는 앱에 안 씀. 앱 예문은 `scripts/build_clean_examples.py` 가 표준어 문장을 만들어 표제어만 제주어로 바꿈 (1,000개) |
| 말뭉치에 표제어가 그대로 나옴 | 281개 |
| 조사·어미 붙은 형태로 나옴 | +77개 (예: 각씨 → 각씨가) |
| 대화에 거의 안 나옴 | 642개 |

5,638은 파일 수입니다. 예문 문장은 파일당 수십~수백 개라 합치면 53만 개입니다.

## 폴더

```
data/aihub/
  README.md                 이 파일
  meta.json                 규모·필터·라이선스 메모
  coverage.json             우리 1,000단어가 말뭉치에 있는지
  assembled.json            명사 치환 조립 감사 로그
  sample.json               눈으로 훑어볼 짧은 예문 240개
  tokens.json               방언 토큰 → 표준어 + 횟수
  utterances/
    dzes.jsonl.gz
    dzhf.jsonl.gz
    dzjd.jsonl.gz
```

한 줄은 이런 모양입니다.

```json
{"f":"DZES20000001","k":"val","j":"어 그믄 언니네 설 명절 때 음식 어떵 해?","s":"어 그러면 언니네 설 명절 때 음식 어떻게 해?"}
```

- `f` 원본 파일 이름 (확장자 없음)
- `k` train 또는 val
- `j` 제주어 문장
- `s` 표준어 문장

걸러낸 것: `#이름#` `@웃음` `xx`/`xxx` 같은 표시, 한글 4자 미만·80자 초과, 방언 표시가 없는 줄, 같은 제주어 문장 중복.

## 새 예문 뽑는 법

```bash
python scripts/search_aihub.py 각씨
python scripts/search_aihub.py 하르방 --limit 20
```

1. `tokens.json`에서 그 말이 실제로 쓰인 표준어 짝을 본다.
2. `search_aihub.py`로 문장을 몇 개 꺼낸다.
3. 동형이의어(`상`=`향`이 아니라 그냥 ‘상’)는 버리고, 뜻이 맞는 짧은 문장만 앱에 붙인다.

다시 뽑기:

```bash
# 원본 txt는 /tmp/aihub 에 풀어 둔 뒤
python scripts/build_aihub_corpus.py
```

앱 예문은 말뭉치에서 안 가져갑니다. 대화 조각이 학습용으로 안 맞아서, 표준어 문장을 만든 뒤 표제어만 바꿉니다.

```bash
python scripts/build_clean_examples.py
```
