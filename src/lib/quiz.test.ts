import assert from "node:assert/strict";
import { test } from "vitest";
import { buildLesson, conceptKeyForWord, displayMeaningFor, getLessonQuestionCounts, hasPassed, PASS_PERCENT } from "./quiz";
import { units, type Unit, type Word } from "./units";

function fakeWord(patch: Partial<Word> & Pick<Word, "seq">): Word {
  return {
    jeju: `제주${patch.seq}`,
    standard: `표준${patch.seq}`,
    soundUrl: `/audio/${patch.seq}.mp3`,
    partOfSpeech: "noun",
    ...patch,
  };
}

function fakeUnit(words: Word[]): Unit {
  return { id: "test-0", title: "테스트", themeId: "test", rankIndex: 0, order: 1, words };
}

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
          .filter((w) => w.seq !== q.word.seq && conceptKeyForWord(w) === conceptKeyForWord(q.word))
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

test("getLessonQuestionCounts: mixed audio counts listen 1 / read 3", () => {
  const unit = fakeUnit([
    fakeWord({ seq: "1", hasAudio: true }),
    fakeWord({ seq: "2", hasAudio: false }),
    fakeWord({ seq: "3", hasAudio: false }),
  ]);
  assert.deepEqual(getLessonQuestionCounts(unit), { listen: 1, read: 3, total: 4 });
});

test("getLessonQuestionCounts: zero audio counts listen 0 / read 2", () => {
  const unit = fakeUnit([fakeWord({ seq: "1", hasAudio: false }), fakeWord({ seq: "2", hasAudio: false })]);
  assert.deepEqual(getLessonQuestionCounts(unit), { listen: 0, read: 2, total: 2 });
});

test("getLessonQuestionCounts: blocked words are excluded from listen and read", () => {
  const unit = fakeUnit([
    fakeWord({ seq: "1", hasAudio: true, reviewStatus: "blocked" }),
    fakeWord({ seq: "2", hasAudio: false, reviewStatus: "blocked" }),
    fakeWord({ seq: "3", hasAudio: true }),
    fakeWord({ seq: "4", hasAudio: false }),
    fakeWord({ seq: "5" }),
  ]);
  // hasAudio 생략은 hasAudio !== false 이므로 듣기 대상.
  assert.deepEqual(getLessonQuestionCounts(unit), { listen: 2, read: 3, total: 5 });
});

test("getLessonQuestionCounts matches buildLesson kind counts for every unit", () => {
  for (const unit of units) {
    const counts = getLessonQuestionCounts(unit);
    const questions = buildLesson(unit);
    const listen = questions.filter((q) => q.kind === "listen").length;
    const read = questions.filter((q) => q.kind === "read").length;
    assert.equal(counts.listen, listen, `${unit.id} listen count drifted from buildLesson`);
    assert.equal(counts.read, read, `${unit.id} read count drifted from buildLesson`);
    assert.equal(counts.total, questions.length, `${unit.id} total drifted from buildLesson`);
  }
});

test("getLessonQuestionCounts matches buildLesson kind counts for synthetic units", () => {
  const mixed = fakeUnit([
    fakeWord({ seq: "s1", hasAudio: true, jeju: "혼저", standard: "어서" }),
    fakeWord({ seq: "s2", hasAudio: false, jeju: "바당", standard: "바다" }),
    fakeWord({ seq: "s3", hasAudio: false, jeju: "하르방", standard: "할아버지" }),
    fakeWord({ seq: "s4", reviewStatus: "blocked", hasAudio: true, jeju: "숨김", standard: "숨은말" }),
  ]);
  const counts = getLessonQuestionCounts(mixed);
  const questions = buildLesson(mixed);
  assert.equal(counts.listen, 1);
  assert.equal(counts.read, 3);
  assert.equal(
    questions.filter((q) => q.kind === "listen").length,
    counts.listen,
  );
  assert.equal(
    questions.filter((q) => q.kind === "read").length,
    counts.read,
  );
  assert.equal(questions.length, counts.total);
  assert.ok(questions.every((q) => q.word.reviewStatus !== "blocked"));
});

test("conceptKeyForWord: same standard without override share a concept", () => {
  const a = fakeWord({ seq: "1", standard: "바다" });
  const b = fakeWord({ seq: "2", standard: "바다" });
  assert.equal(conceptKeyForWord(a), conceptKeyForWord(b));
  assert.equal(conceptKeyForWord(a), "standard:바다");
});

test("conceptKeyForWord: same standard with different conceptId split", () => {
  const a = fakeWord({ seq: "1", standard: "턱", conceptId: "jaw" });
  const b = fakeWord({ seq: "2", standard: "턱", conceptId: "reason" });
  assert.notEqual(conceptKeyForWord(a), conceptKeyForWord(b));
});

test("conceptKeyForWord: different standard with same conceptId merge", () => {
  const a = fakeWord({ seq: "1", standard: "어서", conceptId: "come-quickly" });
  const b = fakeWord({ seq: "2", standard: "빨리 와", conceptId: "come-quickly" });
  assert.equal(conceptKeyForWord(a), conceptKeyForWord(b));
  assert.equal(conceptKeyForWord(a), "concept:come-quickly");
});

test("conceptKeyForWord: fallback standard does not collide with explicit conceptId", () => {
  const a = fakeWord({ seq: "1", standard: "jaw" });
  const b = fakeWord({ seq: "2", standard: "무관", conceptId: "jaw" });
  assert.notEqual(conceptKeyForWord(a), conceptKeyForWord(b));
  assert.equal(conceptKeyForWord(a), "standard:jaw");
  assert.equal(conceptKeyForWord(b), "concept:jaw");
});
test("MERGE: same-meaning variants share a concept key and stay out of each other's read choices", () => {
  const words = units.flatMap((u) => u.words);
  const a = words.find((w) => w.seq === "10111"); // 고망 → 구멍
  const b = words.find((w) => w.seq === "20111"); // 고냥 → 구멍
  assert.ok(a && b);
  assert.equal(a.conceptId, undefined);
  assert.equal(b.conceptId, undefined);
  assert.equal(conceptKeyForWord(a), conceptKeyForWord(b));

  const unitA = units.find((u) => u.words.some((w) => w.seq === "10111"));
  const unitB = units.find((u) => u.words.some((w) => w.seq === "20111"));
  assert.ok(unitA && unitB);
  for (let round = 0; round < 20; round += 1) {
    const readA = buildLesson(unitA).find((q) => q.id === "10111-read");
    const readB = buildLesson(unitB).find((q) => q.id === "20111-read");
    assert.ok(readA && readB);
    assert.ok(!readA.choices.includes("고냥"));
    assert.ok(!readB.choices.includes("고망"));
  }
});

const splitPairs = [
  { seqA: "10101", seqB: "10143", glossA: "다리(신체)", glossB: "다리(교량)" },
  { seqA: "10146", seqB: "10284", glossA: "달(하늘의 달)", glossB: "달(한 달)" },
  { seqA: "10392", seqB: "10393", glossA: "열다(열다)", glossB: "열다(열매가 열리다)" },
  { seqA: "20376", seqB: "20377", glossA: "맡다(냄새를 맡다)", glossB: "맡다(책임을 맡다)" },
];

test("SPLIT: true homographs get distinct concept keys and sense-aware read display", () => {
  const words = units.flatMap((u) => u.words);
  for (const pair of splitPairs) {
    const a = words.find((w) => w.seq === pair.seqA);
    const b = words.find((w) => w.seq === pair.seqB);
    assert.ok(a && b, `missing ${pair.seqA}/${pair.seqB}`);
    assert.notEqual(conceptKeyForWord(a), conceptKeyForWord(b));
    assert.equal(a.quizGloss, pair.glossA);
    assert.equal(b.quizGloss, pair.glossB);
    const unitA = units.find((u) => u.words.some((w) => w.seq === pair.seqA));
    const unitB = units.find((u) => u.words.some((w) => w.seq === pair.seqB));
    assert.ok(unitA && unitB);
    const readA = buildLesson(unitA).find((q) => q.id === `${pair.seqA}-read`);
    const readB = buildLesson(unitB).find((q) => q.id === `${pair.seqB}-read`);
    assert.ok(readA && readB);
    assert.equal(readA.displayMeaning, pair.glossA);
    assert.equal(readB.displayMeaning, pair.glossB);
  }
});

test("all 29 book homograph splits stay complete and consistent", () => {
  const words = units.flatMap((u) => u.words).filter((w) => w.reviewStatus !== "blocked");
  const byStandard = new Map<string, typeof words>();
  for (const word of words) {
    const key = word.standard.trim();
    const list = byStandard.get(key) ?? [];
    list.push(word);
    byStandard.set(key, list);
  }
  let splitGroups = 0;
  for (const [standard, group] of byStandard) {
    const keys = new Set(group.map((w) => conceptKeyForWord(w)));
    if (keys.size < 2) continue;
    splitGroups += 1;
    const glossByConcept = new Map<string, string>();
    for (const word of group) {
      const gloss = word.quizGloss?.trim();
      assert.ok(gloss, `${standard} / ${word.seq} split without quizGloss`);
      const concept = conceptKeyForWord(word);
      const prev = glossByConcept.get(concept);
      if (prev) assert.equal(prev, gloss, `${standard} same concept different gloss`);
      glossByConcept.set(concept, gloss);
    }
    assert.equal(
      new Set(glossByConcept.values()).size,
      glossByConcept.size,
      `${standard} concepts share a quizGloss`,
    );
  }
  assert.equal(splitGroups, 29);
});

test("native words without a standard equivalent get listen-only lessons", () => {
  const words = units.flatMap((u) => u.words);
  const native = words.find((w) => w.seq === "20185"); // 물질 (standard == jeju)
  assert.ok(native && native.standard === native.jeju);
  const unit = units.find((u) => u.words.some((w) => w.seq === "20185"));
  assert.ok(unit);
  const questions = buildLesson(unit);
  assert.equal(questions.some((q) => q.id === "20185-read"), false);
  const listen = questions.find((q) => q.id === "20185-listen");
  assert.ok(listen);
  assert.equal(listen.prompt, "들은 제주말을 고르세요");
  assert.equal(listen.answer, native.jeju);
  const counts = getLessonQuestionCounts(unit);
  assert.equal(counts.read, questions.filter((q) => q.kind === "read").length);
  assert.equal(counts.total, questions.length);
});
