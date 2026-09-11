import { test } from "node:test";
import assert from "node:assert/strict";
import {
  loadLifeDialectBundle,
  validateLifeDialectBundle,
  assembleLifeDialect,
  findCandidateWordLinks,
} from "./build-life-dialect.mjs";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const units = JSON.parse(readFileSync(path.join(ROOT, "src/data/units.json"), "utf8"));

test("content/life-dialect.json이 스키마를 통과한다", () => {
  const bundle = validateLifeDialectBundle(loadLifeDialectBundle());
  assert.equal(bundle.passages.length, 10);
});

test("모든 문장은 jeju/archaic/solution 세 줄이 다 채워져 있다", () => {
  const bundle = validateLifeDialectBundle(loadLifeDialectBundle());
  for (const p of bundle.passages) {
    for (const s of p.sentences) {
      assert.ok(s.jeju.length > 0, `${p.id}에 빈 jeju 문장`);
      assert.ok(s.archaic.length > 0, `${p.id}에 빈 archaic 문장`);
      assert.ok(s.solutionEdited.length > 0, `${p.id}에 빈 번역`);
    }
  }
});

test("passage id/seq 중복이 없다", () => {
  const bundle = validateLifeDialectBundle(loadLifeDialectBundle());
  const ids = bundle.passages.map((p) => p.id);
  const seqs = bundle.passages.map((p) => p.seq);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(seqs).size, seqs.length);
});

test("단어 후보 연결은 항상 candidate 상태이지 approved가 아니다", () => {
  const bundle = validateLifeDialectBundle(loadLifeDialectBundle());
  const assembled = assembleLifeDialect(bundle, units);
  const allLinks = assembled.passages.flatMap((p) => p.sentences.flatMap((s) => s.wordLinks));
  assert.ok(allLinks.length > 0, "테스트 데이터에 후보 연결이 하나도 안 잡힘");
  for (const link of allLinks) {
    assert.equal(link.status, "candidate");
  }
});

test("findCandidateWordLinks는 표준어 표제어가 등장한 문장만 잡는다", () => {
  const fakeWords = [
    { seq: "1", jeju: "혼저", standard: "어서", partOfSpeech: "adverb" },
    { seq: "2", jeju: "밥", standard: "밥", partOfSpeech: "noun" },
  ];
  const sentence = {
    jeju: "혼저 옵서",
    archaic: "저 옵서",
    solutionOriginal: "어서 오십시오",
    solutionEdited: "어서 오십시오",
  };
  const links = findCandidateWordLinks(sentence, fakeWords);
  const seqs = links.map((l) => l.seq).sort();
  assert.deepEqual(seqs, ["1"]);
});

test("blocked 단어는 후보 연결에서 제외된다", () => {
  const fakeWords = [{ seq: "1", jeju: "혼저", standard: "어서", partOfSpeech: "adverb", reviewStatus: "blocked" }];
  const sentence = {
    jeju: "혼저 옵서",
    archaic: "저 옵서",
    solutionOriginal: "어서 오십시오",
    solutionEdited: "어서 오십시오",
  };
  assert.deepEqual(findCandidateWordLinks(sentence, fakeWords), []);
});
