# 데이터

이 앱이 쓰는 말은 세 곳에서 왔습니다. **원본 zip/대화 txt는 GitHub에 올리지 않습니다.**

## 콘텐츠가 흐르는 순서 (처음 보는 사람용)

```
content/{units,lexemes,examples}.json   ← 사람이 손으로 고치는 원장(source of truth)
        │  node scripts/build-content.mjs (Zod 스키마 검증 + 상호참조 검사)
        ▼
src/data/units.json                     ← 앱이 실제로 읽는 빌드 산출물(직접 편집 금지)
        │  node scripts/qc-check.mjs (동의어 충돌·종결어미 편중 등 품질 검사)
        ▼
앱 화면
```

`content/` 아래를 고쳤으면 반드시 `node scripts/build-content.mjs`를 다시
실행하고 그 결과(`src/data/units.json`)까지 커밋합니다. 이 두 파일이
어긋나면 `scripts/build-content.test.mjs`가 잡아냅니다.

## 표제어 · 뜻 · 발음

- 1차 출처: 제주특별자치도 [제주어 사전](https://www.jeju.go.kr/culture/dialect/dictionary.htm) 오픈API(7,159항목 중 학습용으로 고른 것)
- 2차 출처(2025년 추가): 제주학연구센터 <아보카, 제주어 기본어휘>(제주학총서 84) —
  구술 말뭉치 빈도 분석으로 뽑은 초급·중급 어휘. 자세한 내용과 한계는
  `data/jeju-basic-vocab-2025/README.md` 참고.
- 지금 규모: `content/lexemes.json`에 1,048개 표제어가 있고, 그 중 989개가
  100유닛(유닛당 8~10개)에 배정돼 실제 화면에 나옵니다. 나머지는 유닛
  배치를 기다리는 대기 상태(`pendingPlacement`)입니다.
- 발음 파일은 `public/audio/{seq}.mp3`에 받아 두었습니다. 앱은 도청 서버를 부르지 않습니다.
  2025년 추가분 상당수는 아직 음원이 없습니다(`hasAudio: false`).

### `partOfSpeech` vs `bookMeta.posLabel` — 품사 필드가 두 개인 이유

- `partOfSpeech`(모든 lexeme에 있음): 앱 **내부 로직 전용 coarse
  분류**다. 허용값은 `noun`/`verb`/`adjective`/`adverb`/`pronoun`/
  `number`/`interjection` 7개뿐(`scripts/content-schema.mjs`)이고,
  `src/lib/quiz.ts`의 오답 후보 풀링과 스키마 검증에만 쓰인다. **정확한
  국어학적 품사가 아니다** — 의존명사는 `noun`으로, 관형사는
  `adjective`로 근사돼 있다.
- `bookMeta.posLabel`(2025 기본어휘 출처 lexeme에만 있음): 책 원문이
  실제로 분류한 한국어 품사(예: "의존명사", "관형사"). **정확한
  원자료 품사가 필요하면 이 필드를 본다.**
- 3B-2 감사(`docs/part-of-speech-schema-audit.md`) 결과: 이 근사가
  실제로 적용된 사례는 26건(의존명사 18 + 관형사 8)뿐이고, `partOfSpeech`가
  사용자 화면에 노출되는 곳이 없어(검색 결과 0건) 지금 당장 스키마를
  확장할 필요는 없다고 결론지었다(안 C 채택). 향후 품사를 화면에
  표시하게 되면 `bookMeta.posLabel`이 있으면 그걸 우선 쓰고, 없을
  때만 `partOfSpeech`의 한국어 라벨로 대체한다.

### `standard` 필드와 "표준어 대응 없음" 항목

`standard`는 근본적으로 **학습자에게 보여주는 짧은 한국어 의미
라벨**이다(공식 표준어 사전 대응어 여부와는 별개 개념). 2025 기본어휘
source의 `has_standard_equivalent` 값에 따라 채우는 방법이 다르다.

- `has_standard_equivalent: true` → source가 제공한 표준어 대응어를
  그대로 쓴다(지금까지 반영한 655개 대부분이 이 경우).
- `has_standard_equivalent: false` → source에 1:1 표준어 대응어가
  없다는 뜻이다. 이때 `standard`에는 **공식 definition에서 직접
  도출한 짧고 보수적인 한국어 gloss**를 쓴다 — 새 뜻을 지어내거나
  AI Hub 의미 앵커를 그대로 복사하지 않는다. 이 값을 "공식 표준어
  대응어"라고 부르지 않는다. `has_standard_equivalent: false`라는
  source 사실은 `data/jeju-basic-vocab-2025/vocab.json` 원본에
  그대로 남아 있다 — `bookMeta`에는 이를 저장하는 별도 필드가
  없으므로 새로 만들지 않고 이 문서로 정책만 남긴다.
- 예시(3C-3A, 두 사례뿐): `삼춘` → `삼촌·연장자 호칭`(source 두 의미
  각각의 핵심어를 짧게 병기), `나냥으로` → `내 힘으로`(source
  definition "나 자신의 힘으로."를 압축).

### 왜 정확히 1,000개가 아닌가

1,000단어 전부가 "사전에서만 보는 말"이 아니라 실제로 쓰이는 말인지
감사한 뒤(`scripts/audit-word-usage.mjs`), confirmed·rare로 확인된
기존 단어 + 2025년 책의 초급·중급 어휘를 합집합으로 다시 정했습니다.
그 결과 유닛에 꽉 채운 단어 수가 1,000에서 989로 줄었습니다(품사가
맞는 대체 표제어 재고가 없어 일부 유닛만 8~9개). 전체 경위는
[`docs/product-improvement-plan.md`](docs/product-improvement-plan.md)의
문서 지도를 따라가면 됩니다.

## 생활방언 (대화 100편)

- 출처: 제주특별자치도 [생활제주어](https://www.jeju.go.kr/culture/dialect/lifeDialect.htm) OpenAPI B02
- 규모: 인사·일상·결혼·관광·철학·민요·기타 **100편** + 원본 발음 MP3
- 파일: `data/life-dialect/items.json`, `data/life-dialect/audio/{seq}.mp3`
- 다시 받기: `python scripts/fetch_life_dialect.py`
- 앱 학습 화면에는 아직 넣지 않았습니다. 사전 1,000단어와는 별개입니다.

## 예문

- 989개 중 391개(2025년 추가 이전부터 있던 confirmed·rare 단어)는 예문이
  1개씩 있습니다. 뜻(사람·동물·식물·몸·음식·장소·도구·날씨·추상)별로
  문형을 여러 개 두어 같은 카테고리 안에서도 반복되지 않게 했습니다.
- 2025년 책에서 새로 들어온 단어(약 598개, `pendingExample: true`)는
  **아직 예문이 없습니다** — 책 자체가 뜻풀이만 있고 예문이 없어서,
  지어낸 예문을 넣는 대신 "단어+뜻만 먼저, 예문은 나중에" 방침으로
  비워뒀습니다. `content/lexemes.json`의 `bookMeta.definition`에 책
  원문 뜻풀이를 남겨뒀으니 나중에 예문 쓸 때 참고하면 됩니다.
- 있는 예문은 제주어 줄을 표제어만 바꾼 게 아니라 문장 전체를 제주
  방언 종결형(-마씸, 에서→이서 등)으로 바꿨습니다. 사람이 직접 두
  차례 전수 검토하면서 어색한 문맥과 오역을 실제 상황이 있는 문장으로
  다시 썼고, 제주특별자치도 방언사전 원본 전체 뜻풀이로 동형이의어를
  교차검증했습니다.
- 문장 뼈대는 단어마다 다릅니다. 말뭉치 대화(`기? 대변이라도 하영 보믄`)는 쓰지 않습니다.
- 원장: `content/examples.json` (앱은 빌드된 `src/data/units.json`의 `examples` 필드를 읽습니다)

## 예문 전체 말뭉치 (연구용)

AI-HUB [한국어 방언 발화(제주도)](https://www.aihub.or.kr/aihubdata/data/view.do?dataSetSn=121) 대화 5,638파일을 예문만 뽑아 `data/aihub/`에 두었습니다. 앱 화면에는 안 넣습니다.

| 파일 | 내용 |
|---|---|
| `data/aihub/utterances/*.jsonl.gz` | 524,406문장 (제주어 + 표준어) |
| `data/aihub/tokens.json` | 방언 토큰 223,067개와 표준어 짝 |
| `data/aihub/word-usage-audit.json` | 1,046단어 각각의 실사용 근거(confirmed/rare/unconfirmed) — `scripts/audit-word-usage.mjs`로 생성 |
| `data/aihub/coverage.json` | 옛 1,000단어가 말뭉치에 있는지(구버전 참고용) |
| `data/aihub/sample.json` | 눈으로 볼 짧은 예 240개 |
| `scripts/search_aihub.py` | `python scripts/search_aihub.py 각씨` |
| `scripts/build_aihub_corpus.py` | 원본 txt에서 다시 뽑기 |

앱 퀴즈에는 이 말뭉치를 넣지 않습니다.

## 2025 기본어휘(제주학연구센터) 원본과 옛한글 복원

`data/jeju-basic-vocab-2025/`에 원본 PDF와 추출 데이터, 그리고 PDF
폰트가 옛한글 자모(아래아 등)를 PUA(사용자 영역) 문자로 인쇄해서 생긴
표기 복원 작업 기록이 있습니다. 81개 고유 글자 중 74개를 복원해
반영했고, 7개는 아직 사람 검토 대기입니다. 자세한 방법론은
`data/jeju-basic-vocab-2025/README-pua-mapping*.md` 세 파일을 순서대로
보면 됩니다.

## 라이선스 메모

제주어 사전은 공공 데이터, AI-HUB 말뭉치는 AI-HUB 이용약관을 따릅니다.
2025 기본어휘는 비매품/무료 공공 자료이나 저작권자(제주학연구센터)
표시가 필요합니다. 이 저장소에는 원본 zip/대화 파일을 넣지 않고,
예문 문장만 정리해 둡니다.
