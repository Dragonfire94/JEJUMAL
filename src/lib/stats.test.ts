import assert from "node:assert/strict";
import { test } from "vitest";
import {
  chartDays,
  dailyHasActivity,
  emptyDailyStat,
  localDateKey,
  masteryPercent,
  patchDailyStat,
  pruneDailyStats,
  quizAccuracy,
  shiftLocalDateKey,
  studyStreak,
  rankMastery,
  type DailyStat,
} from "./stats";
import { RANK_ADVANCE_UNITS, unitIdsInRank } from "./units";

function stat(date: string, patch: Partial<DailyStat> = {}): DailyStat {
  return { ...emptyDailyStat(date), ...patch, date };
}

test("localDateKey uses the local calendar, not UTC", () => {
  assert.equal(localDateKey(new Date(2026, 0, 1, 0, 5)), "2026-01-01");
  assert.equal(localDateKey(new Date(2026, 11, 31, 23, 59)), "2026-12-31");
});

test("shiftLocalDateKey crosses months and leap years", () => {
  assert.equal(shiftLocalDateKey("2026-03-01", -1), "2026-02-28");
  assert.equal(shiftLocalDateKey("2024-03-01", -1), "2024-02-29");
  assert.equal(shiftLocalDateKey("2026-12-31", 1), "2027-01-01");
});

test("studyStreak counts review-only days and does not break before today's session", () => {
  const days: Record<string, DailyStat> = {
    "2026-08-24": stat("2026-08-24", { wordsStudied: 10 }),
    "2026-08-25": stat("2026-08-25", { reviewsRemembered: 3 }),
  };
  assert.equal(studyStreak(days, "2026-08-26"), 2);
  assert.equal(studyStreak({ ...days, "2026-08-26": stat("2026-08-26", { quizTotal: 8, quizCorrect: 5 }) }, "2026-08-26"), 3);
});

test("studyStreak breaks on a gap", () => {
  const days: Record<string, DailyStat> = {
    "2026-08-23": stat("2026-08-23", { wordsStudied: 10 }),
    "2026-08-25": stat("2026-08-25", { wordsStudied: 10 }),
  };
  assert.equal(studyStreak(days, "2026-08-25"), 1);
});

test("quizAccuracy is null when nothing was answered", () => {
  assert.equal(quizAccuracy(stat("2026-08-26")), null);
  assert.equal(quizAccuracy(stat("2026-08-26", { quizCorrect: 7, quizTotal: 10 })), 70);
});

test("masteryPercent guards 0/0", () => {
  assert.equal(masteryPercent(0, 0), null);
  assert.equal(masteryPercent(1, 2), 50);
});

test("rankMastery reports each haenyeo rank against its own 200 words", () => {
  const empty = rankMastery([]);
  assert.equal(empty[0]?.id, "baby");
  assert.equal(empty[0]?.percent, 0);
  assert.equal(empty[0]?.open, true);
  assert.equal(empty[1]?.open, false);

  const twelve = rankMastery(unitIdsInRank(0).slice(0, RANK_ADVANCE_UNITS));
  const baby = twelve.find((item) => item.id === "baby")!;
  const ha = twelve.find((item) => item.id === "ha")!;
  assert.equal(baby.wordsDone, 120);
  assert.equal(baby.percent, 60);
  assert.equal(ha.open, true);
  assert.equal(ha.percent, 0);
});

test("pruneDailyStats drops rows older than 90 local days", () => {
  const kept = patchDailyStat({ "2026-01-01": stat("2026-01-01", { wordsStudied: 10 }) }, { wordsStudied: 10 }, new Date(2026, 7, 26));
  assert.equal(kept["2026-01-01"], undefined);
  assert.equal(kept["2026-08-26"]?.wordsStudied, 10);
  const pruned = pruneDailyStats({ "2026-05-29": stat("2026-05-29"), "2026-05-28": stat("2026-05-28") }, "2026-08-26");
  assert.ok(pruned["2026-05-29"]);
  assert.equal(pruned["2026-05-28"], undefined);
});

test("chartDays pads missing dates with zeros", () => {
  const days = chartDays({ "2026-08-26": stat("2026-08-26", { wordsStudied: 20 }) }, "2026-08-26", 3);
  assert.deepEqual(days.map((day) => day.date), ["2026-08-24", "2026-08-25", "2026-08-26"]);
  assert.equal(days[2]?.wordsStudied, 20);
  assert.equal(dailyHasActivity(days[0]), false);
});
