import assert from "node:assert/strict";
import { test } from "vitest";
import { buildLesson, hasPassed, PASS_PERCENT } from "./quiz";
import { units } from "./units";

test("every unit produces a non-empty lesson with well-formed questions", () => {
  for (const unit of units) {
    const questions = buildLesson(unit);
    assert.ok(questions.length > 0, `${unit.id} produced no questions`);
    for (const q of questions) {
      assert.ok(q.choices.includes(q.answer), `${q.id} choices missing the answer`);
      assert.equal(new Set(q.choices).size, q.choices.length, `${q.id} has duplicate choice text`);
      assert.ok(q.choices.length >= 2 && q.choices.length <= 4, `${q.id} has ${q.choices.length} choices`);
    }
  }
});

test("no listen question is generated for a word without audio", () => {
  for (const unit of units) {
    const questions = buildLesson(unit);
    for (const q of questions) {
      if (q.kind === "listen") {
        assert.notEqual(q.word.hasAudio, false, `${q.id} is a listen question for a word with no audio`);
      }
    }
  }
});

test("blocked words never appear in a lesson", () => {
  for (const unit of units) {
    const questions = buildLesson(unit);
    for (const q of questions) {
      assert.notEqual(q.word.reviewStatus, "blocked", `${q.id} quizzes a blocked word`);
    }
  }
});

test("read questions never offer a synonym of the correct answer as a wrong choice", () => {
  // 여러 단어가 같은 표준어 뜻(동의어)을 가질 때, "제주말로 하면?" 문제의 오답 보기에
  // 정답과 같은 뜻을 가진 다른 제주어 단어가 섞여 들어가면 실제로는 두 개가 다 정답이 된다.
  // 이런 복수 정답 상황이 생기지 않는지 여러 번 반복 생성해 확인한다.
  let checked = 0;
  for (let round = 0; round < 3; round += 1) {
    for (const unit of units) {
      const questions = buildLesson(unit);
      for (const q of questions) {
        if (q.kind !== "read") continue;
        checked += 1;
        const synonyms = units
          .flatMap((u) => u.words)
          .filter((w) => w.seq !== q.word.seq && w.standard.trim() === q.word.standard.trim())
          .map((w) => w.jeju);
        for (const choice of q.choices) {
          if (choice === q.answer) continue;
          assert.ok(
            !synonyms.includes(choice),
            `${q.id}: choice "${choice}" means the same as the answer "${q.answer}" (${q.word.standard})`,
          );
        }
      }
    }
  }
  assert.ok(checked > 1000, "sanity check: should have checked a large number of read questions");
}, 20000);

test("hasPassed uses the documented pass percentage", () => {
  assert.equal(hasPassed(14, 20), true);
  assert.equal(hasPassed(13, 20), false);
  assert.equal(PASS_PERCENT, 70);
  assert.equal(hasPassed(0, 0), false);
});
