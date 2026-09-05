import assert from "node:assert/strict";
import { test } from "vitest";
import { cardDueAt, cardIsDue, DAY_MS, nextIntervalDays, REVIEW_LADDER, useProgress, type WrongCard } from "./progress";
import { units } from "./units";

function card(patch: Partial<WrongCard> = {}): WrongCard {
  return {
    seq: "1",
    unitId: "people-0",
    jeju: "느",
    standard: "너",
    soundUrl: "/audio/1.mp3",
    timesMissed: 1,
    addedAt: 0,
    lastReviewedAt: 0,
    intervalDays: 0,
    ...patch,
  };
}

test("nextIntervalDays walks the fixed ladder", () => {
  assert.equal(nextIntervalDays(0), 1);
  assert.equal(nextIntervalDays(1), 3);
  assert.equal(nextIntervalDays(3), 7);
  assert.equal(nextIntervalDays(7), 14);
  assert.equal(nextIntervalDays(14), 30);
  assert.equal(nextIntervalDays(30), 30);
});

test("a brand-new card (intervalDays 0) is always due", () => {
  assert.equal(cardIsDue(card({ intervalDays: 0, lastReviewedAt: Date.now() })), true);
});

test("a reviewed card is not due until its interval has actually passed", () => {
  const now = Date.now();
  const reviewed = card({ intervalDays: 1, lastReviewedAt: now });
  assert.equal(cardIsDue(reviewed, now), false, "should not be due immediately after review");
  assert.equal(cardIsDue(reviewed, now + DAY_MS - 1), false, "should not be due a moment before the interval ends");
  assert.equal(cardIsDue(reviewed, now + DAY_MS), true, "should be due once the interval has elapsed");
});

test("markRemembered does not skip to 30 days from repeated same-day clicks", () => {
  const word = units[0]!.words[0]!;
  useProgress.getState().resetProgress();
  useProgress.getState().addToNotebook(word, units[0]!.id);

  // 같은 순간(=같은 날) "기억나요"를 5번 눌러도 사다리를 한 번만 올라가야 한다.
  for (let i = 0; i < 5; i += 1) {
    useProgress.getState().markRemembered(word.seq);
  }

  const finalCard = useProgress.getState().wrongBySeq[word.seq]!;
  assert.equal(finalCard.intervalDays, REVIEW_LADDER[0], "repeated clicks on the same day must not jump the ladder");

  useProgress.getState().resetProgress();
});

test("markRemembered promotes the ladder once the card is actually due", () => {
  const word = units[0]!.words[1]!;
  useProgress.getState().resetProgress();
  useProgress.getState().addToNotebook(word, units[0]!.id);
  useProgress.getState().markRemembered(word.seq); // 0 -> 1일

  // 시간이 하루 넘게 흐른 뒤 다시 "기억나요"를 누르면 이번엔 승급해야 한다.
  const past = Date.now() - 2 * DAY_MS;
  useProgress.setState((state) => ({
    wrongBySeq: { ...state.wrongBySeq, [word.seq]: { ...state.wrongBySeq[word.seq]!, lastReviewedAt: past } },
  }));
  useProgress.getState().markRemembered(word.seq);

  const finalCard = useProgress.getState().wrongBySeq[word.seq]!;
  assert.equal(finalCard.intervalDays, REVIEW_LADDER[1], "a genuinely due card should advance to the next rung");

  useProgress.getState().resetProgress();
});

test("cardDueAt treats a never-reviewed card (intervalDays<=0) as immediately due", () => {
  assert.equal(cardDueAt(card({ intervalDays: 0 })), 0);
});
