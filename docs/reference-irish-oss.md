# 아일랜드어(Gaeilge) 오픈소스 생태계 — JEJUMAL 참고 자료

이 문서는 아일랜드어 관련 GitHub 오픈소스 프로젝트를 실제로 클론해서 코드/스키마/파일
구조까지 뜯어본 뒤, JEJUMAL(제주어 학습 앱)에 실질적으로 적용할 수 있는 부분을 정리한
것입니다. 대부분 Kevin Scannell(`kscanne`)과 Michal Měchura(`michmech`) 두 사람이
수십 년간 만들어온 프로젝트들입니다.

> 조사 방법: 각 저장소를 `git clone --depth 1`로 받아 README, 실제 데이터 샘플,
> 핵심 소스 파일을 직접 읽었습니다. (2026-09 기준 최신 커밋)

---

## 목차

1. [michmech/irish-word-frequency — 빈도 리스트](#1-michmechirish-word-frequency)
2. [michmech/irish-sentence-bank — 예문 은행](#2-michmechirish-sentence-bank)
3. [michmech/pota-focal-gluais — 학습자용 사전 (다의어 처리)](#3-michmechpota-focal-gluais)
4. [michmech/BuNaMo — 국가 형태소 데이터베이스](#4-michmechbunamo)
5. [calculuswhiz/buNaMo-to-sqlite — 관계형 DB 스키마](#5-calculuswhizbunamo-to-sqlite)
6. [cudail/reimnigh — 동사 활용 생성기](#6-cudailreimnigh)
7. [kscanne/gramadoir — 다국어 문법 검사 엔진](#7-kscannegramadoir)
8. [kscanne/canuint — 방언 분류기](#8-kscannecanuint)
9. [m4cd4r4/cupla-focail — 사전 앱 배포 모델](#9-m4cd4r4cupla-focail)
10. [종합: JEJUMAL 적용 우선순위](#10-종합-jejumal-적용-우선순위)

---

## 1. michmech/irish-word-frequency

**https://github.com/michmech/irish-word-frequency** (37★, 데이터 전용, 코드 없음)

### 구조
파일 3개뿐: `README.md`, `LICENCE`, `frequency.txt`. 후자는 탭 구분 텍스트:

```
// Format: rank [tab] lemma [tab] corpus frequency [tab] window size [new line]
1	an	1338874	25
2	bí	1194301	28
...
```

- **rank**: 빈도 순위
- **lemma**: 표제어(활용형이 아니라 원형)
- **corpus frequency**: 말뭉치 내 등장 횟수
- **window size**: "평균 몇 단어마다 한 번 등장하는가" (예: 25면 25단어마다 1회)

### 방법론 (README에 명시)
> "New Corpus for Ireland의 아일랜드어 부분에서 추출한 뒤, **대규모 어휘 사전과
> 대조해서 사전에 없는 표제어를 제거**하는 방식으로 정제함 — 문장부호, 고유명사,
> 영어 단어 등 노이즈가 없는 '깨끗한' 리스트."

### JEJUMAL 적용
이번 세션에서 AI Hub 토큰 22만 개 중 "닮아/거난/이서" 같은 활용형·조사를 걸러내려고
`jeju.go.kr` 사전의 `name` 필드와 교차 대조하는 스크립트를 즉석에서 짰었는데,
**정확히 같은 방법론**이 이미 검증된 표준 관행이라는 걸 확인했습니다. 다른 점은:
- **window size** 개념이 유용합니다. 지금 JEJUMAL은 "빈도 232회" 같은 절대 숫자만
  쓰는데, "평균 몇 단어마다 한 번 나오는 말인지"로 바꿔 표현하면 콘텐츠 담당자가
  중요도를 직관적으로 판단하기 더 쉬워집니다.
- 이 파일 포맷 자체(4컬럼 탭 구분 텍스트)를 그대로 `data/aihub/word_frequency.tsv`
  같은 이름으로 정식 산출물화해서 저장소에 커밋해두면, 매번 스크래치패드 스크립트를
  다시 짜지 않고 재사용할 수 있습니다.

---

## 2. michmech/irish-sentence-bank

**https://github.com/michmech/irish-sentence-bank** (10★, XML 데이터)

### 구조
`sentences.xml` 하나(약 2.8MB), 4,500개 문장. 스키마:

```xml
<sentence source='potaL'>
	<original xml:space="preserve">
		<token slot='1'>Bob</token> <token slot='2'>nó</token> <token slot='3'>bia</token>!
	</original>
	<translation>Trick or treat!</translation>
	<flex slot='1' lemma='bob'/>
	<flex slot='2' lemma='nó'/>
	<flex slot='3' lemma='bia'/>
</sentence>
```

핵심 포인트 두 가지:
1. **문장의 각 토큰(slot)이 원형(lemma)에 명시적으로 매핑**되어 있습니다. 활용형을
   보고 "이게 표제어의 활용형이 맞나?"를 문자열 매칭으로 추측할 필요가 없습니다.
2. `source='potaL'` 처럼 **문장 출처를 태그**해둡니다.
3. README에 방법론이 명시: "대부분 **출판된 언어 교재에서 손으로 골라낸** 문장들 —
   말뭉치에서 자동 추출한 게 아님." 토큰화/표제어 매핑도 사람이 직접 해서 "사실상
   100% 정확"하다고 밝힘.

### JEJUMAL 적용 (중요도 높음)
이번 세션에서 겪은 가장 큰 골칫거리 — 표제어가 예문에 실제로 등장하는지 확인하는
로직(`full_audit.py`의 5번 체크)이 **단순 부분 문자열 매칭**이라서, "시기다"의
과거형이 "시켰어요"로 축약되면서 리터럴 "시키" 문자열이 사라지는 버그가 있었고,
`⑤`시트에서 "밑"(표제어)과 실제 예문의 "엉덩이"가 안 맞아서 24건을 수작업으로
고쳐야 했습니다.

**구체적 제안**: `examples.json`(현재 미사용 상태)을 부활시켜서, 예문의 각 어절에
`lemma` 필드를 붙이는 구조로 바꾸면 이 문제가 아예 근본적으로 사라집니다.
```json
{ "jeju": "느는 밥 먹었어마씸?", "standard": "너는 밥 먹었어요?",
  "tokens": [{"text":"느","lemma":"느"}, {"text":"는"}, ...] }
```
그러면 "표제어-예문 대응" 체크가 문자열 휴리스틱이 아니라 정확한 lookup이 됩니다.
당장 전체를 이렇게 바꾸는 건 큰 작업이지만, **최소한 이번에 새로 추가한 107개
신규 단어부터** 이 구조로 시작하는 걸 추천합니다.

또한 "**출판된 교재에서 손으로 고른 문장**"이라는 방법론 자체도 눈여겨볼 만합니다.
이번 세션에서는 AI Hub 원본 말뭉치를 그대로 발췌했다가 구어체 파편(예: "대죽 대죽",
"가름 가름 가름 보라 읽지도 못 햄신게")을 새로 다듬어 써야 했는데, 처음부터
"교재/출판물에서 고른 문장" 소스를 우선하고 말뭉치는 검증용으로만 쓰는 편이
편집 비용이 훨씬 낮았을 겁니다.

---

## 3. michmech/pota-focal-gluais

**https://github.com/michmech/pota-focal-gluais** (7★, XML 데이터, 학습자용 사전)

### 구조 — 다의어 처리 방식 (★★★ 가장 중요한 발견)

```xml
<entry entryID="1">
  <src><ortho><token>a</token></ortho><tag tag="possPron" /></src>
  <trg><ortho><token>its</token></ortho><explanation>belonging to it</explanation></trg>
  <infobox>a가 its/his를 뜻할 때는 뒤 명사에 연음(lenition)을 일으킨다...</infobox>
  <subentries>
    <entry entryID="2" isExample="yes">
      <src><ortho><token>a</token> <token>chóta</token></ortho></src>
      <trg><ortho><token>his</token> <token>coat</token></ortho></trg>
    </entry>
  </subentries>
</entry>

<entry entryID="4">   <!-- 같은 표제어 "a", 다른 뜻(her) -->
  <src><ortho><token>a</token></ortho><tag tag="possPron" /></src>
  <trg><ortho><token>her</token></ortho><explanation>belonging to her</explanation></trg>
  <infobox>a가 her를 뜻할 때는...</infobox>
  <subentries> ... </subentries>
</entry>
```

**같은 표제어("a")가 뜻에 따라 완전히 별개의 `<entry>`로 분리**되고, 각 entry마다
"언제 이 뜻으로 쓰이는지" 설명하는 `infobox`와, 그 뜻에 맞는 예문이 `isExample="yes"`로
**명시적으로 하위에 종속**되어 있습니다. 즉 "표제어 하나 = 뜻 하나 = 예문 세트 하나"가
구조적으로 보장됩니다.

### JEJUMAL 적용 (★★★ 강력 추천)
이번 세션에서 반복적으로 터진 버그 패턴이 정확히 이겁니다:
- "고장"(꽃 vs 故障), "절간"(가게 vs 절), "산물"(샘물 vs 감귤의 한 품종, seq 164 vs 4417),
  "장남"(맏아들 vs 작자), "세양"(수양 관련)
- 전부 **"같은 철자, 다른 뜻"을 하나의 flat한 레코드에 욱여넣다가** 뜻과 예문이
  서로 다른 의미를 가리키게 되는 사고였습니다.

JEJUMAL의 현재 스키마(`units.json`)는 `{seq, jeju, standard, examples}`가
1:1:N 구조라 애초에 "같은 철자 다른 뜻"을 표현할 방법이 없습니다(seq가 다르면
사실상 다른 단어 취급). Pota Focal처럼 **"표제어 문자열이 같아도 seq/의미별로
독립된 레코드로 취급하고, 뜻풀이 옆에 짧은 사용 조건(infobox)을 붙이는" 방식**을
도입하면, 신규 단어 편입 때마다 동형이의어 충돌을 사람이 일일이 손으로 찾아낼
필요 없이 데이터 구조 자체가 충돌을 원천 차단합니다.

---

## 4. michmech/BuNaMo

**https://github.com/michmech/BuNaMo** — 아일랜드 국가 형태소 데이터베이스 (43,000항목)

### 구조
표제어 하나당 XML 파일 하나(`verb/cuir_verb.xml` 처럼). 동사 파일 예시(`cuir`,
"놓다/두다"):

```xml
<verb default="cuir" disambig="">
  <verbalNoun default="cur" />
  <verbalAdjective default="curtha" />
  <tenseForm default="cuir" tense="Past" dependency="Indep" person="Base" />
  <tenseForm default="cuireamar" tense="Past" dependency="Indep" person="Pl1" />
  ... (시제 × 독립/종속절 × 인칭 조합마다 활용형 하나씩, 총 50개 이상) ...
  <moodForm default="cuireadh" mood="Imper" person="Base" />
  <moodForm default="cuirimis" mood="Subj" person="Pl1" />
</verb>
```

동사 하나가 **시제(Past/PastCont/PresCont/Fut/Cond) × 절 유형(독립절/종속절,
아일랜드어 특유의 문법 범주) × 인칭(1인칭/2인칭/자동/복수 등)** 조합으로 완전히
전개된 활용표를 갖습니다. 명사/형용사/전치사도 각각 별도 스키마로 같은 방식.

### JEJUMAL 적용
JEJUMAL의 동사/형용사 100+57개는 지금 예문 1개씩만 있고, 활용형은 그때그때 사람이
손으로 만듭니다. 이번에 "-마씸" 종결 편중을 고치면서 "히어마씸→히었수다" 같은
변환을 40개 손으로 검증했는데, 애초에 각 동사/형용사가 **{종결어미 종류: 활용형}**
매핑을 미리 다 갖고 있었다면 자동으로 교체할 수 있었을 겁니다.

**구체적 제안**: 지금 당장 43,000개 규모의 전체 활용표를 만들 필요는 없지만,
JEJUMAL의 동사(100)·형용사(57) 157개에 대해서만이라도
`{jeju_stem, "-마씸": "...", "-수다": "...", "-우다": "...", "-읍주": "...", "-읍서": "..."}`
형태의 작은 활용표를 데이터로 만들어두면, 앞으로 종결어미 다양화 작업이 훨씬
안전하고 빨라집니다. 아래 6번(reimnigh) 항목이 이걸 실제로 어떻게 자동 생성하는지
보여줍니다.

---

## 5. calculuswhiz/buNaMo-to-sqlite

**https://github.com/calculuswhiz/buNaMo-to-sqlite** — BuNaMo XML → SQLite 변환기 (TypeScript, Bun)

### 구조
```
ts/
  build.ts        (430줄) — XML 파싱 → DB 적재 파이프라인
  repository.ts    (708줄) — DB 접근 레이어 (prepared statement 캐싱)
  mutators.ts      (369줄) — 아일랜드어 초성 변화(lenition/eclipsis) 규칙
  model/
    verb.ts, noun.ts, adjective.ts, preposition.ts, nounPhrase.ts, possessive.ts
```

`Schema.sql` 발췌:
```sql
CREATE TABLE IF NOT EXISTS adjective (
  adjective_id INTEGER PRIMARY KEY,
  declension INTEGER NOT NULL DEFAULT 0,
  is_pre INTEGER NOT NULL DEFAULT 0 CHECK (is_pre IN (0, 1)),
  disambig TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS adjective_form (
  adjective_form_id INTEGER PRIMARY KEY,
  adjective_id INTEGER NOT NULL REFERENCES adjective(adjective_id) ON DELETE CASCADE,
  form_name TEXT NOT NULL CHECK (form_name IN
    ('sgNom','sgGenMasc','sgGenFem','sgVocMasc','sgVocFem','plNom','graded','abstractNoun')),
  value TEXT NOT NULL
);
```

품사별로 **부모 테이블(표제어) + 자식 테이블(활용형, `form_name`을 CHECK 제약으로
화이트리스트)** 구조. `verb.ts`의 `tenseFactory()`는 시제×절유형×인칭의 모든 조합을
빈 배열로 미리 초기화해두는 팩토리 패턴을 씁니다.

### JEJUMAL 적용
지금 JEJUMAL은 `units.json`이라는 하나의 큰 JSON 배열/파일에 모든 게 들어있습니다
(1,000단어 × examples 배열 등). 1,000개 규모에서는 문제없지만, 이번 세션에서
"신규 107개 유닛 배정" 작업할 때 "이 seq가 이미 어느 유닛에 있는지, 중복은
없는지"를 매번 파이썬 스크립트로 전체 JSON을 스캔해서 확인해야 했습니다.
**표제어 관계형 스키마(위 5번 예시처럼)**로 전환하면:
- `word` 테이블(seq PK) + `word_example` 테이블(FK) + `unit_word`(유닛 배정 테이블)로
  나누면 "이 unit에 이 seq가 이미 있나" 같은 걸 SQL 제약(UNIQUE)으로 원천 차단 가능
- CHECK 제약으로 `partOfSpeech`, `themeId` 같은 필드의 오타/오염을 DB 레벨에서 방지

물론 지금 규모(1,000단어)에서 SQLite로 완전히 갈아엎을 필요는 없다고 봅니다.
다만 **"본문 JSON을 진짜 소스로 삼고, 검증은 매번 파이썬으로"** 하는 지금 방식
대신, 최소한 **CI에서 JSON을 SQLite로 한 번 로드해보고 스키마 제약 위반을
자동으로 잡는 검증 단계**를 추가하는 정도는 적은 비용으로 가능합니다.

---

## 6. cudail/reimnigh

**https://github.com/cudail/reimnigh** — 아일랜드어 규칙 동사 활용 생성기 (Python, 단일 파일)

### 사용법
```
$ python reimnigh.py eitil -1ucd
> d'eitil mé          # 1인칭 단수 과거 긍정
$ python reimnigh.py léim -2iclf
>  aimsir chaite(과거)      aimsir láithreach(현재)    aimsir fháistineach(미래)
>  léim sibh   níor léim sibh   ...
```
**`-m` 뮌스터(Munster) 방언 옵션**이 내장돼 있습니다 — 표준 활용과 방언 활용을
같은 엔진에서 플래그 하나로 전환합니다.

### 핵심 알고리즘 (코드 발췌)
```python
gutaí = "aouieáóúíé"  # 모음 목록

def comhair_siollaí(focal):      # 음절 수 세기 (모음 뭉치 개수)
    return len(findall(f"[{gutaí}]+[^{gutaí}]+", focal))

def uraigh(litir):                # 어두 자음 변화(eclipsis) 매핑 테이블
    return {'b':'m','c':'g','d':'n','f':'bh','g':'n','p':'b','t':'d'}.get(litir)

def deireadh_fada(focal):         # "긴 어미"인지 판정 (장모음 유무)
    ...

def leath_nó_caolaigh(deireadh, caol):  # 광모음/세모음(broad/slender) 형태 선택
    ...
```
음절 수, 어미의 장단, 모음의 광/세(廣/細) 구분 같은 **음운론적 규칙을 함수로
쪼개놓고, 그 조합으로 활용형을 조립**하는 방식입니다. 불규칙 동사는 아예
지원 대상에서 제외한다고 README에 명시(설계 범위를 명확히 좁혀서 유지보수
가능하게 만든 점도 참고할 만함).

### JEJUMAL 적용 (★★ 실용성 높음)
제주어 동사/형용사 활용도 이와 비슷한 음운 규칙(모음조화에 따른 -아/-어 선택,
ㅂ/ㄹ/ㅎ 불규칙, 받침 유무에 따른 조사 결합)으로 상당 부분 규칙화할 수 있습니다.
이번 세션에서 40개 문장을 손으로 "-마씸→-수다" 변환할 때 실제로 썼던 규칙이:
- 어간 끝 모음이 밝은모음(ㅏ,ㅗ)이면 `-았수다`, 어두운모음이면 `-었수다`
- ㄹ 불규칙(들르다→들라마씸) 등은 예외 처리

**구체적 제안**: `reimnigh.py` 같은 단일 파일 스크립트로 "제주어 동사 어간 +
종결어미 종류"를 입력하면 활용형을 뱉어주는 작은 도구를 만들면, 앞으로 종결어미
다양화나 신규 동사 추가 때마다 매번 사람이 활용형을 손으로 검증하는 대신
1차 초안을 자동 생성하고 사람은 검수만 하면 됩니다. 이번 세션에서 제가 40개를
수작업으로 검증한 그 판단 로직을 그대로 코드화하면 됩니다.

---

## 7. kscanne/gramadoir

**https://github.com/kscanne/gramadoir** — "소수 언어를 위한 문법 검사 엔진" (Perl, 20년 이상 유지보수)

### 핵심: 여러 언어에 재사용 가능한 프레임워크로 설계됨
저장소에 `ga/`(아일랜드어) 폴더와 나란히 **`xx/`(템플릿) 폴더**가 있습니다 — 즉
이 엔진 자체는 아일랜드어 전용이 아니라, 새로운 언어를 추가할 수 있게 일반화된
구조입니다. `xx/`에는 `rialacha-xx.in`(규칙), `token-xx.in`(토큰화 설정),
`morph-xx.txt`(형태소 사전) 등 언어별로 채워 넣어야 할 파일들이 뼈대만 있는
상태로 들어있습니다.

### 규칙 파일 형식 (`ga/rialacha-ga.in` 발췌)
```
# All "OK"'s that undo errors inserted by Gramadóir must come first!
#. Seo é a chuntas féin ar ar tharla ina dhiaidh sin (OK).
ar ar:OK
#. Aithníonn ciaróg ciaróg eile (OK).
ciaróg ciaróg:OK
```
`패턴:판정` 형식의 아주 단순한 텍스트 규칙 파일이고, 각 규칙 위에 **실제 정문/오문
예시와 문법책 출처 주석**이 달려 있습니다. 프로그래머가 아닌 언어학자도 규칙을
추가할 수 있게 설계된 형식입니다.

### HTTP API (`API.md`)
```
POST https://cadhan.com/api/gramadoir/1.0
  teacs=<검사할 텍스트>&teanga=<오류 메시지 언어>&cliant=<클라이언트 ID>

응답 예시:
[{
  "ruleId": "Lingua::GA::Gramadoir/SEIMHIU",
  "fromy": "1", "fromx": "36", "toy": "1", "tox": "43",
  "errortext": "an Puint",
  "msg": "Lenition missing",
  "context": "'Cuir ar Áit an Puint mé.",
  "contextoffset": "13"
}]
```
텍스트 안의 **정확한 위치(줄/컬럼)와 규칙 ID, 사람이 읽을 메시지**를 JSON으로
돌려주는 표준적인 린터 API 형태입니다. 이미 대학 CALL(컴퓨터 보조 언어학습)
플랫폼(An Scéalaí, 트리니티 칼리지 더블린)에 실제로 통합되어 쓰이고 있습니다.

### JEJUMAL 적용 (★★★ 이번 세션 QC 프로세스 전체와 직결)
이번 세션 QC 작업의 실체는 사실 "제주어 문법 검사기를 매번 파이썬 스크립트로
새로 만든 것"이었습니다(`full_audit.py`의 조사 호응/존댓말 종결/표제어 대응
체크들). Gramadóir는 이걸 이미 **정식 제품**으로 만든 사례입니다.

**구체적 제안**:
1. `full_audit.py`의 각 체크(조사 호응, 존댓말 종결, 표제어-예문 대응 등)를
   Gramadóir처럼 "패턴 + OK/오류 판정 + 예시 주석" 형식의 **규칙 파일**로
   정식화해서 저장소에 커밋
2. 나중에 여유가 되면 이걸 HTTP 서비스로 감싸서, 콘텐츠 담당자/QC 봇이 API
   호출 한 번으로 새 예문을 검증할 수 있게 만들면 매번 스크립트를 다시 짤
   필요가 없어짐
3. `xx/` 템플릿 구조 자체도, 만약 다른 방언(전라도/경상도 사투리 등)으로
   같은 앱을 확장하고 싶어질 경우 "언어팩만 갈아끼우는" 구조의 좋은 참고 예시

---

## 8. kscanne/canuint

**https://github.com/kscanne/canuint** — 텍스트를 방언별(코나흐트/먼스터/얼스터)로 분류하는 나이브 베이즈 분류기 (Perl, 150줄)

### 구조
```
canuint.pl    # 분류 실행 (~60줄)
train.pl      # 모델 학습
features.txt  # 손으로 고른 방언 판별 특징 (정규식 쌍)
model.txt     # 학습된 로그확률 테이블
```

### 특징 정의 방식 (`features.txt` 발췌)
```
# Eclipsis of b,c,f,g,m,p after simple prep + singular article => M or C
(a[grs]|ins|leis|roimh|thar|[ft]h?ríd|um) an (gc|bhf|ng|m[^h]|bp)	(a[grs]|...) an ([bcfgmp]|ng)
```
각 줄은 "**패턴 F** \t **분모가 되는 일반 패턴 G**" 쌍이고, 주석에 "이 패턴이
왜 이 방언의 특징인지" 문법적 근거가 달려 있습니다. 1900~1950년 방언 텍스트
말뭉치로 각 방언에서 이 패턴이 등장하는 조건부 확률을 학습(`train.pl`)해서,
새 텍스트가 들어오면 3-gram 윈도우 단위로 로그확률을 누적해 가장 그럴듯한
방언을 출력합니다(`canuint.pl`).

### JEJUMAL 적용
이번 세션에서 "표준어가 섞인 문장인지 진짜 제주어인지"를 사람이 눈으로 계속
판단해야 했습니다(예: "-읍서/-우다/-마씸" 같은 제주 종결어미 vs 표준어투
문장이 섞여 있는지). **손으로 고른 20~30개 정도의 제주어 특징 패턴**
(예: "-마씸/-수다/-우다/-읍주/-읍서" 종결, "ㅎ 탈락", "아래아(ㆍ) 잔재 표기" 등)
만 있어도 이런 가벼운 나이브 베이즈 분류기를 흉내 낼 수 있습니다. 새 예문을
넣을 때 "이 문장이 제주어 특징을 몇 개나 갖고 있는지" 점수만 매겨도, 표준어에
가까운 밋밋한 문장을 자동으로 걸러내는 1차 필터로 쓸 수 있습니다.

---

## 9. m4cd4r4/cupla-focail

**https://github.com/m4cd4r4/cupla-focail** — 아일랜드어-영어 사전, 135,708항목, 위젯/API/npm 3중 배포

### 배포 방식 3가지 (README 발췌)
1. **위젯**: `<script src=".../widget.js" data-category="greetings"></script>` 한 줄로
   아무 웹페이지에나 사전 버튼 삽입
2. **iframe 임베드**: `<iframe src=".../embed?category=greetings">` 로 전체 UI 삽입
3. **REST API**: `GET /api/search?q=mathair` (fada 발음부호 무시 검색 지원),
   `GET /api/word-of-the-day` (날짜 기반 결정적 오늘의 단어)
4. **npm 패키지**: `npm install irish-dictionary` — 의존성 0개, React/Vue/Svelte/
   Node 어디서나 `import { search, wordOfTheDay } from 'irish-dictionary'`

### 데이터 스키마
```json
{
  "id": "mathair", "irish": "máthair", "english": "mother",
  "englishAlt": ["mom", "mam", "mammy"],
  "partOfSpeech": "noun", "category": "family", "gender": "feminine",
  "pronunciation": "/ˈmˠɑːhəɾʲ/",
  "inflections": ["máthar", "máithreacha", "máitheacha"],
  "source": "curated",
  "searchTerms": ["mathair","mother","mom","mam","mammy","mathar","maithreacha"]
}
```
- `englishAlt`(동의어/구어체 표현들)와 `searchTerms`(발음부호 제거+활용형까지
  전부 합친 검색 인덱스)를 **미리 계산해서 저장**해둡니다.
- 4개의 서로 다른 데이터 출처(수작업 큐레이션/WordNet/Wiktextract/병렬말뭉치)를
  `source` 필드로 태그해서 섞어 씁니다.

### JEJUMAL 적용
- **이표기 문제**: 이번 세션에서 "느/늬", "너내/너네/느네", "무시거/무스거" 같은
  이표기 때문에 후보 중복 제거 로직을 따로 짜야 했습니다. `searchTerms` 방식처럼
  **표제어마다 이표기 배열을 미리 저장**해두면, "이 단어가 이미 세트에 있는지"
  판단이 문자열 유사도 계산 없이 배열 조회로 끝납니다.
- **배포 전략**: 지금 JEJUMAL은 앱 안에 갇혀 있는데, 나중에 "제주어 위젯"이나
  "제주어 사전 API"를 별도로 공개하면(마치 cupla-focail처럼) 다른 제주 관광/교육
  콘텐츠에서도 가져다 쓸 수 있어 확산 경로가 넓어집니다. 지금 QC를 다 마친
  1,000단어 데이터셋 자체가 이미 이런 API/위젯의 원재료가 될 수 있습니다.
- **출처 태깅**: JEJUMAL도 `출처: 기존1000 / 후보400 / 창작예문` 처럼 이미 출처를
  태그하고 있었는데(엑셀 시트 기준), 이걸 정식으로 `word.source` 필드로
  `units.json`에도 남겨두면 나중에 "이 단어가 사전 원본인지 창작 예문인지"를
  코드에서 바로 조회할 수 있습니다(지금은 엑셀에만 있고 앱 데이터엔 없음).

---

## 10. 종합: JEJUMAL 적용 우선순위

실제 코드/스키마를 다 본 결과, 투자 대비 효과 순으로 정리하면:

| 순위 | 아이디어 | 참고 저장소 | 예상 작업량 | 효과 |
|---|---|---|---|---|
| 1 | 예문에 토큰-표제어(lemma) 매핑 추가 → 표제어-예문 대응 버그 원천 차단 | irish-sentence-bank | 중 (신규 단어부터 점진 적용) | 이번 세션에 반복된 버그 유형 자체를 제거 |
| 2 | 동형이의어를 "표제어=뜻=예문" 독립 레코드로 분리하는 스키마 검토 | pota-focal-gluais | 중~대 (스키마 변경) | 고장/절간/산물류 충돌 버그의 근본 해결 |
| 3 | 제주어 동사·형용사 157개용 활용표(종결어미별 활용형) 자동 생성 스크립트 | reimnigh, BuNaMo | 소~중 | "-마씸 붕어빵" 잔여 22개 유닛 및 향후 신규 동사 추가가 안전해짐 |
| 4 | `full_audit.py`의 QC 체크들을 정식 "규칙 파일" 형식으로 재정리 | gramadoir | 소 | 재사용성, 비개발자 기여 가능성 확보 |
| 5 | 어휘 빈도 산출물을 정식 데이터 파일로 저장소에 커밋 | irish-word-frequency | 소 | 매번 스크래치패드에서 재계산 안 해도 됨 |
| 6 | 제주어 방언성 판별 경량 분류기(20~30개 규칙) | canuint | 소 | 표준어 오염 문장 1차 자동 필터 |
| 7 | (장기) 사전 API/위젯으로 독립 공개 | cupla-focail | 대 | 확산 채널 확보, 별도 프로젝트 급 |

**당장 다음 라운드에 시도해볼 만한 것 하나만 고른다면**: 3번(활용표 자동 생성)을
추천합니다. 이번 세션에서 제가 40개 문장을 손으로 검증하며 실제로 쓴 규칙(모음
밝기에 따른 -았/었 선택 등)을 그대로 코드로 옮기면 되고, 나머지 22개 유닛의
"-마씸" 편중 문제를 훨씬 빠르고 안전하게 마무리할 수 있습니다.
