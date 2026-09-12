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

test("MERGE HIGH 줍다 shares a concept key and is excluded from the other read choices", () => {
  const words = units.flatMap((u) => u.words);
  const a = words.find((w) => w.seq === "7017");
  const b = words.find((w) => w.seq === "90193");
  assert.ok(a && b);
  assert.equal(a.conceptId, "줍다");
  assert.equal(b.conceptId, "줍다");
  assert.equal(conceptKeyForWord(a), conceptKeyForWord(b));
  assert.equal("quizGloss" in a, false);
  assert.equal("quizGloss" in b, false);

  const unitA = units.find((u) => u.words.some((w) => w.seq === "7017"));
  const unitB = units.find((u) => u.words.some((w) => w.seq === "90193"));
  assert.ok(unitA && unitB);
  for (let round = 0; round < 20; round += 1) {
    const readA = buildLesson(unitA).find((q) => q.id === "7017-read");
    const readB = buildLesson(unitB).find((q) => q.id === "90193-read");
    assert.ok(readA && readB);
    assert.ok(!readA.choices.includes("줏다"));
    assert.ok(!readB.choices.includes("봉그다"));
  }
});

const splitPairs = [
  { seqA: "90029", seqB: "2772", glossA: "다리(교량)", glossB: "다리(신체)" },
  { seqA: "90032", seqB: "90109", glossA: "달(천체)", glossB: "달(한 달)" },
  { seqA: "90232", seqB: "90490", glossA: "달다(맛이 달다)", glossB: "달다(걸어 붙이다)" },
  { seqA: "90389", seqB: "90447", glossA: "띠(풀)", glossB: "띠(십이지)" },
  { seqA: "90065", seqB: "90114", glossA: "살(몸의 살)", glossB: "살(나이)" },
  { seqA: "7071", seqB: "90251", glossA: "쓰다(글을 쓰다)", glossB: "쓰다(맛이 쓰다)" },
];

test("SPLIT HIGH pairs have different concept keys, distinct quizGloss, and sense-aware read display", () => {
  const words = units.flatMap((u) => u.words);
  for (const pair of splitPairs) {
    const a = words.find((w) => w.seq === pair.seqA);
    const b = words.find((w) => w.seq === pair.seqB);
    assert.ok(a && b, `missing ${pair.seqA}/${pair.seqB}`);
    assert.notEqual(conceptKeyForWord(a), conceptKeyForWord(b));
    assert.equal(a.quizGloss, pair.glossA);
    assert.equal(b.quizGloss, pair.glossB);
    assert.notEqual(a.quizGloss, b.quizGloss);
    const unitA = units.find((u) => u.words.some((w) => w.seq === pair.seqA));
    const unitB = units.find((u) => u.words.some((w) => w.seq === pair.seqB));
    assert.ok(unitA && unitB);
    const readA = buildLesson(unitA).find((q) => q.id === `${pair.seqA}-read`);
    const readB = buildLesson(unitB).find((q) => q.id === `${pair.seqB}-read`);
    assert.ok(readA && readB);
    assert.equal(readA.displayMeaning, pair.glossA);
    assert.equal(readB.displayMeaning, pair.glossB);
    const listenA = buildLesson(unitA).find((q) => q.id === `${pair.seqA}-listen`);
    if (listenA) {
      assert.equal(listenA.answer, a.standard);
      assert.equal(listenA.displayMeaning, a.standard);
    }
  }
});

test("read displayMeaning uses quizGloss when present and standard otherwise", () => {
  const withGloss = fakeWord({ seq: "1", standard: "다리", quizGloss: "다리(교량)" });
  const without = fakeWord({ seq: "2", standard: "바다" });
  assert.equal(displayMeaningFor(withGloss, "read"), "다리(교량)");
  assert.equal(displayMeaningFor(without, "read"), "바다");
  assert.equal(displayMeaningFor(withGloss, "listen"), "다리");
});

test("split same-standard groups all have distinct quizGloss per concept", () => {
  const words = units.flatMap((u) => u.words).filter((w) => w.reviewStatus !== "blocked");
  const byStandard = new Map<string, typeof words>();
  for (const word of words) {
    const key = word.standard.trim();
    const list = byStandard.get(key) ?? [];
    list.push(word);
    byStandard.set(key, list);
  }
  for (const [standard, group] of byStandard) {
    if (group.length < 2) continue;
    const keys = new Set(group.map((w) => conceptKeyForWord(w)));
    if (keys.size < 2) continue;
    const glossByConcept = new Map<string, string>();
    for (const word of group) {
      const concept = conceptKeyForWord(word);
      const gloss = word.quizGloss?.trim();
      assert.ok(gloss, `${standard} / ${word.seq} split without quizGloss`);
      const prev = glossByConcept.get(concept);
      if (prev) assert.equal(prev, gloss);
      glossByConcept.set(concept, gloss);
    }
    const glosses = [...glossByConcept.values()];
    assert.equal(new Set(glosses).size, glosses.length, `${standard} split concepts share a quizGloss`);
  }
});

test("remaining HIGH split 열다/맡다 share keys inside sense and split across senses", () => {
  const words = units.flatMap((u) => u.words);
  const bySeq = (seq: string) => words.find((w) => w.seq === seq);
  const openA = bySeq("7087");
  const openB = bySeq("90191");
  const fruit = bySeq("90192");
  assert.ok(openA && openB && fruit);
  assert.equal(conceptKeyForWord(openA), conceptKeyForWord(openB));
  assert.notEqual(conceptKeyForWord(openA), conceptKeyForWord(fruit));
  assert.equal(openA.quizGloss, openB.quizGloss);
  assert.equal(openA.quizGloss, "열다(문 등을 열다)");
  assert.equal(fruit.quizGloss, "열다(열매가 맺히다)");

  const smellA = bySeq("6956");
  const smellB = bySeq("90503");
  const charge = bySeq("90504");
  assert.ok(smellA && smellB && charge);
  assert.equal(conceptKeyForWord(smellA), conceptKeyForWord(smellB));
  assert.notEqual(conceptKeyForWord(smellA), conceptKeyForWord(charge));
  assert.equal(smellA.quizGloss, smellB.quizGloss);
  assert.equal(smellA.quizGloss, "맡다(냄새를 맡다)");
  assert.equal(charge.quizGloss, "맡다(책임·일을 맡다)");
});

const remainingSplitPairs = [
  { seqA: "90149", seqB: "90150", glossA: "갈다(다른 것으로 바꾸다)", glossB: "갈다(날을 갈다)" },
  { seqA: "90152", seqB: "90153", glossA: "감다(눈을 감다)", glossB: "감다(머리·몸을 씻다)" },
  { seqA: "90212", seqB: "90557", glossA: "뜨다(눈을 뜨다)", glossB: "뜨다(물·공중에 뜨다)" },
];

test("remaining HIGH split pairs have different concept keys and sense-aware read display", () => {
  const words = units.flatMap((u) => u.words);
  for (const pair of remainingSplitPairs) {
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
    const listenA = buildLesson(unitA).find((q) => q.id === `${pair.seqA}-listen`);
    if (listenA) {
      assert.equal(listenA.answer, a.standard);
      assert.equal(listenA.displayMeaning, a.standard);
    }
  }
});

const highSplitGroups: { name: string; members: { seq: string; conceptId: string; quizGloss: string }[] }[] = [
  {
    name: "다리",
    members: [
      { seq: "90029", conceptId: "다리-bridge", quizGloss: "다리(교량)" },
      { seq: "2772", conceptId: "다리-leg", quizGloss: "다리(신체)" },
    ],
  },
  {
    name: "달",
    members: [
      { seq: "90032", conceptId: "달-moon", quizGloss: "달(천체)" },
      { seq: "90109", conceptId: "달-month", quizGloss: "달(한 달)" },
    ],
  },
  {
    name: "달다",
    members: [
      { seq: "90232", conceptId: "달다-sweet", quizGloss: "달다(맛이 달다)" },
      { seq: "90490", conceptId: "달다-hang", quizGloss: "달다(걸어 붙이다)" },
    ],
  },
  {
    name: "띠",
    members: [
      { seq: "90389", conceptId: "띠-grass", quizGloss: "띠(풀)" },
      { seq: "90447", conceptId: "띠-zodiac", quizGloss: "띠(십이지)" },
    ],
  },
  {
    name: "살",
    members: [
      { seq: "90065", conceptId: "살-flesh", quizGloss: "살(몸의 살)" },
      { seq: "90114", conceptId: "살-age", quizGloss: "살(나이)" },
    ],
  },
  {
    name: "쓰다",
    members: [
      { seq: "7071", conceptId: "쓰다-write", quizGloss: "쓰다(글을 쓰다)" },
      { seq: "90251", conceptId: "쓰다-bitter", quizGloss: "쓰다(맛이 쓰다)" },
    ],
  },
  {
    name: "열다",
    members: [
      { seq: "7087", conceptId: "열다-open", quizGloss: "열다(문 등을 열다)" },
      { seq: "90191", conceptId: "열다-open", quizGloss: "열다(문 등을 열다)" },
      { seq: "90192", conceptId: "열다-bear-fruit", quizGloss: "열다(열매가 맺히다)" },
    ],
  },
  {
    name: "갈다",
    members: [
      { seq: "90149", conceptId: "갈다-replace", quizGloss: "갈다(다른 것으로 바꾸다)" },
      { seq: "90150", conceptId: "갈다-sharpen", quizGloss: "갈다(날을 갈다)" },
    ],
  },
  {
    name: "감다",
    members: [
      { seq: "90152", conceptId: "감다-close-eyes", quizGloss: "감다(눈을 감다)" },
      { seq: "90153", conceptId: "감다-wash", quizGloss: "감다(머리·몸을 씻다)" },
    ],
  },
  {
    name: "뜨다",
    members: [
      { seq: "90212", conceptId: "뜨다-open-eyes", quizGloss: "뜨다(눈을 뜨다)" },
      { seq: "90557", conceptId: "뜨다-float", quizGloss: "뜨다(물·공중에 뜨다)" },
    ],
  },
  {
    name: "맡다",
    members: [
      { seq: "6956", conceptId: "맡다-smell", quizGloss: "맡다(냄새를 맡다)" },
      { seq: "90503", conceptId: "맡다-smell", quizGloss: "맡다(냄새를 맡다)" },
      { seq: "90504", conceptId: "맡다-take-charge", quizGloss: "맡다(책임·일을 맡다)" },
    ],
  },
];

test("all 11 HIGH split groups are complete with consistent quizGloss per concept", () => {
  assert.equal(highSplitGroups.length, 11);
  const words = units.flatMap((u) => u.words);
  for (const group of highSplitGroups) {
    const members = group.members.map((fixture) => {
      const word = words.find((w) => w.seq === fixture.seq);
      assert.ok(word, `${group.name} missing seq ${fixture.seq}`);
      assert.equal(word.conceptId, fixture.conceptId, `${group.name} ${fixture.seq}`);
      assert.equal(word.quizGloss, fixture.quizGloss, `${group.name} ${fixture.seq}`);
      return word;
    });
    const conceptIds = new Set(members.map((w) => w.conceptId));
    assert.ok(conceptIds.size >= 2, `${group.name} is not split`);
    const glossByConcept = new Map<string, string>();
    for (const word of members) {
      const unit = units.find((u) => u.words.some((w) => w.seq === word.seq));
      assert.ok(unit);
      const read = buildLesson(unit).find((q) => q.id === `${word.seq}-read`);
      assert.ok(read);
      assert.equal(read.displayMeaning, word.quizGloss);
      const listen = buildLesson(unit).find((q) => q.id === `${word.seq}-listen`);
      if (listen) assert.equal(listen.answer, word.standard);
      const prev = glossByConcept.get(word.conceptId!);
      if (prev) assert.equal(prev, word.quizGloss, `${group.name} same concept different gloss`);
      glossByConcept.set(word.conceptId!, word.quizGloss!);
    }
    assert.equal(new Set(glossByConcept.values()).size, glossByConcept.size, `${group.name} concepts share a quizGloss`);
  }
});
