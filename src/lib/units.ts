import rawUnits from "@/data/units.json";

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "number"
  | "interjection"
  | "determiner";

export type Example = {
  jeju: string;
  standard: string;
};

export type ReviewStatus = "approved" | "provisional" | "blocked";

export type Word = {
  seq: string;
  jeju: string;
  standard: string;
  soundUrl: string;
  partOfSpeech: PartOfSpeech;
  examples?: Example[];
  /** 뜻 확정 상태. 없으면 approved(승인됨)로 간주한다. */
  reviewStatus?: ReviewStatus;
  /** 공식 발음 파일이 실제로 존재하는지. 없으면 듣기 문제를 만들지 않는다. */
  hasAudio?: boolean;
  /** true면 아직 예문을 안 붙였다는 뜻(examples가 비어 있음) — 화면에 "예문 준비중" 표시용. */
  pendingExample?: boolean;
  /** true면 표제어에 PUA 문자가 섞여 있어 일부 글꼴에서 깨져 보일 수 있음. */
  containsPua?: boolean;
  /** 2025 기본어휘의 상세 뜻풀이. 카드/플래시카드에 표시. */
  definition?: string;
  /** 초급/중급/고급 (2025 기본어휘 등급). */
  level?: "beginner" | "intermediate" | "advanced";
  /** 같은 개념을 수동으로 묶거나, 같은 표준어 gloss의 서로 다른 뜻을 분리할 때 쓰는 선택 override. */
  conceptId?: string;
  /** 읽기 퀴즈에서 같은 표준어의 서로 다른 sense를 짧게 구분하는 learner-facing label. */
  quizGloss?: string;
};

export type Unit = {
  id: string;
  title: string;
  themeId: string;
  rankIndex: number;
  order: number;
  words: Word[];
};

export type Rank = {
  id: string;
  title: string;
  subtitle: string;
  minPercent: number;
};

export type Track = {
  id: string;
  title: string;
  unitIds: string[];
};

export const units = rawUnits as Unit[];

export function firstExample(word: Word): Example | undefined {
  return word.examples?.[0];
}

export const RANKS: Rank[] = [
  { id: "baby", title: "애기해녀", subtitle: "혼저옵서예. 발만 적신 날", minPercent: 0 },
  { id: "ha", title: "하군", subtitle: "얕은 바당, 숨 맞춰 봅주", minPercent: 20 },
  { id: "jung", title: "중군", subtitle: "놀멍 배우멍, 말이 붙었수다", minPercent: 40 },
  { id: "sang", title: "상군", subtitle: "숨비소리 한 번, 깊게 잠수멍", minPercent: 60 },
  { id: "dae", title: "대상군", subtitle: "이 바당의 대상군이우다", minPercent: 80 },
];

export const LEVELS = [
  { id: "beginner", title: "초급", subtitle: "제주어의 첫 걸음" },
  { id: "intermediate", title: "중급", subtitle: "말이 트이기 시작해요" },
  { id: "advanced", title: "고급", subtitle: "진짜 제주 사람처럼" },
] as const;

/** 레벨(초급/중급/고급)별 트랙. units.json의 themeId 기준으로 묶는다. */
export const TRACKS: Track[] = LEVELS.map((level) => ({
  id: level.id,
  title: level.title,
  unitIds: units.filter((unit) => unit.themeId === level.id).map((unit) => unit.id),
}));

export const RANK_ADVANCE_UNITS = 12;
export const RANK_ADVANCE_WORDS = 120;
export const LAST_RANK_INDEX = RANKS.length - 1;

export function unitIdsInRank(rankIndex: number): string[] {
  return units.filter((unit) => unit.rankIndex === rankIndex).map((unit) => unit.id);
}

export function unitsInRank(rankIndex: number): Unit[] {
  return unitIdsInRank(rankIndex)
    .map((id) => byId.get(id))
    .filter((unit): unit is Unit => Boolean(unit));
}

/** 해당 랭크의 유닛 수 */
export function unitsCountInRank(rankIndex: number): number {
  return unitIdsInRank(rankIndex).length;
}

/** 해당 랭크의 전체 단어 수 */
export function wordsInRank(rankIndex: number): number {
  return unitsInRank(rankIndex).reduce((sum, unit) => sum + unit.words.length, 0);
}

/** 완료한 유닛들의 단어 수 합계 */
export function completedWords(completedIds: string[]): number {
  const done = new Set(completedIds);
  return units.reduce((sum, unit) => sum + (done.has(unit.id) ? unit.words.length : 0), 0);
}

/** 해당 랭크에서 완료한 단어 수 (정확 집계) */
export function rankCompletedWords(rankIndex: number, completedIds: string[]): number {
  const done = new Set(completedIds);
  return unitsInRank(rankIndex).reduce(
    (sum, unit) => sum + (done.has(unit.id) ? unit.words.length : 0),
    0,
  );
}

export function isRankComplete(rankIndex: number, completedIds: string[]): boolean {
  return unitIdsInRank(rankIndex).every((id) => completedIds.includes(id));
}

export function rankCompletedCount(rankIndex: number, completedIds: string[]): number {
  return unitIdsInRank(rankIndex).filter((id) => completedIds.includes(id)).length;
}

export function isRankAdvanceReady(rankIndex: number, completedIds: string[]): boolean {
  return rankCompletedCount(rankIndex, completedIds) >= RANK_ADVANCE_UNITS;
}

export function isRankOpen(rankIndex: number, completedIds: string[]): boolean {
  if (rankIndex <= 0) return true;
  if (rankIndex >= RANKS.length) return false;
  if (rankIndex === LAST_RANK_INDEX) {
    return Array.from({ length: LAST_RANK_INDEX }, (_, index) => index).every((index) =>
      isRankComplete(index, completedIds),
    );
  }
  return isRankAdvanceReady(rankIndex - 1, completedIds);
}

export function openRankIndex(completedIds: string[]): number {
  for (let rankIndex = 0; rankIndex < RANKS.length; rankIndex += 1) {
    if (isRankOpen(rankIndex, completedIds) && !isRankComplete(rankIndex, completedIds)) return rankIndex;
  }
  return LAST_RANK_INDEX;
}

export function currentRankIndex(completedIds: string[]): number {
  let index = 0;
  for (let rankIndex = 0; rankIndex < RANKS.length; rankIndex += 1) {
    if (isRankOpen(rankIndex, completedIds)) index = rankIndex;
  }
  return index;
}

export function currentRank(completedIds: string[]): Rank {
  return RANKS[currentRankIndex(completedIds)]!;
}

const byId = new Map(units.map((unit) => [unit.id, unit]));
const wordIndex = new Map<string, { word: Word; unit: Unit }>();
const trackByUnit = new Map<string, Track>();

for (const unit of units) {
  for (const word of unit.words) {
    wordIndex.set(word.seq, { word, unit });
  }
}

for (const track of TRACKS) {
  for (const id of track.unitIds) {
    trackByUnit.set(id, track);
  }
}

export const TOTAL_UNITS = units.length;
export const TOTAL_WORDS = wordIndex.size;

export function getUnit(id: string): Unit | undefined {
  return byId.get(id);
}

export function getWord(seq: string): { word: Word; unit: Unit } | undefined {
  return wordIndex.get(seq);
}

export function getTrack(unitId: string): Track | undefined {
  return trackByUnit.get(unitId);
}

export function isUnitUnlocked(unitId: string, completedIds: string[]): boolean {
  const unit = byId.get(unitId);
  if (!unit) return false;
  return isRankOpen(unit.rankIndex, completedIds);
}

export type RankUnlockHint =
  | { kind: "advance"; remainWords: number; nextTitle: string }
  | { kind: "opened"; nextTitle: string }
  | { kind: "master" }
  | { kind: "locked-advance"; prevTitle: string; haveWords: number; needWords: number }
  | {
      kind: "locked-master";
      ranks: { title: string; haveWords: number; totalWords: number }[];
    };

export function rankUnlockHint(rankIndex: number, completedIds: string[]): RankUnlockHint | null {
  const next = RANKS[rankIndex + 1];
  const prev = RANKS[rankIndex - 1];
  const open = isRankOpen(rankIndex, completedIds);
  if (open) {
    if (!next) return null;
    if (isRankOpen(rankIndex + 1, completedIds)) return { kind: "opened", nextTitle: next.title };
    if (rankIndex === LAST_RANK_INDEX - 1) return { kind: "master" };
    const remain = Math.max(0, RANK_ADVANCE_UNITS - rankCompletedCount(rankIndex, completedIds));
    return { kind: "advance", remainWords: remain * 10, nextTitle: next.title };
  }
  if (rankIndex === LAST_RANK_INDEX) {
    return {
      kind: "locked-master",
      ranks: RANKS.slice(0, LAST_RANK_INDEX).map((item, index) => ({
        title: item.title,
        haveWords: rankCompletedWords(index, completedIds),
        totalWords: wordsInRank(index),
      })),
    };
  }
  if (!prev) return null;
  return {
    kind: "locked-advance",
    prevTitle: prev.title,
    haveWords: rankCompletedWords(rankIndex - 1, completedIds),
    needWords: RANK_ADVANCE_WORDS,
  };
}

export function formatRankUnlockHint(hint: RankUnlockHint): string {
  switch (hint.kind) {
    case "advance":
      return `${hint.remainWords}단어 더 마치면 ${hint.nextTitle}이 열립니다`;
    case "opened":
      return `${hint.nextTitle}이 열렸습니다. 남은 단어도 이어서 배울 수 있습니다`;
    case "master":
      return "애기해녀부터 상군까지 모두 마치면 대상군이 열립니다";
    case "locked-advance":
      return `${hint.prevTitle}에서 ${hint.needWords}단어를 마치면 열립니다`;
    case "locked-master":
      return "애기해녀부터 상군까지 모두 마치면 열립니다";
  }
}

export function nextUnlockStatus(completedIds: string[]): string {
  for (let rankIndex = 1; rankIndex < RANKS.length; rankIndex += 1) {
    if (isRankOpen(rankIndex, completedIds)) continue;
    if (rankIndex === LAST_RANK_INDEX) {
      const remain = RANKS.slice(0, LAST_RANK_INDEX).reduce(
        (sum, _, index) => sum + (wordsInRank(index) - rankCompletedWords(index, completedIds)),
        0,
      );
      return `대상군까지 ${remain}단어`;
    }
    const remain = Math.max(0, RANK_ADVANCE_WORDS - rankCompletedWords(rankIndex - 1, completedIds));
    return `${RANKS[rankIndex]!.title}까지 ${remain}단어`;
  }
  return "대상군 마스터";
}

export function unitsInTrack(track: Track): Unit[] {
  return track.unitIds.map((id) => byId.get(id)).filter((unit): unit is Unit => Boolean(unit));
}

export function nextUnit(id: string): Unit | undefined {
  const unit = byId.get(id);
  if (!unit) return undefined;
  return units.find((u) => u.order === unit.order + 1);
}

export function formatUnitNumber(order: number): string {
  return String(order).padStart(2, "0");
}

export function formatTrackStep(unitId: string): string {
  const track = trackByUnit.get(unitId);
  if (!track) return "01";
  return String(track.unitIds.indexOf(unitId) + 1).padStart(2, "0");
}

export function progressPercent(doneCount: number): number {
  if (TOTAL_UNITS === 0) return 0;
  return Math.min(100, Math.round((doneCount / TOTAL_UNITS) * 100));
}

/** 유닛의 rankIndex(0-4, 해녀 등급) → Rank */
export function rankByIndex(rankIndex: number): Rank {
  return RANKS[Math.min(RANKS.length - 1, Math.max(0, rankIndex))]!;
}

export function rankFromPercent(percent: number): Rank {
  let current = RANKS[0]!;
  for (const rank of RANKS) {
    if (percent >= rank.minPercent) current = rank;
  }
  return current;
}

export function nextRank(percent: number): Rank | undefined {
  const current = rankFromPercent(percent);
  const index = RANKS.findIndex((rank) => rank.id === current.id);
  return RANKS[index + 1];
}

export function unitsToNextRank(doneCount: number): number {
  const following = nextRank(progressPercent(doneCount));
  if (!following) return 0;
  return Math.max(0, Math.ceil((following.minPercent / 100) * TOTAL_UNITS) - doneCount);
}
