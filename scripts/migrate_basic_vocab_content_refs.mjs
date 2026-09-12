#!/usr/bin/env node
// 3B-1B 당시 mapping(content-migration-mapping-3a.json)으로 확정된
// **historical 655건 cohort**의 content/lexemes.json 참조(bookMeta.bookId)를
// 순번 기반 jbv2025-XXXX에서 production stableId(jbv2025-p...-y...)로
// 옮기고, 구 extractor의 병합 오류로 오염된 bookMeta(definition/
// otherJejuForms/posLabel/level)만 corrected source 기준으로 정제한다.
//
// 중요: 이 655는 "2025 기본어휘 출처 lexeme은 영원히 655개"라는 뜻이
// 아니라, 3B-1B가 migration해야 했던 당시 historical cohort의 크기다.
// migration 대상은 mapping 파일의 seq가 정의하며, 이후 3C 등에서 새로
// 추가되는 2025-source lexeme(예: 삼춘/나냥으로, stable ID로 처음부터
// 생성됨)은 이 mapping cohort 밖이라 이 스크립트가 건드리지 않는다
// (3C-3A.1, `docs/basic-vocab-2025-content-reference-migration.md` 참고).
//
// 단어 자체(jeju/standard), top-level partOfSpeech, 유닛 배치, 예문,
// 신규 71개 추가는 이 스크립트가 절대 건드리지 않는다 — 3B-2/3C의 몫.
//
//   node scripts/migrate_basic_vocab_content_refs.mjs --dry-run
//   node scripts/migrate_basic_vocab_content_refs.mjs --write
//
// source of truth 3가지: content/lexemes.json, content-migration-mapping-3a.json,
// production vocab.json(+registry) — mapping의 corrected_stable_id를
// 무조건 믿지 않고 매번 현재 vocab.json/registry와 다시 교차검증한다.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const LEXEMES_PATH = path.join(ROOT, "content/lexemes.json");
const MAPPING_PATH = path.join(ROOT, "data/jeju-basic-vocab-2025/content-migration-mapping-3a.json");
const VOCAB_PATH = path.join(ROOT, "data/jeju-basic-vocab-2025/vocab.json");
const REGISTRY_PATH = path.join(ROOT, "data/jeju-basic-vocab-2025/stable-id-registry.json");
const AUDIT_OUT_PATH = path.join(ROOT, "data/jeju-basic-vocab-2025/content-migration-applied-3b1b.json");

// 이번 단계에서 절대 바뀌면 안 되는 top-level lexeme 필드(bookMeta 제외).
const TOP_LEVEL_FIELDS = [
  "seq", "jeju", "standard", "partOfSpeech",
  "reviewStatus", "pendingExample", "pendingPlacement", "containsPua",
];

const PUA_RE = /[-]/g;
const stripPua = (s) => (s ?? "").replace(PUA_RE, "");

function readJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

export function loadInputs() {
  return {
    lexemes: readJson(LEXEMES_PATH),
    mapping: readJson(MAPPING_PATH),
    vocab: readJson(VOCAB_PATH),
    registry: readJson(REGISTRY_PATH),
  };
}

export function snapshotTopLevel(lexeme) {
  const snap = {};
  for (const f of TOP_LEVEL_FIELDS) snap[f] = lexeme[f];
  return snap;
}

export function diffTopLevel(before, after) {
  const changed = [];
  for (const f of TOP_LEVEL_FIELDS) {
    if (JSON.stringify(before[f]) !== JSON.stringify(after[f])) changed.push(f);
  }
  return changed;
}

/**
 * historical migration cohort(mapping 파일의 seq들)의 migration 계획을
 * 세운다. content/lexemes.json을 수정하지 않고 순수하게 계획(plan)만
 * 계산한다 — dry-run/write 둘 다 이 함수를 쓴다.
 *
 * 대상 선정 기준은 "현재 content/lexemes.json에 있는 모든 2025-source
 * lexeme"이 아니라 **mapping 파일이 정의하는 historical cohort**다.
 * 이후(3C 등) 새로 추가되는 2025-source lexeme은 mapping에 없는 게
 * 정상이므로 이 함수가 무시한다 — 반대로 mapping cohort의 seq가
 * content/lexemes.json에서 사라지거나 sourceId가 어긋나면 여전히
 * hard-fail한다(cohort의 integrity는 계속 엄격하게 검사).
 *
 * 문제가 있으면(mapping row 수 불일치, mapped seq 누락/sourceId 불일치,
 * stableId가 vocab/registry에 없음, D/F 존재, legacyBookId 불일치 등)
 * 즉시 던진다 — 부분 적용을 허용하지 않는다.
 */
export function planMigration({ lexemes, mapping, vocab, registry, expectedTotal = null }) {
  const stableIdSet = new Set(vocab.entries.map((e) => e.stableId));
  const activeRegistryIds = new Set(
    registry.entries.filter((r) => r.status === "active").map((r) => r.stableId),
  );

  if (expectedTotal !== null) {
    if (mapping.length !== expectedTotal) {
      throw new Error(`mapping rows가 ${expectedTotal}가 아닙니다: ${mapping.length}`);
    }
    const uniqueSeq = new Set(mapping.map((m) => m.seq));
    if (uniqueSeq.size !== expectedTotal) {
      throw new Error(`mapping unique seq가 ${expectedTotal}가 아닙니다: ${uniqueSeq.size}`);
    }
  }
  const dCount = mapping.filter((m) => m.confidence === "D").length;
  const fCount = mapping.filter((m) => m.confidence === "F").length;
  if (dCount !== 0 || fCount !== 0) {
    throw new Error(`D/F가 0이 아닙니다(D=${dCount}, F=${fCount}) — 다중 후보/대응 없음 항목은 이 스크립트로 자동 처리하지 않는다`);
  }

  const lexemeBySeq = new Map(lexemes.map((l) => [l.seq, l]));
  const plans = [];

  for (const m of mapping) {
    const lexeme = lexemeBySeq.get(m.seq);
    if (!lexeme) {
      throw new Error(
        `MAPPED_SEQ_NOT_FOUND: mapping seq ${m.seq}가 content/lexemes.json에 없습니다 — ` +
        "historical cohort의 lexeme이 삭제되었을 수 있습니다",
      );
    }
    if (lexeme.bookMeta?.sourceId !== "jeju-basic-vocab-2025") {
      throw new Error(
        `MAPPED_SEQ_SOURCE_MISMATCH: seq ${m.seq}(${lexeme.jeju})의 bookMeta.sourceId가 ` +
        "jeju-basic-vocab-2025가 아니거나 bookMeta 자체가 없습니다",
      );
    }
    if (!stableIdSet.has(m.corrected_stable_id)) {
      throw new Error(
        `STABLE_ID_NOT_FOUND: seq ${lexeme.seq}: mapping의 corrected_stable_id(${m.corrected_stable_id})가 ` +
        "현재 vocab.json에 없습니다 — 3A 산출물이 stale할 수 있습니다(extractor가 그 뒤 다시 실행됐는지 확인)",
      );
    }
    if (!activeRegistryIds.has(m.corrected_stable_id)) {
      throw new Error(
        `AMBIGUOUS_SOURCE_RESOLVE: seq ${lexeme.seq}: corrected_stable_id(${m.corrected_stable_id})가 ` +
        "registry에서 active 상태가 아닙니다",
      );
    }

    const expectedLegacy = m.old_bookId;
    const hasLegacy = Object.prototype.hasOwnProperty.call(lexeme.bookMeta, "legacyBookId");
    if (hasLegacy && lexeme.bookMeta.legacyBookId !== expectedLegacy) {
      throw new Error(
        `LEGACY_BOOK_ID_MISMATCH: seq ${lexeme.seq}: 기존 legacyBookId(${lexeme.bookMeta.legacyBookId})가 ` +
        `예상값(${expectedLegacy})과 다릅니다 — migration을 중단합니다`,
      );
    }

    const changes = {
      reference: false,
      definition: false,
      otherJejuForms: false,
      bookPosLabel: false,
      bookLevel: false,
      topLevelPartOfSpeech: false, // 이 스크립트는 절대 건드리지 않으므로 항상 false
    };

    const newBookMeta = { ...lexeme.bookMeta };

    changes.reference = lexeme.bookMeta.bookId !== m.corrected_stable_id;
    newBookMeta.bookId = m.corrected_stable_id;
    newBookMeta.legacyBookId = expectedLegacy;

    if (m.confidence === "E") {
      if (newBookMeta.definition !== m.corrected_definition) {
        changes.definition = true;
      }
      newBookMeta.definition = m.corrected_definition;

      // otherJejuForms: corrected entry의 jeju_forms 중 현재 lexeme의
      // 대표 jeju(PUA 제거 후 비교)와 다른 것만 남긴다 — 다른 독립
      // source entry의 제주어가 섞여 들어오지 않는다(corrected_jeju_forms
      // 자체가 이미 이 하나의 corrected entry에서만 온 것이므로 안전).
      const primary = stripPua(lexeme.jeju);
      const newOther = m.corrected_jeju_forms.filter((f) => stripPua(f) !== primary);
      const oldOther = newBookMeta.otherJejuForms ?? [];
      if (JSON.stringify(oldOther) !== JSON.stringify(newOther)) {
        changes.otherJejuForms = true;
      }
      newBookMeta.otherJejuForms = newOther;
    }

    if (m.confidence === "B" || m.confidence === "E") {
      if (newBookMeta.posLabel !== m.corrected_pos) {
        changes.bookPosLabel = true;
      }
      newBookMeta.posLabel = m.corrected_pos;

      if (newBookMeta.level !== m.corrected_level) {
        changes.bookLevel = true;
      }
      newBookMeta.level = m.corrected_level;
    }

    plans.push({ lexeme, mapping: m, newBookMeta, changes });
  }

  return plans;
}

export function applyPlans(lexemes, plans) {
  const planBySeq = new Map(plans.map((p) => [p.lexeme.seq, p]));
  return lexemes.map((lexeme) => {
    const plan = planBySeq.get(lexeme.seq);
    if (!plan) return lexeme;
    return { ...lexeme, bookMeta: plan.newBookMeta };
  });
}

export function buildAuditRows(plans) {
  return plans.map((p) => ({
    seq: p.lexeme.seq,
    jeju: p.lexeme.jeju,
    confidence: p.mapping.confidence,
    oldBookId: p.mapping.old_bookId,
    newBookId: p.mapping.corrected_stable_id,
    legacyBookId: p.mapping.old_bookId,
    changes: p.changes,
  }));
}

function pendingCount(plans) {
  return plans.filter((p) => Object.values(p.changes).some(Boolean)).length;
}

function printSummary(plans) {
  const byConfidence = { A: 0, B: 0, E: 0 };
  for (const p of plans) byConfidence[p.mapping.confidence] += 1;
  console.log(`migration 대상: ${plans.length}건 (A=${byConfidence.A}, B=${byConfidence.B}, E=${byConfidence.E})`);
  console.log(`  reference 변경: ${plans.filter((p) => p.changes.reference).length}건`);
  console.log(`  definition 교정: ${plans.filter((p) => p.changes.definition).length}건`);
  console.log(`  otherJejuForms 교정: ${plans.filter((p) => p.changes.otherJejuForms).length}건`);
  console.log(`  bookMeta.posLabel 교정: ${plans.filter((p) => p.changes.bookPosLabel).length}건`);
  console.log(`  bookMeta.level 교정: ${plans.filter((p) => p.changes.bookLevel).length}건`);
  console.log(`  아직 반영 안 된 변경(pending): ${pendingCount(plans)}건`);
}

function printEPreview(plans) {
  const eRows = plans.filter((p) => p.mapping.confidence === "E");
  console.log(`\nE(병합 오염 정제) ${eRows.length}건 미리보기:`);
  console.log("seq\tjeju\told bookId\tnew bookId\tdef changed\tremoved stray forms\tposLabel corrected");
  for (const p of eRows) {
    const oldOther = p.lexeme.bookMeta.otherJejuForms ?? [];
    const removed = oldOther.filter((f) => !p.newBookMeta.otherJejuForms.includes(f));
    console.log(
      [
        p.lexeme.seq,
        p.lexeme.jeju,
        p.mapping.old_bookId,
        p.mapping.corrected_stable_id,
        p.changes.definition,
        JSON.stringify(removed),
        p.changes.bookPosLabel,
      ].join("\t"),
    );
  }
}

function main() {
  const args = process.argv.slice(2);
  const write = args.includes("--write");
  const dryRun = args.includes("--dry-run") || !write;

  const { lexemes, mapping, vocab, registry } = loadInputs();

  // top-level diff guard: migration 전 스냅샷
  const beforeSnapshots = new Map(lexemes.map((l) => [l.seq, snapshotTopLevel(l)]));

  const plans = planMigration({ lexemes, mapping, vocab, registry, expectedTotal: 655 });
  printSummary(plans);
  printEPreview(plans);

  if (dryRun) {
    console.log("\n[dry-run] content/lexemes.json은 수정하지 않았습니다. --write로 실제 반영하세요.");
    return;
  }

  const newLexemes = applyPlans(lexemes, plans);

  // top-level diff guard: migration 후 검증(0건이어야 함)
  const violations = [];
  for (const lexeme of newLexemes) {
    const before = beforeSnapshots.get(lexeme.seq);
    if (!before) continue; // 이 스크립트가 만든 lexeme은 없음(신규 추가 안 함)
    const changed = diffTopLevel(before, lexeme);
    if (changed.length > 0) violations.push({ seq: lexeme.seq, changed });
  }
  if (violations.length > 0) {
    throw new Error(
      `TOP_LEVEL_FIELD_CHANGED: 다음 lexeme의 top-level 필드가 바뀌었습니다(허용 0건):\n` +
      violations.map((v) => `  seq ${v.seq}: ${v.changed.join(", ")}`).join("\n"),
    );
  }
  if (newLexemes.length !== lexemes.length) {
    throw new Error(`LEXEME_COUNT_CHANGED: ${lexemes.length} -> ${newLexemes.length} (신규 추가/삭제 없어야 함)`);
  }

  writeFileSync(LEXEMES_PATH, JSON.stringify(newLexemes, null, 2) + "\n", "utf8");

  const pending = pendingCount(plans);
  if (pending === 0) {
    // idempotent 재실행(이미 전부 반영된 상태) — 기존 audit artifact를
    // "0건 변경"으로 덮어써서 실제 migration 기록을 지우지 않는다.
    console.log(`\n[write] content/lexemes.json 갱신 완료(변경 0건 — 이미 반영된 상태, idempotent).`);
    console.log(`[write] audit artifact는 그대로 둡니다(기존 migration 기록 보존): ${AUDIT_OUT_PATH}`);
  } else {
    const auditRows = buildAuditRows(plans);
    writeFileSync(AUDIT_OUT_PATH, JSON.stringify(auditRows, null, 2) + "\n", "utf8");
    console.log(`\n[write] content/lexemes.json 갱신 완료(${plans.length}건 처리, 그 중 ${pending}건 실제 변경).`);
    console.log(`[write] audit artifact 저장: ${AUDIT_OUT_PATH}`);
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    main();
  } catch (error) {
    console.error(error.message ?? error);
    process.exitCode = 1;
  }
}
