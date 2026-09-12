import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { test } from "node:test";
import { assembleUnits, loadContentBundle, validateBundle } from "./build-content.mjs";
import { LexemeSchema } from "./content-schema.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const UNITS_PATH = path.join(ROOT, "src/data/units.json");

test("content/ 원장은 유효한 스키마와 상호참조를 가진다", () => {
  const bundle = loadContentBundle();
  // 문제가 있으면 여기서 예외를 던진다.
  assert.doesNotThrow(() => validateBundle(bundle));
});

test("committed src/data/units.json은 content/ 원장에서 그대로 재생성된 결과와 일치한다", () => {
  // 누군가 units.json을 직접 손으로 고치고 content/ 쪽을 안 고치면 이 테스트가 잡아낸다.
  const bundle = validateBundle(loadContentBundle());
  const rebuilt = assembleUnits(bundle);
  const committed = JSON.parse(readFileSync(UNITS_PATH, "utf8"));
  assert.deepEqual(
    rebuilt,
    committed,
    "src/data/units.json이 content/ 원장과 어긋납니다. node scripts/build-content.mjs 를 다시 실행해서 커밋하세요.",
  );
});

test("유닛은 정확히 100개, 유닛당 8~10개, 표제어 원장은 그보다 많을 수 있다", () => {
  // content/lexemes.json은 2025 기본어휘 대량 반영(pendingPlacement) 이후로 유닛에
  // 배정된 단어 수보다 많은 표제어를 담을 수 있다 — 유닛 배정 전 "대기" 단어들도
  // 원장에는 있어야 나중에 채울 수 있기 때문이다.
  // same_meaning_different_form 정리(근거 약한 중복 제거) 때 품사가 맞는 대체
  // 표제어 재고가 없어서 일부 유닛은 10개를 못 채우고 8~9개로 남았다 — 정확한
  // 총 단어 수를 고정하지 않고 유닛별 8~10개 범위, 총 lexemes >= 배정된 수만
  // 검증한다.
  const bundle = validateBundle(loadContentBundle());
  assert.equal(bundle.units.length, 100);
  for (const u of bundle.units) {
    assert.ok(
      u.wordSeqs.length >= 8 && u.wordSeqs.length <= 10,
      `유닛 ${u.id}의 단어 수가 ${u.wordSeqs.length}개(8~10개여야 함)`,
    );
  }
  const wordsInUnits = bundle.units.reduce((sum, u) => sum + u.wordSeqs.length, 0);
  assert.ok(bundle.lexemes.length >= wordsInUnits);
});

function syntheticLexeme(seq, reviewStatus) {
  const lexeme = {
    seq,
    jeju: `jeju-${seq}`,
    standard: `std-${seq}`,
    partOfSpeech: "noun",
  };
  if (reviewStatus) lexeme.reviewStatus = reviewStatus;
  return lexeme;
}

function syntheticBundle(lexemes) {
  return {
    units: [
      {
        id: "u1",
        title: "synthetic",
        themeId: "theme",
        rankIndex: 0,
        order: 1,
        wordSeqs: lexemes.map((l) => l.seq),
      },
    ],
    lexemes,
    examples: [],
  };
}

test("assembleUnits omits blocked lexemes from runtime words", () => {
  const bundle = syntheticBundle([
    syntheticLexeme("1", "approved"),
    syntheticLexeme("2", "blocked"),
    syntheticLexeme("3", "provisional"),
  ]);
  const units = assembleUnits(bundle);
  assert.deepEqual(
    units[0].words.map((w) => w.seq),
    ["1", "3"],
  );
  assert.equal(units[0].words.filter((w) => w.reviewStatus === "blocked").length, 0);
});

test("assembleUnits keeps approved, provisional, and unset reviewStatus", () => {
  const bundle = syntheticBundle([
    syntheticLexeme("1", "approved"),
    syntheticLexeme("2", "provisional"),
    syntheticLexeme("3"),
  ]);
  const units = assembleUnits(bundle);
  assert.deepEqual(
    units[0].words.map((w) => w.seq),
    ["1", "2", "3"],
  );
  assert.equal(units[0].words[0].reviewStatus, "approved");
  assert.equal(units[0].words[1].reviewStatus, "provisional");
  assert.equal(units[0].words[2].reviewStatus, undefined);
});

test("current real dataset has no blocked runtime words and rebuild stays stable", () => {
  const bundle = validateBundle(loadContentBundle());
  const rebuilt = assembleUnits(bundle);
  const committed = JSON.parse(readFileSync(UNITS_PATH, "utf8"));
  const sourceBlocked = bundle.lexemes.filter((l) => l.reviewStatus === "blocked").length;
  const assignedBlocked = bundle.units.reduce(
    (n, u) => n + u.wordSeqs.filter((seq) => bundle.lexemes.find((l) => l.seq === seq)?.reviewStatus === "blocked").length,
    0,
  );
  const generatedBlocked = rebuilt.flatMap((u) => u.words).filter((w) => w.reviewStatus === "blocked").length;
  assert.equal(generatedBlocked, 0);
  if (sourceBlocked === 0 && assignedBlocked === 0) {
    const assignedWords = bundle.units.reduce((n, u) => n + u.wordSeqs.length, 0);
    const generatedWords = rebuilt.reduce((n, u) => n + u.words.length, 0);
    assert.equal(generatedWords, assignedWords);
    assert.deepEqual(rebuilt, committed);
  }
});

const lexemeBase = { seq: "1", jeju: "느", standard: "너", partOfSpeech: "pronoun" };

test("lexeme schema accepts optional non-empty conceptId", () => {
  assert.equal(LexemeSchema.safeParse(lexemeBase).success, true);
  assert.equal(LexemeSchema.safeParse({ ...lexemeBase, conceptId: "come-quickly" }).success, true);
});

test("lexeme schema rejects empty or whitespace-only conceptId", () => {
  assert.equal(LexemeSchema.safeParse({ ...lexemeBase, conceptId: "" }).success, false);
  assert.equal(LexemeSchema.safeParse({ ...lexemeBase, conceptId: "   " }).success, false);
});

test("assembleUnits copies source conceptId onto the generated word", () => {
  const withId = syntheticLexeme("1", "approved");
  withId.conceptId = "sample-concept";
  const withoutId = syntheticLexeme("2", "approved");
  const units = assembleUnits(syntheticBundle([withId, withoutId]));
  assert.equal(units[0].words[0].conceptId, "sample-concept");
  assert.equal("conceptId" in units[0].words[1], false);
});

test("current real dataset has no conceptId and rebuild stays stable", () => {
  const bundle = validateBundle(loadContentBundle());
  const rebuilt = assembleUnits(bundle);
  const committed = JSON.parse(readFileSync(UNITS_PATH, "utf8"));
  const sourceConceptIds = bundle.lexemes.filter((l) => l.conceptId).length;
  const generatedConceptIds = rebuilt.flatMap((u) => u.words).filter((w) => w.conceptId).length;
  assert.equal(sourceConceptIds, 0);
  assert.equal(generatedConceptIds, 0);
  assert.deepEqual(rebuilt, committed);
});
