import { TRACKS, isUnitUnlocked } from "@/lib/units";

export const STATS_KEEP_DAYS = 90;
export const STATS_CHART_DAYS = 14;

export type DailyStat = {
  date: string;
  wordsStudied: number;
  quizCorrect: number;
  quizTotal: number;
  reviewsForgot: number;
  reviewsRemembered: number;
};

export type TrackMastery = {
  id: string;
  title: string;
  completed: number;
  unlocked: number;
  percent: number | null;
};

export function localDateKey(now: Date = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function shiftLocalDateKey(key: string, days: number): string {
  const [year, month, day] = key.split("-").map(Number);
  return localDateKey(new Date(year!, month! - 1, day! + days));
}

export function emptyDailyStat(date: string): DailyStat {
  return {
    date,
    wordsStudied: 0,
    quizCorrect: 0,
    quizTotal: 0,
    reviewsForgot: 0,
    reviewsRemembered: 0,
  };
}

export function reviewsDone(stat: DailyStat): number {
  return stat.reviewsForgot + stat.reviewsRemembered;
}

export function dailyHasActivity(stat: DailyStat | undefined): boolean {
  if (!stat) return false;
  return stat.wordsStudied > 0 || stat.quizTotal > 0 || reviewsDone(stat) > 0;
}

export function patchDailyStat(
  dailyStats: Record<string, DailyStat>,
  patch: Partial<Omit<DailyStat, "date">>,
  now: Date = new Date(),
): Record<string, DailyStat> {
  const date = localDateKey(now);
  const current = dailyStats[date] ?? emptyDailyStat(date);
  const next: Record<string, DailyStat> = {
    ...dailyStats,
    [date]: {
      ...current,
      wordsStudied: current.wordsStudied + (patch.wordsStudied ?? 0),
      quizCorrect: current.quizCorrect + (patch.quizCorrect ?? 0),
      quizTotal: current.quizTotal + (patch.quizTotal ?? 0),
      reviewsForgot: current.reviewsForgot + (patch.reviewsForgot ?? 0),
      reviewsRemembered: current.reviewsRemembered + (patch.reviewsRemembered ?? 0),
    },
  };
  return pruneDailyStats(next, date);
}

export function pruneDailyStats(
  dailyStats: Record<string, DailyStat>,
  todayKey: string,
  keepDays = STATS_KEEP_DAYS,
): Record<string, DailyStat> {
  const cutoff = shiftLocalDateKey(todayKey, -(keepDays - 1));
  const next: Record<string, DailyStat> = {};
  for (const [key, value] of Object.entries(dailyStats)) {
    if (key >= cutoff) next[key] = value;
  }
  return next;
}

export function studyStreak(dailyStats: Record<string, DailyStat>, todayKey: string): number {
  let key = dailyHasActivity(dailyStats[todayKey]) ? todayKey : shiftLocalDateKey(todayKey, -1);
  let streak = 0;
  while (dailyHasActivity(dailyStats[key])) {
    streak += 1;
    key = shiftLocalDateKey(key, -1);
  }
  return streak;
}

export function dateKeysBack(todayKey: string, days: number): string[] {
  return Array.from({ length: days }, (_, index) => shiftLocalDateKey(todayKey, index - days + 1));
}

export function chartDays(dailyStats: Record<string, DailyStat>, todayKey: string, days = STATS_CHART_DAYS): DailyStat[] {
  return dateKeysBack(todayKey, days).map((key) => dailyStats[key] ?? emptyDailyStat(key));
}

export function chartHasActivity(days: DailyStat[]): boolean {
  return days.some((day) => dailyHasActivity(day));
}

export function quizAccuracy(stat: DailyStat): number | null {
  if (stat.quizTotal <= 0) return null;
  return Math.round((stat.quizCorrect / stat.quizTotal) * 100);
}

export function masteryPercent(completed: number, unlocked: number): number | null {
  if (unlocked <= 0) return null;
  return Math.round((completed / unlocked) * 100);
}

export function trackMastery(completedIds: string[]): TrackMastery[] {
  return TRACKS.map((track) => {
    const unlockedIds = track.unitIds.filter(
      (id) => completedIds.includes(id) || isUnitUnlocked(id, completedIds),
    );
    const completed = track.unitIds.filter((id) => completedIds.includes(id)).length;
    const unlocked = unlockedIds.length;
    return {
      id: track.id,
      title: track.title,
      completed,
      unlocked,
      percent: masteryPercent(completed, unlocked),
    };
  });
}
