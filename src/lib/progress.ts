import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { nextUnit, openRankIndex, isUnitUnlocked, TRACKS, unitIdsInRank, units, getUnit, type Word } from "@/lib/units";
import { patchDailyStat, type DailyStat } from "@/lib/stats";

export const DAY_MS = 86_400_000;
export const REVIEW_LADDER = [1, 3, 7, 14, 30] as const;

export type WrongCard = {
  seq: string;
  unitId: string;
  jeju: string;
  standard: string;
  soundUrl: string;
  timesMissed: number;
  addedAt: number;
  lastReviewedAt: number;
  intervalDays: number;
};

type PersistedProgress = {
  completedUnitIds: string[];
  lastPlayedUnitId: string | null;
  wrongBySeq: Record<string, WrongCard>;
  dailyStats: Record<string, DailyStat>;
};

type ProgressState = {
  hydrated: boolean;
  completedUnitIds: string[];
  lastPlayedUnitId: string | null;
  wrongBySeq: Record<string, WrongCard>;
  dailyStats: Record<string, DailyStat>;
  markHydrated: () => void;
  isUnlocked: (unitId: string) => boolean;
  isComplete: (unitId: string) => boolean;
  completeUnit: (unitId: string) => void;
  touchUnit: (unitId: string) => void;
  recordQuiz: (correct: number, total: number) => void;
  addToNotebook: (word: Word, unitId: string) => void;
  markForgot: (seq: string) => void;
  markRemembered: (seq: string) => void;
  dismissWrong: (seq: string) => void;
  wrongCards: () => WrongCard[];
  wrongCount: () => number;
  continueUnitId: () => string;
};

const memory: Record<string, string> = {};

function localStorageOrNull(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    const storage = window.localStorage;
    const probe = "__jeju_mal_probe";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

const safeStorage: StateStorage = {
  getItem: (name) => {
    try {
      const storage = localStorageOrNull();
      if (storage) return storage.getItem(name);
    } catch {
      /* preview iframes can block storage */
    }
    return memory[name] ?? null;
  },
  setItem: (name, value) => {
    memory[name] = value;
    try {
      localStorageOrNull()?.setItem(name, value);
    } catch {
      /* keep memory copy */
    }
  },
  removeItem: (name) => {
    delete memory[name];
    try {
      localStorageOrNull()?.removeItem(name);
    } catch {
      /* ignore */
    }
  },
};

export function nextIntervalDays(current: number): number {
  if (current <= 0) return REVIEW_LADDER[0];
  const next = REVIEW_LADDER.find((day) => day > current);
  return next ?? REVIEW_LADDER[REVIEW_LADDER.length - 1];
}

export function cardDueAt(card: WrongCard): number {
  if (card.intervalDays <= 0) return 0;
  return (card.lastReviewedAt || 0) + card.intervalDays * DAY_MS;
}

export function cardIsDue(card: WrongCard, now = Date.now()): boolean {
  return cardDueAt(card) <= now;
}

export function sortWrongCards(wrongBySeq: Record<string, WrongCard>, now = Date.now()): WrongCard[] {
  return Object.values(wrongBySeq).sort((a, b) => {
    const dueA = cardIsDue(a, now);
    const dueB = cardIsDue(b, now);
    if (dueA !== dueB) return dueA ? -1 : 1;
    if (dueA) {
      const reviewedA = a.lastReviewedAt || 0;
      const reviewedB = b.lastReviewedAt || 0;
      if (reviewedA !== reviewedB) return reviewedA - reviewedB;
      if (b.timesMissed !== a.timesMissed) return b.timesMissed - a.timesMissed;
      return a.addedAt - b.addedAt;
    }
    const nextA = cardDueAt(a);
    const nextB = cardDueAt(b);
    if (nextA !== nextB) return nextA - nextB;
    return b.timesMissed - a.timesMissed;
  });
}

function patchCard(wrongBySeq: Record<string, WrongCard>, seq: string, patch: Partial<WrongCard>) {
  const current = wrongBySeq[seq];
  if (!current) return wrongBySeq;
  return { ...wrongBySeq, [seq]: { ...current, ...patch } };
}

function migrateProgress(persisted: unknown, version: number): PersistedProgress {
  const state = (persisted ?? {}) as Partial<PersistedProgress>;
  const source = state.wrongBySeq ?? {};
  const wrongBySeq: Record<string, WrongCard> = {};
  for (const [seq, card] of Object.entries(source)) {
    wrongBySeq[seq] = {
      ...card,
      lastReviewedAt: version >= 3 ? (card.lastReviewedAt ?? 0) : 0,
      intervalDays: version >= 3 ? (card.intervalDays ?? 0) : 0,
    };
  }
  return {
    completedUnitIds: state.completedUnitIds ?? [],
    lastPlayedUnitId: state.lastPlayedUnitId ?? null,
    wrongBySeq,
    dailyStats: version >= 4 ? (state.dailyStats ?? {}) : {},
  };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      hydrated: true,
      completedUnitIds: [],
      lastPlayedUnitId: null,
      wrongBySeq: {},
      dailyStats: {},
      markHydrated: () => set({ hydrated: true }),
      isComplete: (unitId) => get().completedUnitIds.includes(unitId),
      isUnlocked: (unitId) =>
        get().completedUnitIds.includes(unitId) || isUnitUnlocked(unitId, get().completedUnitIds),
      completeUnit: (unitId) =>
        set((state) => {
          if (state.completedUnitIds.includes(unitId)) {
            return { lastPlayedUnitId: unitId };
          }
          const words = getUnit(unitId)?.words.length ?? 10;
          return {
            lastPlayedUnitId: unitId,
            completedUnitIds: [...state.completedUnitIds, unitId],
            dailyStats: patchDailyStat(state.dailyStats, { wordsStudied: words }),
          };
        }),
      touchUnit: (unitId) => set({ lastPlayedUnitId: unitId }),
      recordQuiz: (correct, total) =>
        set((state) => ({
          dailyStats: patchDailyStat(state.dailyStats, { quizCorrect: correct, quizTotal: total }),
        })),
      addToNotebook: (word, unitId) =>
        set((state) => {
          const current = state.wrongBySeq[word.seq];
          return {
            lastPlayedUnitId: unitId,
            wrongBySeq: {
              ...state.wrongBySeq,
              [word.seq]: {
                seq: word.seq,
                unitId,
                jeju: word.jeju,
                standard: word.standard,
                soundUrl: word.soundUrl,
                timesMissed: current ? current.timesMissed + 1 : 1,
                addedAt: current?.addedAt ?? Date.now(),
                lastReviewedAt: current?.lastReviewedAt ?? 0,
                intervalDays: 0,
              },
            },
          };
        }),
      markForgot: (seq) =>
        set((state) => {
          if (!state.wrongBySeq[seq]) return state;
          return {
            wrongBySeq: patchCard(state.wrongBySeq, seq, {
              timesMissed: (state.wrongBySeq[seq]?.timesMissed ?? 1) + 1,
              lastReviewedAt: Date.now(),
              intervalDays: 0,
            }),
            dailyStats: patchDailyStat(state.dailyStats, { reviewsForgot: 1 }),
          };
        }),
      markRemembered: (seq) =>
        set((state) => {
          const current = state.wrongBySeq[seq];
          if (!current) return state;
          return {
            wrongBySeq: patchCard(state.wrongBySeq, seq, {
              lastReviewedAt: Date.now(),
              intervalDays: nextIntervalDays(current.intervalDays),
            }),
            dailyStats: patchDailyStat(state.dailyStats, { reviewsRemembered: 1 }),
          };
        }),
      dismissWrong: (seq) =>
        set((state) => {
          const next = { ...state.wrongBySeq };
          delete next[seq];
          return { wrongBySeq: next };
        }),
      wrongCards: () => sortWrongCards(get().wrongBySeq),
      wrongCount: () => Object.keys(get().wrongBySeq).length,
      continueUnitId: () => {
        const { lastPlayedUnitId, completedUnitIds } = get();
        const open = (id: string) => !completedUnitIds.includes(id) && get().isUnlocked(id);
        if (lastPlayedUnitId && open(lastPlayedUnitId)) return lastPlayedUnitId;
        if (lastPlayedUnitId) {
          const following = nextUnit(lastPlayedUnitId);
          if (following && open(following.id)) return following.id;
        }
        const rankIndex = openRankIndex(completedUnitIds);
        for (const id of unitIdsInRank(rankIndex)) {
          if (open(id)) return id;
        }
        for (const track of TRACKS) {
          for (const id of track.unitIds) {
            if (open(id)) return id;
          }
        }
        return units[0]!.id;
      },
    }),
    {
      name: "jeju-mal:v2",
      version: 4,
      skipHydration: true,
      storage: createJSONStorage(() => safeStorage),
      migrate: migrateProgress,
      partialize: (state) => ({
        completedUnitIds: state.completedUnitIds,
        lastPlayedUnitId: state.lastPlayedUnitId,
        wrongBySeq: state.wrongBySeq,
        dailyStats: state.dailyStats,
      }),
    },
  ),
);

export function hydrateProgress() {
  try {
    const rehydrate = useProgress.persist?.rehydrate;
    if (!rehydrate) {
      useProgress.getState().markHydrated();
      return;
    }
    void Promise.resolve(rehydrate()).finally(() => {
      useProgress.getState().markHydrated();
    });
  } catch {
    useProgress.getState().markHydrated();
  }
}
