import assert from "node:assert/strict";
import { test } from "node:test";
import {
  loadInputs,
  planMigration,
  applyPlans,
  buildAuditRows,
  snapshotTopLevel,
  diffTopLevel,
} from "./migrate_basic_vocab_content_refs.mjs";

// 3B-1B: content/lexemes.json의 2025 기본어휘 bookMeta.bookId를 순번
// 기반에서 production stableId로 옮기는 migration script 검증.
// 실제 content/lexemes.json은 이 테스트에서 쓰지 않는다(읽기 전용) —
// production 파일에 대한 계획(plan)만 검증하고, 합성 fixture로 실패
// 경로(unknown seq, ambiguous, legacyBookId mismatch)를 검증한다.

function makeFixture(overrides = {}) {
  const vocab = {
    entries: [
      { id: "jbv2025-0001", stableId: "jbv2025-p001l-y01000" },
      { id: "jbv2025-0002", stableId: "jbv2025-p001l-y02000" },
    ],
  };
  const registry = {
    entries: [
      { stableId: "jbv2025-p001l-y01000", status: "active" },
      { stableId: "jbv2025-p001l-y02000", status: "active" },
    ],
  };
  const mapping = [
    {
      seq: "1", jeju: "가", standard: "가", partOfSpeech: "noun",
      old_bookId: "jbv2025-0099", confidence: "A",
      corrected_numeric_id: "jbv2025-0001", corrected_stable_id: "jbv2025-p001l-y01000",
      corrected_jeju_forms: ["가"], corrected_standard: ["가"],
      corrected_pos: "명사", corrected_level: "초급", corrected_definition: "뜻1",
    },
  ];
  const lexemes = [
    {
      seq: "1", jeju: "가", standard: "가", partOfSpeech: "noun",
      reviewStatus: "provisional", pendingExample: true,
      bookMeta: {
        sourceId: "jeju-basic-vocab-2025", bookId: "jbv2025-0099",
        level: "초급", posLabel: "명사", definition: "뜻1",
        otherJejuForms: [], otherStandard: [],
      },
      containsPua: false,
    },
  ];
  return { lexemes, mapping, vocab, registry, ...overrides };
}

test("655 mapping completeness — 실제 production 데이터로 preflight를 통과한다", () => {
  const { lexemes, mapping, vocab, registry } = loadInputs();
  const plans = planMigration({ lexemes, mapping, vocab, registry, expectedTotal: 655 });
  assert.equal(plans.length, 655);
  const byConfidence = { A: 0, B: 0, E: 0 };
  for (const p of plans) byConfidence[p.mapping.confidence] += 1;
  assert.deepEqual(byConfidence, { A: 582, B: 42, E: 31 });
});

test("unknown seq(mapping에 없는 lexeme)가 있으면 실패한다", () => {
  const fx = makeFixture();
  fx.lexemes.push({
    seq: "999", jeju: "나", standard: "나", partOfSpeech: "noun",
    bookMeta: { sourceId: "jeju-basic-vocab-2025", bookId: "jbv2025-9999" },
  });
  assert.throws(() => planMigration(fx), /UNKNOWN_SEQ/);
});

test("mapping의 corrected_stable_id가 현재 vocab.json에 없으면 실패한다", () => {
  const fx = makeFixture();
  fx.mapping[0].corrected_stable_id = "jbv2025-p999l-y99999";
  assert.throws(() => planMigration(fx), /STABLE_ID_NOT_FOUND/);
});

test("corrected_stable_id가 registry에서 active가 아니면 실패한다", () => {
  const fx = makeFixture();
  fx.registry.entries[0].status = "orphaned";
  assert.throws(() => planMigration(fx), /AMBIGUOUS_SOURCE_RESOLVE/);
});

test("기존 legacyBookId가 예상값과 다르면 실패한다", () => {
  const fx = makeFixture();
  fx.lexemes[0].bookMeta.legacyBookId = "jbv2025-0001"; // old_bookId(0099)와 다름
  assert.throws(() => planMigration(fx), /LEGACY_BOOK_ID_MISMATCH/);
});

test("dry-run(계획 계산)은 content/lexemes.json 원본 배열을 변경하지 않는다", () => {
  const fx = makeFixture();
  const before = JSON.stringify(fx.lexemes);
  planMigration(fx);
  assert.equal(JSON.stringify(fx.lexemes), before);
});

test("write 후 655개 참조가 전부 stable reference가 된다(합성 fixture)", () => {
  const fx = makeFixture();
  const plans = planMigration(fx);
  const written = applyPlans(fx.lexemes, plans);
  for (const l of written) {
    assert.match(l.bookMeta.bookId, /^jbv2025-p\d{3}[lr]-y\d{5}$/);
    assert.equal(l.bookMeta.legacyBookId, "jbv2025-0099");
  }
});

test("두 번째 실행은 idempotent하다 — pending 변경 0건", () => {
  const fx = makeFixture();
  const plans1 = planMigration(fx);
  const written = applyPlans(fx.lexemes, plans1);

  const fx2 = { ...fx, lexemes: written };
  const plans2 = planMigration(fx2);
  const pending = plans2.filter((p) => Object.values(p.changes).some(Boolean));
  assert.equal(pending.length, 0, "두 번째 실행에서 반영할 변경이 남아있으면 안 됩니다");
});

test("E(병합 오염) row는 definition과 otherJejuForms에서 stray form이 제거된다", () => {
  const fx = makeFixture();
  fx.mapping[0].confidence = "E";
  fx.mapping[0].corrected_jeju_forms = ["가"]; // 다른 stray form 없음(현재 대표 jeju만)
  fx.lexemes[0].bookMeta.otherJejuForms = ["나쁜형태"]; // 오염된 stray form
  fx.lexemes[0].bookMeta.definition = "뜻1. 다른 개념 뜻풀이가 이어붙음.";

  const plans = planMigration(fx);
  const written = applyPlans(fx.lexemes, plans);
  assert.deepEqual(written[0].bookMeta.otherJejuForms, []);
  assert.equal(written[0].bookMeta.definition, "뜻1");
  assert.equal(plans[0].changes.definition, true);
  assert.equal(plans[0].changes.otherJejuForms, true);
});

test("top-level lexeme 필드(bookMeta 제외)는 migration으로 절대 바뀌지 않는다", () => {
  const fx = makeFixture();
  const before = snapshotTopLevel(fx.lexemes[0]);
  const plans = planMigration(fx);
  const written = applyPlans(fx.lexemes, plans);
  const after = snapshotTopLevel(written[0]);
  assert.deepEqual(diffTopLevel(before, after), []);
  // top-level partOfSpeech는 이 스크립트가 절대 건드리지 않는다는 플래그도 항상 false다.
  for (const p of plans) assert.equal(p.changes.topLevelPartOfSpeech, false);
});

test("audit row는 seq/confidence/oldBookId/newBookId/legacyBookId/changes를 가진다", () => {
  const fx = makeFixture();
  const plans = planMigration(fx);
  const rows = buildAuditRows(plans);
  assert.equal(rows.length, 1);
  assert.deepEqual(Object.keys(rows[0]).sort(), [
    "changes", "confidence", "jeju", "legacyBookId", "newBookId", "oldBookId", "seq",
  ].sort());
});

test("D 또는 F confidence가 섞여 있으면 preflight에서 즉시 실패한다", () => {
  const fx = makeFixture();
  fx.mapping[0].confidence = "D";
  assert.throws(() => planMigration(fx), /D\/F가 0이 아닙니다/);
});
