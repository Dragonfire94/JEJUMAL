# 제주 생활방언

제주특별자치도 OpenAPI **B02 제주 생활방언 정보** (`JejuLifeDialectService`)에서 받은 자료입니다.

- 목록: [생활제주어](https://www.jeju.go.kr/culture/dialect/lifeDialect.htm)
- API: `https://www.jeju.go.kr/rest/JejuLifeDialectService/getJejuLifeDialectServiceList`
- 인증키 없음. 공공누리 출처표시.

다시 받으려면 `python scripts/fetch_life_dialect.py`.

## 규모

| 항목 | 값 |
|---|---|
| 편 | **100** |
| 음성 | 100개 MP3 (`audio/{seq}.mp3`) |
| 분류 | 인사말 11 · 일상대화 37 · 결혼 15 · 관광 10 · 철학 12 · 민요 7 · 기타 8 |

한 편은 짧은 회화·이야기입니다. 사전 표제어 1,000개와는 다릅니다.

## 파일

```
data/life-dialect/
  README.md
  items.json          100편 본문
  audio/{seq}.mp3     원본 발음
```

`items.json` 필드:

| 필드 | 내용 |
|---|---|
| `seq` | 도청 번호 1–100 |
| `type` / `typeName` | LB01 결혼 · LB02 관광 · LB03 기타 · LB04 민요 · LB05 인사말 · LB06 일상대화 · LB07 철학 |
| `name` | 제목 |
| `contents` | 현대 표기 제주어 |
| `original` | 고어(옛한글) 표기 |
| `solution` | 표준어 뜻 |
| `audioUrl` | 도청 MP3 주소 |
| `imageUrl` | 도청 삽화 주소 (이미지는 로컬에 안 받음) |

앱 화면에는 아직 넣지 않았습니다.
