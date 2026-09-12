#!/usr/bin/env node
// Wave별 pendingExample 표제어의 예문 후보 우선순위를 출력한다.
// 자동 판정은 조사 순서일 뿐 예문 승인 판정이 아니다.
//
//   node scripts/report-example-candidates.mjs --wave 1
//
// 파일은 만들지 않는다. stdout 표만 출력한다.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const USAGE = "usage: node scripts/report-example-candidates.mjs --wave <0-9>";

const ACTION_ORDER = {
  OFFICIAL_FIRST: 0,
  CORPUS_FIRST: 1,
  CHECK_HITS: 2,
  SOURCE_GAP: 3,
};

export function parseWaveArg(argv) {
  const idx = argv.indexOf("--wave");
  if (idx === -1) {
    return { ok: false, error: `${USAGE}\nerror: --wave is required` };
  }
  const raw = argv[idx + 1];
  if (raw === undefined || raw.startsWith("-")) {
    return { ok: false, error: `${USAGE}\nerror: --wave is required` };
  }
  if (!/^[0-9]$/.test(raw)) {
    return { ok: false, error: `${USAGE}\nerror: --wave must be an integer 0-9` };
  }
  return { ok: true, wave: Number(raw) };
}

export function recommendedAction({ exactHits = 0, inflectedHits = 0, lifeDialectHits = 0 } = {}) {
  const exact = Number(exactHits) || 0;
  const inflected = Number(inflectedHits) || 0;
  const life = Number(lifeDialectHits) || 0;
  if (life > 0) return "OFFICIAL_FIRST";
  if (exact >= 3 || inflected >= 5) return "CORPUS_FIRST";
  if (exact + inflected > 0) return "CHECK_HITS";
  return "SOURCE_GAP";
}

export function selectWavePendingLexemes(units, lexemes, wave) {
  const lexBySeq = new Map((lexemes ?? []).map((l) => [String(l.seq), l]));
  const rows = [];
  for (const unit of units ?? []) {
    if (unit?.rankIndex !== wave) continue;
    for (const rawSeq of unit.wordSeqs ?? []) {
      const seq = String(rawSeq);
      const lexeme = lexBySeq.get(seq);
      if (!lexeme) {
        rows.push({
          unitId: unit.id,
          seq,
          jeju: "",
          standard: "",
          partOfSpeech: "",
          definition: "",
          otherJejuForms: [],
          missingLexeme: true,
        });
        continue;
      }
      if (lexeme.pendingExample !== true) continue;
      const bookMeta = lexeme.bookMeta ?? {};
      rows.push({
        unitId: unit.id,
        seq,
        jeju: lexeme.jeju ?? "",
        standard: lexeme.standard ?? "",
        partOfSpeech: lexeme.partOfSpeech ?? "",
        definition: bookMeta.definition ?? "",
        otherJejuForms: Array.isArray(bookMeta.otherJejuForms) ? bookMeta.otherJejuForms : [],
      });
    }
  }
  return rows;
}

export function attachAudit(rows, auditBySeq) {
  const index = auditBySeq instanceof Map ? auditBySeq : new Map();
  return rows.map((row) => {
    if (row.missingLexeme) {
      return {
        ...row,
        exactHits: 0,
        inflectedHits: 0,
        lifeDialectHits: 0,
        tier: "unconfirmed",
        recommendedAction: "SOURCE_GAP",
      };
    }
    const audit = index.get(String(row.seq));
    const exactHits = audit?.exactHits ?? 0;
    const inflectedHits = audit?.inflectedHits ?? 0;
    const lifeDialectHits = audit?.lifeDialectHits ?? 0;
    return {
      ...row,
      exactHits,
      inflectedHits,
      lifeDialectHits,
      tier: audit?.tier ?? "unconfirmed",
      recommendedAction: recommendedAction({ exactHits, inflectedHits, lifeDialectHits }),
    };
  });
}

export function sortCandidateRows(rows) {
  return [...rows].sort((a, b) => {
    const ao = ACTION_ORDER[a.recommendedAction] ?? 9;
    const bo = ACTION_ORDER[b.recommendedAction] ?? 9;
    if (ao !== bo) return ao - bo;
    if (a.unitId !== b.unitId) return String(a.unitId).localeCompare(String(b.unitId));
    return String(a.seq).localeCompare(String(b.seq), undefined, { numeric: true });
  });
}

function clip(text, max) {
  const s = String(text ?? "").replaceAll("\n", " ");
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1))}…`;
}

function forms(list) {
  if (!Array.isArray(list) || list.length === 0) return "-";
  return list.join(",");
}

export function formatTable(rows) {
  const header = [
    "unitId",
    "seq",
    "jeju",
    "standard",
    "partOfSpeech",
    "definition",
    "otherJejuForms",
    "exactHits",
    "inflectedHits",
    "lifeDialectHits",
    "tier",
    "recommendedAction",
  ];
  const counts = { OFFICIAL_FIRST: 0, CORPUS_FIRST: 0, CHECK_HITS: 0, SOURCE_GAP: 0 };
  for (const row of rows) {
    if (counts[row.recommendedAction] !== undefined) counts[row.recommendedAction] += 1;
  }
  const lines = [
    `# pendingExample candidates  ${rows.length} rows`,
    `# OFFICIAL_FIRST ${counts.OFFICIAL_FIRST}  CORPUS_FIRST ${counts.CORPUS_FIRST}  CHECK_HITS ${counts.CHECK_HITS}  SOURCE_GAP ${counts.SOURCE_GAP}`,
    "",
    header.join("\t"),
  ];
  for (const row of rows) {
    lines.push(
      [
        row.unitId,
        row.seq,
        row.jeju,
        row.standard,
        row.partOfSpeech,
        clip(row.definition, 48),
        forms(row.otherJejuForms),
        row.exactHits,
        row.inflectedHits,
        row.lifeDialectHits,
        row.tier,
        row.recommendedAction,
      ].join("\t"),
    );
  }
  return lines.join("\n") + "\n";
}

export function loadJson(relPath) {
  return JSON.parse(readFileSync(path.join(ROOT, relPath), "utf8"));
}

export function auditIndexFromFile(audit) {
  const map = new Map();
  for (const row of audit?.rows ?? []) {
    map.set(String(row.seq), row);
  }
  return map;
}

function main(argv = process.argv.slice(2)) {
  const parsed = parseWaveArg(argv);
  if (!parsed.ok) {
    console.error(parsed.error);
    process.exitCode = 1;
    return;
  }

  // tokens.json / 생활방언 source는 감사 산출과 같은 근거 파일이라는 계약.
  // 히트 숫자는 word-usage-audit.json을 쓴다(재계산하지 않음).
  loadJson("data/aihub/tokens.json");
  loadJson("data/life-dialect/items.json");

  const units = loadJson("content/units.json");
  const lexemes = loadJson("content/lexemes.json");
  const audit = loadJson("data/aihub/word-usage-audit.json");
  const rows = sortCandidateRows(
    attachAudit(selectWavePendingLexemes(units, lexemes, parsed.wave), auditIndexFromFile(audit)),
  );
  process.stdout.write(formatTable(rows));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
