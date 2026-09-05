# 언어학습·소수언어 오픈소스 생태계 — JEJUMAL 참고 자료 (2차)

`docs/reference-irish-oss.md`(아일랜드어 생태계)에 이어, GitHub에서 찾은 언어학습 앱·
소수언어 보존 프로젝트 11개를 직접 클론해서 코드/스키마까지 뜯어본 결과입니다.

> 조사 방법: 각 저장소를 `git clone --depth 1`로 받아 실제 소스 파일(스키마, 상태관리,
> 데이터 포맷)을 읽었습니다. (2026-09 기준)

---

## 목차

1. [bryanjenningz/react-duolingo — Zustand 슬라이스 패턴](#1-react-duolingo)
2. [sanidhyy/duolingo-clone — 관계형 학습 데이터 스키마](#2-duolingo-clone)
3. [kantord/LibreLingo — YAML 코스 포맷과 아카이브된 이유](#3-librelingo)
4. [open-spaced-repetition/ts-fsrs — FSRS 알고리즘 실제 구현](#4-ts-fsrs)
5. [108charlotte/Living-Flashcards — FSRS를 실제로 붙인 최소 예제](#5-living-flashcards)
6. [livingtongues/living-dictionaries — 진짜 위기언어 사전 스키마](#6-living-dictionaries)
7. [lingdojo/kana-dojo — 다국어(i18n)·Anki 변환기 구조](#7-kana-dojo)
8. [Tatoeba/tatoeba2 — 번역 신뢰도 계층 구조](#8-tatoeba2)
9. [LuteOrg/lute-v3 — 읽으면서 배우는 단어 숙련도 모델](#9-lute-v3)
10. [andymatuschak/orbit — 본문에 내장되는 복습 프롬프트](#10-orbit)
11. [elitenoire/trylingo — 가볍게 참고](#11-trylingo)
12. [종합: JEJUMAL 적용 우선순위](#12-종합-jejumal-적용-우선순위)

---

## 1. react-duolingo

**https://github.com/bryanjenningz/react-duolingo** — React 18 + TypeScript + **Zustand** + Tailwind + Next.js Pages Router

### 구조 — Zustand "슬라이스 패턴"
JEJUMAL의 `progress.ts`는 하나의 거대한 `create()` 스토어에 모든 상태(진행도/오답노트/
통계)를 다 넣은 **단일 스토어**입니다. react-duolingo는 기능별로 스토어를 8개 파일로
쪼갠 뒤 하나로 합칩니다:

```
src/stores/
  createGoalXpStore.ts
  createLanguageStore.ts
  createLessonStore.ts
  createLingotStore.ts       (재화/포인트)
  createSoundSettingsStore.ts
  createStreakStore.ts
  createUserStore.ts
  createXpStore.ts
```

```ts
// hooks/useBoundStore.ts
type BoundState = GoalXpSlice & LanguageSlice & LessonSlice & LingotSlice
  & SoundSettingsSlice & StreakSlice & UserSlice & XpSlice;

export type BoundStateCreator<SliceState> = StateCreator<BoundState, [], [], SliceState>;

export const useBoundStore = create<BoundState>((...args) => ({
  ...createGoalXpSlice(...args),
  ...createLanguageSlice(...args),
  ...createLessonSlice(...args),
  ...createLingotSlice(...args),
  ...createSoundSettingsSlice(...args),
  ...createStreakSlice(...args),
  ...createUserSlice(...args),
  ...createXpSlice(...args),
}));
```
각 슬라이스는 자기 타입(`XxxSlice`)과 생성 함수(`createXxxSlice`)만 export하는 독립
파일이라, 기능 하나를 통째로 추가/삭제/테스트하기 쉽습니다.

### 스트릭(연속 학습일) 계산 방식 — 저장하지 않고 파생시킴
```ts
// createStreakStore.ts
const getCurrentStreak = (activeDays: ActiveDays): number => {
  let daysBack = 0;
  let day = dayjs();
  while (isActiveDay(activeDays, day)) {
    day = day.add(-1, "day");
    daysBack += 1;
  }
  return daysBack;
};
```
"오늘 활동한 날짜들의 집합(`Set<DateString>`)"만 저장해두고, 스트릭 숫자는 그때그때
"오늘부터 거꾸로 며칠 연속 활동했는지" 세어서 계산합니다. 별도로 "streak 카운터"를
증감시키다가 버그로 어긋나는 일이 구조적으로 불가능합니다.

**참고**: JEJUMAL의 `src/lib/stats.ts`의 `studyStreak()`도 이미 정확히 같은 방식
(記録에서 거꾸로 세는 파생 계산)을 쓰고 있습니다 — **이 부분은 이미 베스트 프랙티스와
일치**해서 손댈 필요 없습니다. 다만 진행도(`progress.ts`) 전체를 단일 스토어로 관리하는
부분은, 지금은 상태가 몇 개 안 되지만 기능이 늘어나면(하트, 재화, 목표XP 등) 이 슬라이스
패턴으로 리팩터링해두면 편합니다.

---

## 2. duolingo-clone

**https://github.com/sanidhyy/duolingo-clone** (645★) — Next.js + Drizzle ORM + PostgreSQL + Clerk 인증

### 관계형 스키마 (`db/schema.ts` 발췌)
```
courses ──< units ──< lessons ──< challenges ──< challenge_options
                                       │
                                       └──< challenge_progress (user_id, completed)
user_progress (user_id PK, hearts, points, active_course_id)
user_subscription (Stripe 결제 정보)
```
```ts
export const challenges = pgTable("challenges", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }),
  type: pgEnum("type", ["SELECT", "ASSIST"])("type").notNull(),
  question: text("question").notNull(),
  order: integer("order").notNull(),
});
```
JEJUMAL은 `units.json`이라는 **로컬 전용 정적 파일**에 모든 콘텐츠가 들어있고, 진행도는
브라우저 `localStorage`(Zustand persist)에만 저장됩니다. 이 프로젝트는 콘텐츠(`courses`
~`challenge_options`)와 사용자별 진행도(`user_progress`, `challenge_progress`)가
**서버 DB에 완전히 분리**되어 있어서, 여러 기기 동기화·리더보드·계정 시스템이 자연스럽게
따라옵니다.

### 하트(생명) 시스템 — "복습하면 하트 회복"
```ts
// actions/challenge-progress.ts
if (currentUserProgress.hearts === 0 && !isPractice && !userSubscription?.isActive)
  return { error: "hearts" };

if (isPractice) {
  // 이미 완료한 문제를 다시 풀면: 하트 회복 + 포인트 지급
  await db.update(userProgress).set({
    hearts: Math.min(currentUserProgress.hearts + 1, MAX_HEARTS),
    points: currentUserProgress.points + 10,
  })...
}
```
"처음 푸는 문제"와 "이미 맞힌 문제를 복습차 다시 푸는 것(practice)"을 구분해서, **복습에
보상(하트 회복)을 주는 방식**으로 재학습을 유도합니다. JEJUMAL은 지금 오답 시 페널티도
없고 복습에 별도 보상도 없는데, 다음에 리텐션 기능을 고민할 때 참고할 만한 저-비용
동기부여 장치입니다(서버 없이 로컬 상태로도 흉내 낼 수 있음 — 예: "오늘 복습 3개 완료 시
보너스 XP").

### JEJUMAL 적용
- 지금 구조(로컬 전용)를 유지할 거라면 이 스키마를 그대로 가져올 필요는 없지만, **"콘텐츠
  테이블"과 "사용자 진행도 테이블"을 분리해서 생각하는 습관**은 유효합니다. 나중에 서버
  동기화가 필요해지면 이 스키마가 거의 그대로 참고 설계도가 됩니다.
- `challenge_options`처럼 오답 선택지를 표제어 데이터에 **미리 저장**해두는 방식도 있는데,
  JEJUMAL의 `quiz.ts`처럼 런타임에 동적으로 오답을 뽑는 방식이 콘텐츠 관리 부담은 더
  적습니다(표제어 늘어날 때마다 오답도 수동으로 안 채워도 됨). 지금 방식 유지 추천.

---

## 3. LibreLingo

**https://github.com/kantord/LibreLingo** (2.6k★, archived) — Python + Svelte, YAML 기반 코스

### 코스 = 파일 트리 구조
```
course.yaml                    (언어 메타, 특수문자 목록, 라이선스)
  Modules: [basics]
basics/module.yaml
  Skills: [animals.yaml, short-input-test0.yaml, ...]
basics/skills/animals.yaml     (= 유닛 하나)
```

### 어휘 항목 포맷 — 동의어/대체 정답을 표제어 안에 내장
```yaml
New words:
  - Word: perro
    Synonyms:
      - el can
      - can
      - el perro
    Translation: the dog
    Also accepted:
      - dog
    Images:
      - dog1
      - dog2
      - dog3

Mini-dictionary:
  English:
    - the:
      - la
      - el
```
**`Synonyms`(이표기/동의어)와 `Also accepted`(정답으로도 인정할 표현)가 표제어 항목의
필드로 내장**되어 있습니다. 그리고 스킬(유닛)마다 `Mini-dictionary`(그 유닛 범위에서만
유효한 축소 사전)를 따로 둬서, 한 단어가 유닛에 따라 다른 조사/문맥으로 번역돼도
충돌하지 않게 합니다.

### JEJUMAL 적용 (★★★ 이표기 문제 직결)
이번 세션에서 "무시거/무스거", "너내/너네", "느/늬" 같은 이표기 때문에 후보 중복 제거
로직을 따로 짜야 했고, 신규 어휘 후보 400개에서 같은 단어가 seq만 다르게 중복 등장하는
버그도 있었습니다. LibreLingo처럼 **표제어 하나에 `synonyms`/`alsoAccepted` 배열
필드를 추가**하면:
- "느내"를 별도 표제어로 또 넣을지 말지 고민할 필요 없이, "너내"의 `synonyms`에
  추가하면 끝
- 퀴즈에서 사용자가 이표기로 답을 입력해도 정답 처리 가능 (지금은 객관식이라 당장 급하진
  않지만, 나중에 주관식/철자 입력 문제를 추가하면 바로 필요해짐)

### 왜 archived 됐는지 (반면교사)
README에 관리자가 직접 "현재 유지보수하지 않는다"고 명시하고, 커뮤니티 포크
(LibreLingoRelive)로 이관했습니다. YAML 코스를 커뮤니티가 자유롭게 추가하는 구조라
**콘텐츠는 늘어나는데 그걸 검수할 사람이 안 늘어나서** 유지보수 부담이 커진 것으로
보입니다. JEJUMAL이 나중에 "제주어 콘텐츠 크라우드소싱"을 고려한다면, **콘텐츠
접수창구를 여는 것과 그걸 지속적으로 검수할 인력을 확보하는 것은 별개 문제**라는 걸
미리 감안해야 합니다.

---

## 4. ts-fsrs

**https://github.com/open-spaced-repetition/ts-fsrs** — FSRS 알고리즘의 공식 TypeScript 구현체, **의존성 0개**

### 핵심 타입 (`packages/fsrs/src/models.ts`)
```ts
export interface Card {
  due: Date              // 다음 복습 예정일
  stability: number      // 기억 안정성 (핵심 변수)
  difficulty: number     // 난이도
  scheduled_days: number
  learning_steps: number
  reps: number           // 총 복습 횟수
  lapses: number         // 실패(까먹은) 횟수
  state: State           // New | Learning | Review | Relearning
  last_review?: Date
}
```

### 사용 흐름
```ts
import { createEmptyCard, fsrs, Rating } from 'ts-fsrs'

const f = fsrs()                        // 기본 파라미터로 스케줄러 생성
const card = createEmptyCard()          // 새 카드
const schedulingCards = f.repeat(card, new Date())
// schedulingCards.Again / .Hard / .Good / .Easy 각각에
// 사용자가 어떻게 답했는지에 따른 "다음 카드 상태 + due 날짜"가 미리 계산되어 있음
const { card: nextCard, log } = schedulingCards[Rating.Good]
```

### JEJUMAL 적용 (★★★ 최우선 추천, 이유 있음)
JEJUMAL의 `progress.ts`에 있는 `WrongCard` 타입과 FSRS의 `Card`가 거의 1:1로
대응됩니다:

| JEJUMAL 현재 (`WrongCard`) | FSRS로 교체 시 |
|---|---|
| `timesMissed` (누적 횟수만) | `reps`, `lapses` (복습/실패 횟수 분리 추적) |
| `intervalDays` (고정 사다리 [1,3,7,14,30]에서 조회) | `stability`, `difficulty`로 **개인별로 계산**된 간격 |
| `lastReviewedAt` | `last_review` |
| (없음) | `due` — "언제 다시 보여줄지"가 카드마다 정확히 계산됨 |

지금 고정 사다리 방식은 "모든 사용자, 모든 단어가 똑같은 속도로 잊혀진다"고 가정하는
셈인데, FSRS는 실제 정답/오답 이력을 학습해서 **사용자마다, 단어마다 다른 망각 속도**를
반영합니다. 의존성이 없는 순수 알고리즘 라이브러리라 `npm install ts-fsrs` 하나로
`progress.ts`의 오답노트 로직만 교체하면 되고, UI 변경은 거의 필요 없습니다(복습 카드를
"언제 다시 보여줄지"를 결정하는 내부 로직만 바뀜).

---

## 5. Living-Flashcards

**https://github.com/108charlotte/Living-Flashcards** — Django, **ts-fsrs의 자매 Python 패키지(`fsrs`)를 실제로 붙인 예제**

### 데이터 모델 (`flashcards/models.py`)
```python
class CardInfo(models.Model):
    deck = models.ForeignKey(Deck, ...)
    term = models.CharField(max_length=100)
    definition = models.TextField()
    living_dictionaries_id = models.CharField(max_length=100)  # ← 6번 항목 사전과 연동!

class CardToUser(models.Model):
    card_id = models.ForeignKey(CardInfo, ...)
    user_id = models.ForeignKey(settings.AUTH_USER_MODEL, ...)
    review_card = models.JSONField(default=dict, blank=True)   # FSRS Card를 통째로 JSON 저장
    see_next = models.DateTimeField(null=True, blank=True)

    def update_json(self, card):          # card: fsrs.Card
        self.review_card = card.to_dict()
        self.see_next = card.due

    def get_card(self):
        if self.review_card:
            return Card.from_dict(self.review_card)
        return Card()

class Review(models.Model):    # 스케줄링 상태와 별도로 "언제 무슨 평가를 받았는지" 불변 기록
    user = models.ForeignKey(...)
    card = models.ForeignKey(CardInfo, ...)
    rating = models.CharField(max_length=16, ...)
    created_at = models.DateTimeField(auto_now_add=True)
```

### JEJUMAL 적용
- FSRS의 `Card` 객체를 그대로 `to_dict()`/`from_dict()`로 JSON 직렬화해서 저장하는
  패턴은 JEJUMAL의 `wrongBySeq: Record<string, WrongCard>` 구조에 **그대로 이식
  가능**합니다. `WrongCard`의 필드 몇 개를 FSRS `Card` 필드로 바꾸기만 하면 됩니다.
- **"현재 스케줄링 상태"(`CardToUser.review_card`)와 "복습 이력"(`Review` 테이블)을
  분리**한 설계가 좋습니다. JEJUMAL은 지금 `timesMissed`(누적 카운터)만 있고 "언제
  틀렸었는지" 이력 자체는 안 남기는데, 나중에 학습 분석 화면(예: "이번 주 자주 틀린
  단어")을 만들고 싶어지면 이 분리 구조가 필요해집니다.
- `living_dictionaries_id` 필드처럼, 카드가 **어느 사전 항목에서 왔는지 원본 출처를
  참조**해두는 습관도 좋습니다. JEJUMAL도 `word.source`(사전 seq/후보400/창작예문 등)를
  정식 필드로 남겨두면 나중에 "이 단어가 왜 이 뜻으로 들어왔는지" 추적이 쉬워집니다.

---

## 6. living-dictionaries

**https://github.com/livingtongues/living-dictionaries** — SvelteKit + Supabase(Postgres), 실제 운영 중인 대형 프로젝트

### 사전 스키마 (`site/src/lib/types/entry.interface.ts`) — ★★★ 가장 중요한 발견
```ts
export interface EntryData {
  id: string
  main: {
    homograph, lexeme, phonetic, morphology, scientific_names,
    linguistic_history, notes, sources, coordinates, ...
  }
  senses: {
    definition, glosses, parts_of_speech, semantic_domains, variant,
    sentences?: { text, translation, text_id }[]
    photos?: { photographer, storage_path, latitude, longitude, taken_at }[]
    videos?: [...]
  }[]
  audios?: {
    source, storage_path,
    speakers?: { name, gender, decade, birthplace }[]   // 화자 정보!
  }[]
  dialects?: { name, coordinates }[]
  tags?: [...]
}
```

핵심 설계 3가지:
1. **`homograph` 필드**: 같은 철자라도 뜻이 다르면 "동형이의어 몇 번째"를 명시적으로
   구분(사전 편찬학의 표준 관행). "고장(꽃)"과 "고장(故障)"을 억지로 별개 표제어 취급하지
   않고, 한 표제어 아래 번호만 다르게 매깁니다.
2. **`senses`가 배열**: 뜻(sense) 하나마다 자기만의 예문(`sentences`)·사진·영상을
   독립적으로 갖습니다. 뜻과 예문이 서로 다른 걸 가리키는 사고(이번 세션에 반복됐던
   버그 유형)가 스키마 차원에서 불가능해집니다.
3. **`audios[].speakers[]`**: 발음 하나하나가 **어떤 화자**(성별/출생연대/출생지)의
   녹음인지 명시적으로 붙습니다. 방언은 세대·지역별로 발음이 다른데, 이걸 데이터로
   추적할 수 있습니다.

### JEJUMAL 적용
- 이번 세션 내내 손으로 잡아온 "고장/절간/산물/장남/세양" 동형이의어 충돌 버그는, 애초에
  `homograph` 필드 하나만 있었어도 구조적으로 예방됐을 문제입니다. 지금 당장 전체
  스키마를 바꾸긴 무리지만, **최소한 새 데이터를 편입할 때 "이 표제어가 이미 다른 뜻으로
  존재하는가"를 확인하는 절차를 정식화**하는 데는 참고가 됩니다.
- `speakers` 메타데이터 아이디어는, 지금 신규 107단어처럼 발음 파일을 새로 구해야 할 때
  "이 발음이 누구 목소리인지"까지 같이 남겨두면 나중에 여러 화자를 섞어 쓰게 될 때
  유용합니다.
- 이 프로젝트에는 `.claude/skills`, `.cron/api-conformance-reviews` 같은 자동화된
  Claude 기반 워크플로우도 있어서, "AI를 활용한 반복 검수 자동화"를 이미 실전에 쓰고
  있는 사례로 참고할 만합니다(자세히 보진 않았지만 존재 자체가 참고 포인트).

---

## 7. kana-dojo

**https://github.com/lingdojo/kana-dojo** (3.3k★) — Next.js App Router, 일본어 학습

### 구조
```
app/[locale]/
  kana/  kanji/  conjugate/  translate/  academy/
  anki-converter/     ← 자체 콘텐츠를 Anki 덱으로 내보내는 기능
  experiments/  demo/  patch-notes/
```
`[locale]` 동적 라우트로 다국어 UI(next-intl류)를 지원하고, **`anki-converter`**라는
기능이 따로 있어서 앱 안의 학습 콘텐츠를 Anki 덱(.apkg)으로 내보낼 수 있게 해줍니다.

### JEJUMAL 적용
- 다국어 UI: 지금은 한국어 단일 UI인데, 만약 "제주 출신이 아닌 외국인 유학생"이나
  "해외 교포"를 학습자로 넓히고 싶다면 이 `[locale]` 패턴이 표준적인 시작점입니다.
- **Anki 내보내기 기능은 비용 대비 효과가 좋아 보입니다.** JEJUMAL 사용자 중 이미
  Anki로 다른 걸 공부하는 사람이 있다면, "이 유닛을 Anki 덱으로 저장" 버튼 하나로
  기존 복습 습관에 편입시킬 수 있습니다. 구현도 단순합니다(APKG는 SQLite 기반 포맷이고
  오픈소스 라이브러리가 여럿 있음).

---

## 8. Tatoeba2

**https://github.com/Tatoeba/tatoeba2** — CakePHP(PHP), 커뮤니티 기반 다국어 예문 은행

### 번역 신뢰도 계층 구조
```
src/Model/Search/
  TranslationIsDirectFilter.php    (직접 번역인지)
  TranslationIsNativeFilter.php    (원어민이 작성했는지)
  OwnerFilter.php
  IsOrphanFilter.php
```
Tatoeba의 핵심 통찰: 문장 A와 B가 "직접 번역 관계"인지, 아니면 "A→C→B처럼 제3언어를
거친 간접 번역"인지를 구분하고, **각 문장에 원어민 여부 플래그**를 답니다. 그래서
검색·필터링할 때 "원어민이 직접 번역한 문장만" 골라볼 수 있습니다.

### JEJUMAL 적용
지금 예문은 전부 "봇이 검증"했거나 "제가 직접 지음" 둘 중 하나인데, 앞으로 실제
제주어 화자(원어민)의 기여를 받는 걸 고려한다면 Tatoeba처럼 **예문마다 출처 신뢰도
등급**(예: `native_verified` / `bot_generated` / `corpus_extracted` / `unverified`)을
매겨두는 게 좋습니다. 이번 세션에서 만든 `word.source`(기존1000/후보400/창작예문) 필드
아이디어를 이 방향으로 좀 더 세분화하면 됩니다.

---

## 9. lute-v3

**https://github.com/LuteOrg/lute-v3** — Flask(Python), "읽으면서 배우는" 컨셉

### 핵심: 단어 숙련도를 이진(안다/모른다)이 아니라 단계로 추적
```python
# lute/models/term.py
class Term(...):
    status = db.Column("WoStatus", db.Integer)   # 1~5 단계 + 98(완전히 앎) + 99(무시)
```
사용자가 실제 텍스트(책, 기사)를 읽다가 모르는 단어를 클릭하면 뜻을 보여주고, 그 자리에서
"이 단어를 얼마나 아는지"(1단계 처음 봄 ~ 5단계 거의 앎 ~ 완전히 앎)를 매깁니다. 이미
"잘 아는" 단어는 화면에서 강조 표시가 사라져서, 정말 모르는 단어에만 시선이 갑니다.

### JEJUMAL 적용
지난 리뷰에서 제안했던 "고립 예문 대신 맥락 있는 읽기 지문" 아이디어의 구체적인 구현
방식입니다. 마침 이번에 확보한 **jeju.go.kr 생활방언 100편**(인사말/일상대화/결혼/철학
등 짧은 글)이 이 방식에 정확히 맞는 콘텐츠입니다:
- 100편을 "읽기" 탭으로 노출
- 문단 안에서 지금 1,000단어 세트에 있는 단어를 자동 하이라이트
- 클릭하면 뜻 팝업 + "아는 단어로 표시" 버튼

기존 퀴즈 기반 학습과 별개의 보조 학습 모드로 넣기 좋은 구조입니다. 다만 Flask 전체
아키텍처를 참고할 필요는 없고, **"단어 숙련도를 다단계로, 텍스트에 인라인으로
표시한다"는 아이디어만** 가져오면 충분합니다.

---

## 10. orbit

**https://github.com/andymatuschak/orbit** — 모노레포, "니모닉 미디엄" 연구 프로젝트

### 핵심 아이디어: 웹 컴포넌트로 복습 프롬프트를 글 속에 삽입
```
packages/web-component/   "Author-facing library for Orbit integration into external web sites"
packages/anki-import/     Anki .apkg 가져오기
packages/core/            핵심 스케줄링 로직
```
저자가 블로그 글이나 교재를 쓸 때, 본문 문단 중간중간에 `<orbit-reviewarea>` 같은 웹
컴포넌트를 심어두면, 독자가 글을 읽는 도중 자연스럽게 그 문단 내용에 대한 복습 퀴즈가
튀어나오는 방식입니다("[mnemonic medium](https://numinous.productions/ttft/)"라는
개념). 퀴즈가 글과 분리된 별도 화면이 아니라 **글의 일부처럼 자연스럽게 등장**합니다.

### JEJUMAL 적용
9번(lute-v3)의 "읽기 지문" 아이디어와 결합하면 강력합니다: 생활방언 100편 중 한 편을
읽다가, "혼저 옵서"라는 표현이 나온 직후에 "혼저 옵서 = ? [보기]" 같은 미니 퀴즈가
바로 그 자리에 뜨는 방식. 지금 JEJUMAL의 퀴즈 UI(`quiz-view.tsx`, `flashcard.tsx`)
컴포넌트를 재사용해서 "문단 속에 삽입 가능한 축소 버전"으로 만들면 충분히 구현
가능합니다 — orbit 코드 자체를 가져다 쓸 필요는 없고 컨셉만 참고하면 됩니다.

---

## 11. trylingo

**https://github.com/elitenoire/trylingo** — Next.js + shadcn/ui

JEJUMAL과 같은 계열의 UI 컴포넌트(`button.tsx`, `badge.tsx` 등 shadcn 기반)를 쓰고
있어서 가볍게 훑어봤습니다. `actions/selectCourse.ts` 같은 Next.js 서버 액션 패턴을
쓰는데, JEJUMAL은 현재 순수 클라이언트 SPA(Vite)라 직접적인 이식 포인트는 크지
않았습니다. UI 컴포넌트 조합 스타일 정도만 참고할 만합니다.

---

## 12. 종합: JEJUMAL 적용 우선순위

| 순위 | 아이디어 | 참고 저장소 | 예상 작업량 | 효과 |
|---|---|---|---|---|
| 1 | **FSRS로 오답노트 스케줄링 교체** | ts-fsrs, Living-Flashcards | 소~중 (npm install + `progress.ts` 로직 교체) | 고정 사다리[1,3,7,14,30] → 개인별 망각곡선 반영, 의존성 0개라 리스크 낮음 |
| 2 | **표제어에 `synonyms`/`alsoAccepted` 필드 추가** | LibreLingo | 소 | 이표기(느/늬, 너내/너네) 중복 관리 문제를 스키마로 해결 |
| 3 | **동형이의어 `homograph` 필드 + 뜻(sense)별 독립 예문** | living-dictionaries, (지난 문서의 pota-focal-gluais) | 중~대 (스키마 변경) | 고장/절간/산물류 충돌 버그의 근본 해결 — 지난 문서와 동일한 결론이 두 번째로 확인됨 |
| 4 | **생활방언 100편을 "읽기" 모드로 노출 (단어 하이라이트 + 인라인 미니퀴즈)** | lute-v3, orbit | 중 | 고립 예문 학습의 단조로움 해소, 확보해둔 실사용 콘텐츠를 바로 활용 |
| 5 | **Zustand 슬라이스 패턴으로 `progress.ts` 리팩터링** | react-duolingo | 소 (지금 당장 필수는 아님) | 기능이 늘어날 때(하트, 재화 등) 확장성 확보 |
| 6 | **Anki 덱 내보내기 기능** | kana-dojo | 소~중 | 기존 Anki 사용자 습관에 편입, 낮은 비용 대비 효과 |
| 7 | **예문 출처 신뢰도 등급 세분화** (`native_verified`/`bot_generated`/...) | Tatoeba2 | 소 | 나중에 원어민 기여를 받기 시작할 때 필요 |
| 8 | (장기, 서버 인프라 필요) 계정+멀티기기 동기화용 관계형 스키마 | sanidhyy/duolingo-clone | 대 | 지금은 로컬 전용이라 우선순위 낮음, 필요해지면 이 스키마가 설계 출발점 |

**지난 아일랜드어 문서와 종합하면**, 지금 가장 먼저 손댈 만한 두 가지는 **① FSRS
전환**(순수 알고리즘 교체, 리스크 낮음)과 **② 표제어 스키마에 이표기/동형이의어 처리
필드 추가**(반복적으로 여러 저장소에서 확인된 설계 원칙)입니다. 둘 다 UI를 거의 안
건드리고 데이터 계층만 손보면 되는 작업입니다.
