import assert from "node:assert/strict";
import { test } from "node:test";
import {
  LAST_RANK_INDEX,
  RANK_ADVANCE_UNITS,
  isRankOpen,
  isUnitUnlocked,
  rankUnlockHint,
  unitIdsInRank,
} from "./units";

function firstN(rankIndex: number, count: number): string[] {
  return unitIdsInRank(rankIndex).slice(0, count);
}

test("baby rank is open from the start, 하군 is not", () => {
  assert.equal(isRankOpen(0, []), true);
  assert.equal(isRankOpen(1, []), false);
  assert.equal(isUnitUnlocked("people-0", []), true);
  assert.equal(isUnitUnlocked("people-2", []), false);
});

test("120 words in 애기해녀 opens 하군, not 중군 or 대상군", () => {
  const done = firstN(0, RANK_ADVANCE_UNITS);
  assert.equal(isRankOpen(1, done), true);
  assert.equal(isRankOpen(2, done), false);
  assert.equal(isRankOpen(LAST_RANK_INDEX, done), false);
  assert.equal(isUnitUnlocked("people-2", done), true);
  assert.equal(isUnitUnlocked("people-4", done), false);
});

test("대상군 stays locked until the first four ranks are fully cleared", () => {
  const skipped = [0, 1, 2, 3].flatMap((rank) => firstN(rank, RANK_ADVANCE_UNITS));
  assert.equal(isRankOpen(3, skipped), true);
  assert.equal(isRankOpen(LAST_RANK_INDEX, skipped), false);

  const cleared = [0, 1, 2, 3].flatMap((rank) => unitIdsInRank(rank));
  assert.equal(isRankOpen(LAST_RANK_INDEX, cleared), true);
  assert.equal(isUnitUnlocked("people-8", cleared), true);
});

test("unlock copy counts remaining words to 120, then names 대상군 as a full clear", () => {
  const eleven = firstN(0, RANK_ADVANCE_UNITS - 1);
  assert.deepEqual(rankUnlockHint(0, eleven), { kind: "advance", remainWords: 10, nextTitle: "하군" });
  const twelve = firstN(0, RANK_ADVANCE_UNITS);
  assert.deepEqual(rankUnlockHint(0, twelve), { kind: "opened", nextTitle: "하군" });
  assert.deepEqual(rankUnlockHint(LAST_RANK_INDEX, twelve), { kind: "locked-master" });
  assert.deepEqual(rankUnlockHint(3, twelve), { kind: "locked-advance", prevTitle: "중군" });
});
