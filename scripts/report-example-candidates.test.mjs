import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseWaveArg,
  recommendedAction,
  selectWavePendingLexemes,
  attachAudit,
  sortCandidateRows,
  stripHomographNumber,
  searchForms,
  supplementalEvidence,
  meaningMatches,
} from "./report-example-candidates.mjs";

test("--wave 없으면 usage/error", () => {
  const r = parseWaveArg([]);
  assert.equal(r.ok, false);
  assert.match(r.error, /usage:/);
  assert.match(r.error, /--wave is required/);
});

test("--wave 값이 없거나 범위 밖이면 error", () => {
  assert.equal(parseWaveArg(["--wave"]).ok, false);
  assert.equal(parseWaveArg(["--wave", "10"]).ok, false);
  assert.equal(parseWaveArg(["--wave", "foo"]).ok, false);
  assert.equal(parseWaveArg(["--wave", "-1"]).ok, false);
});

test("--wave 0-9면 정수 wave를 돌려준다", () => {
  assert.deepEqual(parseWaveArg(["--wave", "1"]), { ok: true, wave: 1 });
  assert.deepEqual(parseWaveArg(["--wave", "0"]), { ok: true, wave: 0 });
});

test("lifeDialect hit -> OFFICIAL_FIRST가 corpus보다 앞선다", () => {
  assert.equal(
    recommendedAction({ exactHits: 100, inflectedHits: 20, lifeDialectHits: 1 }),
    "OFFICIAL_FIRST",
  );
});

test("강한 corpus hit -> CORPUS_FIRST", () => {
  assert.equal(recommendedAction({ exactHits: 3, inflectedHits: 0, lifeDialectHits: 0 }), "CORPUS_FIRST");
  assert.equal(recommendedAction({ exactHits: 0, inflectedHits: 5, lifeDialectHits: 0 }), "CORPUS_FIRST");
});

test("약한 hit -> CHECK_HITS", () => {
  assert.equal(recommendedAction({ exactHits: 1, inflectedHits: 0, lifeDialectHits: 0 }), "CHECK_HITS");
  assert.equal(recommendedAction({ exactHits: 0, inflectedHits: 4, lifeDialectHits: 0 }), "CHECK_HITS");
});

test("0 hit -> SOURCE_GAP", () => {
  assert.equal(recommendedAction({ exactHits: 0, inflectedHits: 0, lifeDialectHits: 0 }), "SOURCE_GAP");
  assert.equal(recommendedAction({}), "SOURCE_GAP");
});

test("그자1 -> 그자 normalization", () => {
  assert.equal(stripHomographNumber("그자1"), "그자");
  assert.equal(stripHomographNumber("튀다1"), "튀다");
  assert.equal(stripHomographNumber("트다2"), "트다");
  assert.deepEqual(searchForms({ jeju: "그자1" }), ["그자1", "그자"]);
});

test("숫자 없는 headword unchanged", () => {
  assert.equal(stripHomographNumber("게도"), "게도");
  assert.equal(stripHomographNumber("2층집"), "2층집");
  assert.deepEqual(searchForms({ jeju: "게도" }), ["게도"]);
});

test("otherJejuForms hit", () => {
  const tokens = { ᄀᆞ실: [["가을", 7]] };
  const extra = supplementalEvidence({
    jeju: "ᄀᆞ슬",
    standard: "가을",
    otherJejuForms: ["ᄀᆞ실"],
    tokens,
  });
  assert.equal(extra.candidateEvidence, "OTHER_FORM");
  assert.equal(extra.supplementalTokenHits, 7);
  assert.ok(extra.searchForms.includes("ᄀᆞ실"));
  assert.equal(
    recommendedAction({
      exactHits: 0,
      inflectedHits: 0,
      lifeDialectHits: 0,
      supplementalTokenHits: extra.supplementalTokenHits,
      candidateEvidence: extra.candidateEvidence,
    }),
    "CHECK_HITS",
  );
});

test("동형이의 표준어 sense가 다른 hit는 과대평가하지 않음", () => {
  const tokens = { 상: [["사다", 100], ["사서", 50]] };
  const extra = supplementalEvidence({
    jeju: "상",
    standard: "향",
    tokens,
  });
  assert.equal(extra.supplementalTokenHits, 0);
  assert.equal(extra.candidateEvidence, "NONE");
  assert.equal(
    recommendedAction({
      exactHits: 0,
      inflectedHits: 0,
      lifeDialectHits: 0,
      supplementalTokenHits: extra.supplementalTokenHits,
      candidateEvidence: extra.candidateEvidence,
    }),
    "SOURCE_GAP",
  );
  assert.equal(meaningMatches("향", "사다"), false);
});

test("그자1 정규화 hit는 CHECK_HITS까지만 올린다", () => {
  const tokens = { 그자: [["그저", 328], ["그냥", 84]] };
  const extra = supplementalEvidence({
    jeju: "그자1",
    standard: "그저",
    partOfSpeech: "adverb",
    tokens,
  });
  assert.equal(extra.candidateEvidence, "HEADWORD_NORMALIZED");
  assert.equal(extra.supplementalTokenHits, 328);
  assert.equal(
    recommendedAction({
      exactHits: 0,
      inflectedHits: 0,
      lifeDialectHits: 0,
      supplementalTokenHits: extra.supplementalTokenHits,
      candidateEvidence: extra.candidateEvidence,
    }),
    "CHECK_HITS",
  );
});

test("missing token graceful fallback", () => {
  const extra = supplementalEvidence({ jeju: "그자1", standard: "그저" });
  assert.equal(extra.supplementalTokenHits, 0);
  assert.equal(extra.candidateEvidence, "NONE");
  const attached = attachAudit(
    [{ seq: "1", jeju: "그자1", standard: "그저", partOfSpeech: "adverb", otherJejuForms: [] }],
    new Map(),
  );
  assert.equal(attached[0].recommendedAction, "SOURCE_GAP");
  assert.equal(attached[0].candidateEvidence, "NONE");
  assert.equal(attached[0].supplementalTokenHits, 0);
});

const units = [
  { id: "people-0", rankIndex: 0, wordSeqs: ["1", "2"] },
  { id: "people-1", rankIndex: 1, wordSeqs: ["10", "11", "12", "99"] },
  { id: "talk-1", rankIndex: 1, wordSeqs: ["20"] },
];
const lexemes = [
  { seq: "1", jeju: "느", standard: "너", pendingExample: true, partOfSpeech: "pronoun" },
  { seq: "10", jeju: "게도", standard: "그래도", pendingExample: true, partOfSpeech: "adverb", bookMeta: { definition: "양보", otherJejuForms: [] } },
  { seq: "11", jeju: "성", standard: "형", pendingExample: false, partOfSpeech: "noun" },
  { seq: "12", jeju: "따문", standard: "때문", pendingExample: true, partOfSpeech: "noun", bookMeta: { definition: "이유", otherJejuForms: ["땜시"] } },
  { seq: "20", jeju: "옴막", standard: "꿀꺽", pendingExample: true, partOfSpeech: "adverb" },
];

test("Wave 1 unit만 고르고 pendingExample이 아닌 lexeme은 뺀다", () => {
  const rows = selectWavePendingLexemes(units, lexemes, 1);
  assert.deepEqual(
    rows.map((r) => r.seq),
    ["10", "12", "99", "20"],
  );
  assert.equal(
    rows.some((r) => r.unitId.endsWith("-0")),
    false,
  );
  assert.equal(
    rows.some((r) => r.seq === "11"),
    false,
  );
});

test("unknown seq와 audit missing은 crash하지 않고 SOURCE_GAP", () => {
  const selected = selectWavePendingLexemes(units, lexemes, 1);
  const missing = selected.find((r) => r.seq === "99");
  assert.equal(missing.missingLexeme, true);

  const attached = attachAudit(selected, new Map([["10", { exactHits: 8, inflectedHits: 1, lifeDialectHits: 1, tier: "confirmed" }]]));
  const bySeq = Object.fromEntries(attached.map((r) => [r.seq, r]));
  assert.equal(bySeq["99"].recommendedAction, "SOURCE_GAP");
  assert.equal(bySeq["12"].recommendedAction, "SOURCE_GAP");
  assert.equal(bySeq["12"].exactHits, 0);
  assert.equal(bySeq["10"].recommendedAction, "OFFICIAL_FIRST");
  assert.equal(bySeq["20"].recommendedAction, "SOURCE_GAP");
});

test("정렬은 OFFICIAL_FIRST → CORPUS_FIRST → CHECK_HITS → SOURCE_GAP", () => {
  const rows = sortCandidateRows([
    { seq: "1", unitId: "a-1", recommendedAction: "SOURCE_GAP" },
    { seq: "2", unitId: "a-1", recommendedAction: "CHECK_HITS" },
    { seq: "3", unitId: "a-1", recommendedAction: "CORPUS_FIRST" },
    { seq: "4", unitId: "a-1", recommendedAction: "OFFICIAL_FIRST" },
  ]);
  assert.deepEqual(
    rows.map((r) => r.recommendedAction),
    ["OFFICIAL_FIRST", "CORPUS_FIRST", "CHECK_HITS", "SOURCE_GAP"],
  );
});
