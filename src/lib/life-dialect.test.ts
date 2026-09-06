import assert from "node:assert/strict";
import { test } from "vitest";
import { adjacentPassageIds, buildInlineQuestions, getPassage, listPassages } from "./life-dialect";

test("파일럿 10편이 모두 로드된다", () => {
  assert.equal(listPassages().length, 10);
});

test("getPassage는 없는 id에 undefined를 준다", () => {
  assert.equal(getPassage("life-999"), undefined);
  assert.notEqual(getPassage("life-1"), undefined);
});

test("adjacentPassageIds는 목록 순서를 따른다", () => {
  const first = listPassages()[0]!;
  const { prevId, nextId } = adjacentPassageIds(first.id);
  assert.equal(prevId, null);
  assert.equal(nextId, listPassages()[1]!.id);
});

test("buildInlineQuestions는 정답을 보기 중 하나로 포함하고 오답을 지어내지 않는다", () => {
  for (const passage of listPassages()) {
    const questions = buildInlineQuestions(passage);
    assert.ok(questions.length > 0, `${passage.id}에 문항이 하나도 없음`);
    assert.ok(questions.length <= 3);
    const realTranslations = new Set(passage.sentences.map((s) => s.solutionEdited));
    for (const q of questions) {
      assert.ok(q.choices.includes(q.correctAnswer));
      assert.equal(new Set(q.choices).size, q.choices.length, "보기 중복");
      for (const choice of q.choices) {
        assert.ok(realTranslations.has(choice), `지어낸 보기: ${choice}`);
      }
    }
  }
});

test("buildInlineQuestions는 문장이 2개 미만이면 빈 배열을 준다", () => {
  const tiny = {
    id: "x",
    seq: "0",
    title: "t",
    category: "c",
    audioUrl: "/a.mp3",
    requiredInCurriculum: true,
    contentAdvisory: null,
    note: null,
    sentences: [
      { jeju: "j", archaic: "a", solutionOriginal: "s", solutionEdited: "s", editReason: null, wordLinks: [] },
    ],
  };
  assert.deepEqual(buildInlineQuestions(tiny), []);
});
