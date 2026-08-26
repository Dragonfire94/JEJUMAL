import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { nextUnit, openRankIndex, TRACKS, unitIdsInRank, units, type Word } from "@/lib/units";

export type WrongCard = {
  seq: string;
  unitId: string;
  jeju: string;
  standard: string;
  soundUrl: string;
  timesMissed: number;
  addedAt: number;
};

type ProgressState = {
  hydrated: boolean;
  completedUnitIds: string[];
  lastPlayedUnitId: string | null;
  wrongBySeq: Record<string, WrongCard>;
  markHydrated: () => void;
  isUnlocked: (unitId: string) => boolean;
  isComplete: (unitId: string) => boolean;
  completeUnit: (unitId: string) => void;
  recordMiss: (word: Word, unitId: string) => void;
  addToNotebook: (word: Word, unitId: string) => void;
  recordHit: (seq: string) => void;
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

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      hydrated: true,
      completedUnitIds: [],
      lastPlayedUnitId: null,
      wrongBySeq: {},
      markHydrated: () => set({ hydrated: true }),
      isComplete: (unitId) => get().completedUnitIds.includes(unitId),
      isUnlocked: () => true,
      completeUnit: (unitId) =>
        set((state) => ({
          lastPlayedUnitId: unitId,
          completedUnitIds: state.completedUnitIds.includes(unitId)
            ? state.completedUnitIds
            : [...state.completedUnitIds, unitId],
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
              },
            },
          };
        }),
      recordMiss: (word, unitId) => get().addToNotebook(word, unitId),
      recordHit: () => undefined,
      dismissWrong: (seq) =>
        set((state) => {
          const next = { ...state.wrongBySeq };
          delete next[seq];
          return { wrongBySeq: next };
        }),
      wrongCards: () =>
        Object.values(get().wrongBySeq).sort((a, b) => b.addedAt - a.addedAt),
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
      skipHydration: true,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        completedUnitIds: state.completedUnitIds,
        lastPlayedUnitId: state.lastPlayedUnitId,
        wrongBySeq: state.wrongBySeq,
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
