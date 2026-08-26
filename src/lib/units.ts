import rawUnits from "@/data/units.json";

export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "pronoun"
  | "number"
  | "interjection";

export type Word = {
  seq: string;
  jeju: string;
  standard: string;
  soundUrl: string;
  partOfSpeech: PartOfSpeech;
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

export const RANKS: Rank[] = [
  { id: "baby", title: "애기해녀", subtitle: "이제 막 시작", minPercent: 0 },
  { id: "ha", title: "하군", subtitle: "기본기", minPercent: 20 },
  { id: "jung", title: "중군", subtitle: "일상 표현", minPercent: 40 },
  { id: "sang", title: "상군", subtitle: "자유롭게 구사", minPercent: 60 },
  { id: "dae", title: "대상군", subtitle: "제주어 마스터", minPercent: 80 },
];

export const TRACKS: Track[] = [
  { id: "people", title: "사람과 가족", unitIds: ["people-0", "people-1", "people-2", "people-3", "people-4", "people-5", "people-6", "people-7", "people-8", "people-9"] },
  { id: "talk", title: "말 걸기", unitIds: ["talk-0", "talk-1", "talk-2", "talk-3", "talk-4", "talk-5", "talk-6", "talk-7", "talk-8", "talk-9"] },
  { id: "body", title: "몸", unitIds: ["body-0", "body-1", "body-2", "body-3", "body-4", "body-5", "body-6", "body-7", "body-8", "body-9"] },
  { id: "food", title: "음식", unitIds: ["food-0", "food-1", "food-2", "food-3", "food-4", "food-5", "food-6", "food-7", "food-8", "food-9"] },
  { id: "verbs", title: "움직임", unitIds: ["verbs-0", "verbs-1", "verbs-2", "verbs-3", "verbs-4", "verbs-5", "verbs-6", "verbs-7", "verbs-8", "verbs-9"] },
  { id: "adj", title: "상태", unitIds: ["adj-0", "adj-1", "adj-2", "adj-3", "adj-4", "adj-5", "adj-6", "adj-7", "adj-8", "adj-9"] },
  { id: "home", title: "집과 살림", unitIds: ["home-0", "home-1", "home-2", "home-3", "home-4", "home-5", "home-6", "home-7", "home-8", "home-9"] },
  { id: "life", title: "때와 생활", unitIds: ["life-0", "life-1", "life-2", "life-3", "life-4", "life-5", "life-6", "life-7", "life-8", "life-9"] },
  { id: "animals", title: "동물", unitIds: ["animals-0", "animals-1", "animals-2", "animals-3", "animals-4", "animals-5", "animals-6", "animals-7", "animals-8", "animals-9"] },
  { id: "nature", title: "자연", unitIds: ["nature-0", "nature-1", "nature-2", "nature-3", "nature-4", "nature-5", "nature-6", "nature-7", "nature-8", "nature-9"] },
];

export const WAVE_COUNT = 10;
export const UNITS_PER_WAVE = 10;
export const WORDS_PER_WAVE = 100;
export const UNITS_PER_RANK = 20;
export const WORDS_PER_RANK = 200;
export const RANK_ADVANCE_UNITS = 12;
export const RANK_ADVANCE_WORDS = 120;
export const LAST_RANK_INDEX = RANKS.length - 1;

export function unitIdsInWave(waveIndex: number): string[] {
  return TRACKS.map((track) => track.unitIds[waveIndex]!);
}

export function unitsInWave(waveIndex: number): Unit[] {
  return unitIdsInWave(waveIndex)
    .map((id) => byId.get(id))
    .filter((unit): unit is Unit => Boolean(unit));
}

export function isWaveComplete(waveIndex: number, completedIds: string[]): boolean {
  return unitIdsInWave(waveIndex).every((id) => completedIds.includes(id));
}

export function openWaveIndex(completedIds: string[]): number {
  for (let wave = 0; wave < WAVE_COUNT; wave += 1) {
    if (!isWaveComplete(wave, completedIds)) return wave;
  }
  return WAVE_COUNT - 1;
}

export function rankIndexOfWave(waveIndex: number): number {
  return Math.min(RANKS.length - 1, Math.floor(waveIndex / 2));
}

export function unitIdsInRank(rankIndex: number): string[] {
  return [...unitIdsInWave(rankIndex * 2), ...unitIdsInWave(rankIndex * 2 + 1)];
}

export function unitsInRank(rankIndex: number): Unit[] {
  return unitIdsInRank(rankIndex)
    .map((id) => byId.get(id))
    .filter((unit): unit is Unit => Boolean(unit));
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
  return isRankOpen(rankIndexOfWave(unit.rankIndex), completedIds);
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
        haveWords: rankCompletedCount(index, completedIds) * 10,
        totalWords: WORDS_PER_RANK,
      })),
    };
  }
  if (!prev) return null;
  return {
    kind: "locked-advance",
    prevTitle: prev.title,
    haveWords: rankCompletedCount(rankIndex - 1, completedIds) * 10,
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
        (sum, _, index) => sum + (UNITS_PER_RANK - rankCompletedCount(index, completedIds)) * 10,
        0,
      );
      return `대상군까지 ${remain}단어`;
    }
    const remain = Math.max(0, RANK_ADVANCE_WORDS - rankCompletedCount(rankIndex - 1, completedIds) * 10);
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
  const ids = unitIdsInWave(unit.rankIndex);
  const index = ids.indexOf(id);
  const nextId = ids[index + 1];
  if (nextId) return byId.get(nextId);
  return byId.get(unitIdsInWave(unit.rankIndex + 1)[0] ?? "");
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

export function rankFromWave(waveIndex: number): Rank {
  return RANKS[Math.min(RANKS.length - 1, Math.floor(waveIndex / 2))]!;
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
