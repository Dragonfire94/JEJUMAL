import assert from "node:assert/strict";
import { test } from "vitest";
import { buildLesson, lessonQuestionCounts } from "./quiz";
import { units } from "./units";

test("read questions skip words whose 제주어 표기 is nearly identical to 표준어", () => {
  // verbs-2 has several jeju verb stems that are one letter off from standard
  // Korean (몰르다/모르다, 냉기다/남기다 …) — those must not appear as 읽기 문제,
  // since the correct answer would visually give itself away next to the prompt.
  const unit = units.find((item) => item.id === "verbs-2")!;
  const counts = lessonQuestionCounts(unit);
  assert.equal(counts.listen, unit.words.length);
  assert.ok(counts.read < unit.words.length, "too-similar words should be excluded from 읽기");

  const lesson = buildLesson(unit);
  const readAnswers = lesson.filter((q) => q.kind === "read").map((q) => q.word.seq);
  assert.equal(readAnswers.length, counts.read);
  assert.equal(new Set(readAnswers).size, readAnswers.length);
});

test("listen questions still cover every word, including too-similar pairs", () => {
  const unit = units.find((item) => item.id === "verbs-2")!;
  const lesson = buildLesson(unit);
  const listenAnswers = lesson.filter((q) => q.kind === "listen").map((q) => q.word.seq);
  assert.equal(listenAnswers.length, unit.words.length);
  assert.equal(new Set(listenAnswers).size, unit.words.length);
});

test("every generated question has 4 unique choices including the answer", () => {
  for (const unit of units.slice(0, 12)) {
    const lesson = buildLesson(unit);
    for (const question of lesson) {
      assert.equal(question.choices.length, 4, `${unit.id} ${question.id}`);
      assert.equal(new Set(question.choices).size, 4, `${unit.id} ${question.id} has duplicate choices`);
      assert.ok(question.choices.includes(question.answer), `${unit.id} ${question.id} missing correct answer`);
    }
  }
});
