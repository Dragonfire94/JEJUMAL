import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  loadCultureBundle,
  validateCultureBundle,
  checkVocabProvenance,
  assembleCulture,
  findCandidateMainLexemeLinks,
  findCandidateLifeDialectLinks,
} from "./build-culture.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const units = JSON.parse(readFileSync(path.join(ROOT, "src/data/units.json"), "utf8"));
const vocab = JSON.parse(readFileSync(path.join(ROOT, "data/jeju-basic-vocab-2025/vocab.json"), "utf8"));

test("content/culture-items.json이 스키마를 통과하고 25개다", () => {
  const bundle = validateCultureBundle(loadCultureBundle());
  assert.equal(bundle.items.length, 25);
});

test("id/sourceStableId가 전부 고유하다", () => {
  const bundle = validateCultureBundle(loadCultureBundle());
  const ids = bundle.items.map((i) => i.id);
  const stableIds = bundle.items.map((i) => i.sourceStableId);
  assert.equal(new Set(ids).size, 25);
  assert.equal(new Set(stableIds).size, 25);
});

test("id는 culture-1..culture-25 형식이고 source 순서를 유지한다", () => {
  const bundle = validateCultureBundle(loadCultureBundle());
  bundle.items.forEach((item, i) => {
    assert.equal(item.id, `culture-${i + 1}`);
  });
});

test("learnerGloss가 null이면 pendingGloss는 반드시 true다(transitional invariant)", () => {
  const bundle = validateCultureBundle(loadCultureBundle());
  for (const item of bundle.items) {
    if (item.learnerGloss === null) {
      assert.equal(item.pendingGloss, true, `${item.id}: learnerGloss null인데 pendingGloss가 true가 아님`);
    }
  }
});

test("25개 모두 현재 vocab.json source와 provenance가 일치한다", () => {
  const bundle = validateCultureBundle(loadCultureBundle());
  const problems = checkVocabProvenance(bundle.items, vocab.entries);
  assert.deepEqual(problems, []);
});

test("culture-12(ᄆᆞᆷ국)는 PUA 없이 정정된 표기를 그대로 담고 있다", () => {
  const bundle = validateCultureBundle(loadCultureBundle());
  const item = bundle.items.find((i) => i.id === "culture-12");
  assert.ok(item, "culture-12를 찾지 못했습니다");
  assert.equal(item.jeju, "ᄆᆞᆷ국");
  assert.equal(item.containsPua, false);
  assert.ok(
    ![...item.jeju].some((ch) => ch.codePointAt(0) >= 0xe000 && ch.codePointAt(0) <= 0xf8ff),
    "culture-12의 jeju에 PUA 문자가 남아있습니다",
  );
});

test("25개 production source에 PUA 문자가 전혀 없다", () => {
  const bundle = validateCultureBundle(loadCultureBundle());
  for (const item of bundle.items) {
    const fields = [item.jeju, item.definition, ...item.otherJejuForms];
    for (const field of fields) {
      const hasPua = [...field].some((ch) => ch.codePointAt(0) >= 0xe000 && ch.codePointAt(0) <= 0xf8ff);
      assert.equal(hasPua, false, `${item.id}의 "${field}"에 PUA 문자가 있습니다`);
    }
  }
});

test("build-time cross-link은 항상 candidate 상태다", () => {
  const bundle = validateCultureBundle(loadCultureBundle());
  const assembled = assembleCulture(bundle, units.flatMap((u) => u.words), []);
  const allLinks = assembled.items.flatMap((i) => i.relatedMainLexemeSeqs);
  for (const link of allLinks) {
    assert.equal(link.status, "candidate");
  }
});

test("findCandidateMainLexemeLinks는 blocked 단어를 제외한다", () => {
  const item = { jeju: "테왁", otherJejuForms: [] };
  const fakeWords = [{ seq: "1", jeju: "테왁", standard: "테왁", partOfSpeech: "noun", reviewStatus: "blocked" }];
  assert.deepEqual(findCandidateMainLexemeLinks(item, fakeWords), []);
});

test("findCandidateMainLexemeLinks는 한 글자 표제어는 오탐을 막기 위해 무시한다", () => {
  const item = { jeju: "국물", otherJejuForms: [] };
  const fakeWords = [{ seq: "1", jeju: "국", standard: "국", partOfSpeech: "noun" }];
  assert.deepEqual(findCandidateMainLexemeLinks(item, fakeWords), []);
});

test("findCandidateLifeDialectLinks는 문장에 표제 형태가 등장한 경우만 잡는다", () => {
  const item = { jeju: "테왁", otherJejuForms: [] };
  const passages = [
    {
      id: "life-1",
      sentences: [
        { jeju: "테왁 을 지영 물질 가수다.", solutionEdited: "테왁을 지고 물질을 갑니다." },
        { jeju: "혼저 옵서.", solutionEdited: "어서 오세요." },
      ],
    },
  ];
  const links = findCandidateLifeDialectLinks(item, passages);
  assert.deepEqual(links, [{ passageId: "life-1", sentenceIndex: 0, status: "candidate" }]);
});

test("25개 항목의 main lexeme 후보 연결이 레코드를 합치지 않는다(별도 필드로만 존재)", () => {
  const bundle = validateCultureBundle(loadCultureBundle());
  for (const item of bundle.items) {
    assert.equal(Object.prototype.hasOwnProperty.call(item, "relatedMainLexemeSeqs"), false);
  }
});
