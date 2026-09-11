import assert from "node:assert/strict";
import { test } from "node:test";
import { runChecks } from "./qc-check.mjs";

function unit(id, words) {
  return { id, title: id, themeId: "test", rankIndex: 0, order: 1, words };
}

function word(seq, jeju, standard, standardExample, jejuExample = "테스트 문장이우다.") {
  return {
    seq,
    jeju,
    standard,
    partOfSpeech: "noun",
    soundUrl: `/audio/${seq}.mp3`,
    examples: [{ jeju: jejuExample, standard: standardExample }],
  };
}

function findingsFor(ruleId, units) {
  return runChecks(units).filter((f) => f.id === ruleId);
}

test("a fully well-formed unit produces no findings", () => {
  // 정상 데이터에는 각 규칙이 조용해야 한다 (아래 개별 테스트가 실제로 규칙이
  // 동작하는지 위반 사례로 확인한다). UNIT_SIZE를 피하려면 10단어가 있어야 하고,
  // ENDING_DIVERSITY_PER_UNIT을 피하려면 종결어미가 다양해야 한다.
  const endings = ["마씸.", "수다.", "우다.", "읍주.", "읍서."];
  const words = Array.from({ length: 10 }, (_, i) =>
    word(String(i + 1), `제주어${i}`, `표준어${i}`, `표준어${i}는 좋아요.`, `제주어${i}는 좋아${endings[i % endings.length]}`),
  );
  const clean = [unit("u1", words)];
  assert.equal(runChecks(clean).length, 0);
});

test("DUPLICATE_SEQ fires when two words share a seq", () => {
  const units = [unit("u1", [word("1", "느", "너", "너는 밥을 먹었어요."), word("1", "거", "그것", "그것을 주세요.")])];
  assert.ok(findingsFor("DUPLICATE_SEQ", units).length > 0);
});

test("UNIT_SIZE fires when a unit does not have exactly 10 words", () => {
  const units = [unit("u1", [word("1", "느", "너", "너는 밥을 먹었어요.")])];
  assert.ok(findingsFor("UNIT_SIZE", units).length > 0);
});

test("POLITE_ENDING fires on a bare dictionary citation form", () => {
  const units = [unit("u1", [word("1", "느", "너", "이것은 너다.")])];
  assert.ok(findingsFor("POLITE_ENDING", units).length > 0);
});

test("POLITE_ENDING does not flag a proper -습니다 ending", () => {
  const units = [unit("u1", [word("1", "느", "너", "이것은 너입니다.")])];
  assert.equal(findingsFor("POLITE_ENDING", units).length, 0);
});

test("NO_FORMATTING_ARTIFACTS catches double spaces and missing terminal punctuation", () => {
  const units = [unit("u1", [word("1", "느", "너", "너는  밥을 먹었어요")])];
  assert.ok(findingsFor("NO_FORMATTING_ARTIFACTS", units).length > 0);
});

test("NO_FORMATTING_ARTIFACTS catches leftover scrape markers in the standard field", () => {
  const units = [unit("u1", [word("1", "느", "=너", "너는 밥을 먹었어요.")])];
  assert.ok(findingsFor("NO_FORMATTING_ARTIFACTS", units).length > 0);
});

test("PARTICLE_AGREEMENT fires only right after the headword's own gloss, not on unrelated syllables", () => {
  // "마을"(받침 없음)에 붙어야 할 조사는 "을"인데 "를"이 붙은 경우
  const bad = [unit("u1", [word("1", "가름", "마을", "저 마을를 지나갔어요.")])];
  assert.ok(findingsFor("PARTICLE_AGREEMENT", bad).length > 0);

  // 흔한 오탐 유형: "있는"(용언 활용, 조사 아님), "장가"(고유어) 는 걸리면 안 된다
  const safe = [
    unit("u1", [
      word("1", "빈복다리", "복점 있는 사람", "점이 있는 이를 복점 있는 사람이라고 불렀어요."),
      word("2", "장게", "장가", "장가 가는 사람이 많아요."),
    ]),
  ];
  assert.equal(findingsFor("PARTICLE_AGREEMENT", safe).length, 0);
});

test("NO_EXACT_DUPLICATE_EXAMPLES fires when two different words reuse the same example text", () => {
  const units = [
    unit("u1", [
      word("1", "느", "너", "너는 밥을 먹었어요."),
      word("2", "거", "그것", "너는 밥을 먹었어요."),
    ]),
  ];
  assert.ok(findingsFor("NO_EXACT_DUPLICATE_EXAMPLES", units).length > 0);
});

test("NO_ADJACENT_WORD_DUPLICATION fires when the headword is echoed twice in a row", () => {
  const units = [unit("u1", [word("1", "지붕", "지붕", "지붕 지붕의 경사가 가파르네요.", "지붕 지붕이 왕방지우다.")])];
  assert.ok(findingsFor("NO_ADJACENT_WORD_DUPLICATION", units).length > 0);
});

test("ENDING_DIVERSITY_PER_UNIT warns when a unit uses two or fewer sentence endings", () => {
  const words = Array.from({ length: 10 }, (_, i) => word(String(i), "느", "너", "너는 좋아요.", "느는 좋아마씸."));
  const units = [unit("u1", words)];
  assert.ok(findingsFor("ENDING_DIVERSITY_PER_UNIT", units).length > 0);
});
