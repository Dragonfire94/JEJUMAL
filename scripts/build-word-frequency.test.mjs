import assert from "node:assert/strict";
import { test } from "node:test";
import { buildFrequencyList } from "./build-word-frequency.mjs";

function dict(entries) {
  const byName = new Map();
  for (const e of entries) {
    const name = (e.name ?? "").replaceAll("-", "");
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(e);
  }
  return { entries, byName };
}

test("ranks dictionary-backed tokens by corpus frequency, high to low", () => {
  const dictionary = dict([
    { seq: "1", name: "하영", contents: "많이", category_name: "어찌씨" },
    { seq: "2", name: "어멍", contents: "어머니", category_name: "인륜" },
  ]);
  const tokens = {
    하영: [["많이", 100]],
    어멍: [["어머니", 500]],
  };
  const rows = buildFrequencyList({ tokens, dictionary, appJejuWords: new Set() });
  assert.equal(rows[0].lemma, "어멍");
  assert.equal(rows[0].corpusFrequency, 500);
  assert.equal(rows[1].lemma, "하영");
});

test("drops tokens that are not real dictionary headwords (particles, inflected endings, typos)", () => {
  const dictionary = dict([{ seq: "1", name: "하영", contents: "많이" }]);
  const tokens = {
    하영: [["많이", 100]],
    거난: [["그러니까", 9999]], // 사전에 없는 활용형/접속 표현
  };
  const rows = buildFrequencyList({ tokens, dictionary, appJejuWords: new Set() });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].lemma, "하영");
});

test("drops tokens containing PUA characters or shorter than 2 chars", () => {
  const dictionary = dict([
    { seq: "1", name: "기", contents: "테스트" },
    { seq: "2", name: "가", contents: "노래" },
  ]);
  const tokens = { "기": [["테스트", 10]], 가: [["노래", 10]] };
  const rows = buildFrequencyList({ tokens, dictionary, appJejuWords: new Set() });
  assert.equal(rows.length, 0);
});

test("prefers the dictionary entry with the shortest cross-reference chain when a spelling has several entries", () => {
  const dictionary = dict([
    { seq: "1", name: "검질", contents: "⇒검질2" },
    { seq: "2", name: "검질", contents: "잡초, 김을 매지 않은 풀" },
  ]);
  const tokens = { 검질: [["잡초", 50]] };
  const rows = buildFrequencyList({ tokens, dictionary, appJejuWords: new Set() });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].dictionarySeq, "2");
});

test("resolves a pure cross-reference gloss (⇒target) to the target's actual meaning", () => {
  const dictionary = dict([
    { seq: "1", name: "무시거", contents: "⇒무스거" },
    { seq: "2", name: "무스거", contents: "무엇" },
  ]);
  const tokens = { 무시거: [["무엇", 30]] };
  const rows = buildFrequencyList({ tokens, dictionary, appJejuWords: new Set() });
  assert.equal(rows[0].standardGloss, "무엇");
});

test("marks alreadyInApp based on the current app vocabulary", () => {
  const dictionary = dict([{ seq: "1", name: "하영", contents: "많이" }]);
  const tokens = { 하영: [["많이", 10]] };
  const rows = buildFrequencyList({ tokens, dictionary, appJejuWords: new Set(["하영"]) });
  assert.equal(rows[0].alreadyInApp, true);
});
