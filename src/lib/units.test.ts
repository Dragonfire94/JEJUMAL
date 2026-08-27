import assert from "node:assert/strict";
import { test } from "vitest";
import {
  LAST_RANK_INDEX,
  RANK_ADVANCE_UNITS,
  currentRank,
  isRankOpen,
  isUnitUnlocked,
  nextUnlockStatus,
  rankUnlockHint,
  unitIdsInRank,
  units,
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
  const master = rankUnlockHint(LAST_RANK_INDEX, twelve);
  assert.equal(master?.kind, "locked-master");
  if (master?.kind === "locked-master") {
    assert.equal(master.ranks[0]?.haveWords, 120);
    assert.equal(master.ranks[1]?.haveWords, 0);
  }
  assert.deepEqual(rankUnlockHint(3, twelve), {
    kind: "locked-advance",
    prevTitle: "중군",
    haveWords: 0,
    needWords: 120,
  });
});

test("status line uses 120 words to the next open rank, not 200", () => {
  assert.equal(nextUnlockStatus([]), "하군까지 120단어");
  assert.equal(nextUnlockStatus(firstN(0, 4)), "하군까지 80단어");
  assert.equal(nextUnlockStatus(firstN(0, RANK_ADVANCE_UNITS)), "중군까지 120단어");
  const almostMaster = [0, 1, 2, 3].flatMap((rank) => unitIdsInRank(rank));
  almostMaster.pop();
  assert.equal(nextUnlockStatus(almostMaster), "대상군까지 10단어");
  assert.equal(nextUnlockStatus([0, 1, 2, 3, 4].flatMap((rank) => unitIdsInRank(rank))), "대상군 마스터");
});

test("title follows the highest open rank, not overall percent", () => {
  assert.equal(currentRank([]).id, "baby");
  assert.equal(currentRank(firstN(0, RANK_ADVANCE_UNITS)).id, "ha");
  assert.equal(currentRank([...firstN(0, RANK_ADVANCE_UNITS), ...firstN(1, RANK_ADVANCE_UNITS)]).id, "jung");
  const skipped = [0, 1, 2, 3].flatMap((rank) => firstN(rank, RANK_ADVANCE_UNITS));
  assert.equal(currentRank(skipped).id, "sang");
  assert.equal(currentRank([0, 1, 2, 3].flatMap((rank) => unitIdsInRank(rank))).id, "dae");
});

test("spoken examples only attach to real words and stay short", () => {
  const seqs = new Set(units.flatMap((unit) => unit.words.map((word) => word.seq)));
  let count = 0;
  for (const unit of units) {
    for (const word of unit.words) {
      for (const example of word.examples ?? []) {
        count += 1;
        assert.equal(seqs.has(word.seq), true);
        assert.ok(example.jeju.length >= 4 && example.jeju.length <= 80);
        assert.ok(example.standard.length >= 2);
        assert.equal(/x{2,}/i.test(example.jeju), false);
        assert.equal(/x{2,}/i.test(example.standard), false);
        assert.equal(/란 말|라는 뜻/.test(example.jeju), false);
      }
    }
  }
  assert.ok(count >= 900);
});

test("spoken examples are not dictionary glosses or cut-off fragments", () => {
  const texts = units.flatMap((unit) =>
    unit.words.flatMap((word) => (word.examples ?? []).map((example) => example.jeju)),
  );
  assert.equal(texts.some((text) => text.startsWith("봉그다.")), false);
  assert.equal(texts.some((text) => /갑자기 막 어$/.test(text)), false);
  assert.equal(texts.some((text) => /^이거 .+우다/.test(text)), false);
  assert.equal(texts.some((text) => /응 줍다 봉그다/.test(text)), false);
});

test("homographs keep the dictionary meaning", () => {
  const byJeju = new Map(units.flatMap((unit) => unit.words.map((word) => [word.jeju, word])));
  const flower = byJeju.get("고장")?.examples ?? [];
  assert.ok(flower.some((example) => example.standard.includes("꽃")));
  const shop = byJeju.get("절간")?.examples ?? [];
  assert.ok(shop.some((example) => example.standard.includes("가게")));
  const cause = byJeju.get("시기다")?.examples ?? [];
  assert.ok(cause.some((example) => example.standard.includes("시키")));
});

test("clean examples cover every word and stay readable", () => {
  const byJeju = new Map(units.flatMap((unit) => unit.words.map((word) => [word.jeju, word])));
  assert.equal(units.every((unit) => unit.words.every((word) => (word.examples?.length ?? 0) >= 1)), true);

  const wife = byJeju.get("각씨")?.examples ?? [];
  assert.ok(wife.some((example) => example.jeju.includes("각씨") && example.jeju.includes("정지") && example.standard.includes("아내")));
  const much = byJeju.get("하영")?.examples ?? [];
  assert.ok(much.some((example) => example.jeju.includes("하영") && example.standard.includes("많이")));
  assert.equal(much.some((example) => /드르쓰|마시/.test(example.jeju)), true);
  assert.equal(much.some((example) => example.jeju.includes("대변")), false);

  const father = byJeju.get("아방")?.examples ?? [];
  assert.ok(father.some((example) => example.jeju.includes("짓") && example.standard.includes("집")));
  const come = byJeju.get("옵서")?.examples ?? [];
  assert.ok(come.some((example) => example.jeju.includes("옵서") && example.jeju.includes("앚읍서") && !example.jeju.includes("일희")));

  for (const unit of units) {
    for (const word of unit.words) {
      if (word.partOfSpeech !== "noun" && word.partOfSpeech !== "pronoun") continue;
      const jeju = word.examples?.[0]?.jeju ?? "";
      assert.equal(jeju.includes(word.jeju), true, `${word.jeju} ${jeju}`);
    }
  }

  const texts = units.flatMap((unit) =>
    unit.words.flatMap((word) => (word.examples ?? []).map((example) => example.jeju)),
  );
  assert.equal(texts.some((text) => /기\?/.test(text)), false);
  assert.equal(texts.some((text) => /대변/.test(text)), false);
  assert.equal(new Set(texts).size, texts.length);
});

test("example jeju lines convert the whole sentence", () => {
  for (const unit of units) {
    for (const word of unit.words) {
      const jeju = word.examples?.[0]?.jeju ?? "";
      if (word.jeju !== "짓") {
        assert.equal(/집에서/.test(jeju), false, jeju);
      }
      assert.equal(jeju.includes("부엌"), false, jeju);
      if (word.jeju !== "질") {
        assert.equal(/길을/.test(jeju), false, jeju);
      }
      if (word.jeju !== "경") {
        assert.equal(jeju.includes("그렇게"), false, jeju);
      }
      for (const token of jeju.match(/[가-힣]+/g) ?? []) {
        if (token === word.jeju) continue;
        assert.equal(token.endsWith("요"), false, `${word.jeju} ${jeju}`);
      }
    }
  }
});

test("examples stay Jeju and skip empty templates", () => {
  const texts = units.flatMap((unit) =>
    unit.words.flatMap((word) => (word.examples ?? []).map((example) => `${example.jeju}\n${example.standard}`)),
  );
  assert.equal(texts.some((text) => text.includes("마씸")), false);
  assert.equal(texts.some((text) => /잘 몰라|처음 들어봤|뭔지 궁금|대해 이야기/.test(text)), false);
  assert.equal(texts.some((text) => /손주 공책/.test(text)), false);
  assert.equal(texts.some((text) => /그 말을 써/.test(text)), false);
});
