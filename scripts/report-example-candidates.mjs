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

/** 표제어 끝의 동형이의 번호(ASCII/위첨자)만 벗긴다. 중간 숫자는 건드리지 않는다. */
const HOMOGRAPH_NUMBER_SUFFIX = /[0-9¹²³⁴⁵⁶⁷⁸⁹⁰]+$/u;

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

export function stripHomographNumber(headword) {
  return String(headword ?? "").replace(HOMOGRAPH_NUMBER_SUFFIX, "");
}

export function searchForms({ jeju = "", otherJejuForms = [] } = {}) {
  const out = [];
  const seen = new Set();
  const add = (value) => {
    const form = String(value ?? "").trim();
    if (!form || seen.has(form)) return;
    seen.add(form);
    out.push(form);
  };
  add(jeju);
  for (const form of otherJejuForms ?? []) add(form);
  add(stripHomographNumber(jeju));
  for (const form of otherJejuForms ?? []) add(stripHomographNumber(form));
  return out;
}

function globCore(standard) {
  return String(standard ?? "")
    .split(/[.(]/)[0]
    .trim();
}

export function meaningMatches(core, standard, isVerbLike = false) {
  const c = String(core ?? "").trim();
  const s = String(standard ?? "").trim();
  if (!c || !s) return false;
  if (isVerbLike && c.endsWith("다") && c.length > 1) {
    const stem = c.slice(0, -1);
    if (stem && s.startsWith(stem)) return true;
  }
  if (c.length <= 1 || s.length <= 1) return c === s;
  return s.includes(c) || c.includes(s);
}

function senseMatchedHits(entries, standard, isVerbLike) {
  if (!Array.isArray(entries) || entries.length === 0) return 0;
  const core = globCore(standard);
  let n = 0;
  for (const row of entries) {
    const mapped = Array.isArray(row) ? row[0] : row;
    const count = Array.isArray(row) ? Number(row[1]) || 0 : 0;
    if (meaningMatches(core, mapped, isVerbLike)) n += count;
  }
  return n;
}

function tokenEntries(tokens, form) {
  if (!tokens || !form) return [];
  if (tokens instanceof Map) return tokens.get(form) ?? [];
  return tokens[form] ?? [];
}

export function supplementalEvidence({
  jeju = "",
  standard = "",
  otherJejuForms = [],
  partOfSpeech = "",
  tokens,
} = {}) {
  const isVerbLike = partOfSpeech === "verb" || partOfSpeech === "adjective";
  const original = String(jeju ?? "").trim();
  const normalized = stripHomographNumber(original);
  const others = (otherJejuForms ?? []).map((f) => String(f ?? "").trim()).filter(Boolean);

  let normalizedHits = 0;
  if (normalized && normalized !== original) {
    normalizedHits = senseMatchedHits(tokenEntries(tokens, normalized), standard, isVerbLike);
  }

  const countedOther = new Set([original, normalized]);
  let otherHits = 0;
  for (const form of others) {
    const variants = [form, stripHomographNumber(form)];
    for (const variant of variants) {
      if (!variant || countedOther.has(variant)) continue;
      countedOther.add(variant);
      otherHits += senseMatchedHits(tokenEntries(tokens, variant), standard, isVerbLike);
    }
  }

  const supplementalTokenHits = normalizedHits + otherHits;
  let candidateEvidence = "NONE";
  if (normalizedHits > 0) candidateEvidence = "HEADWORD_NORMALIZED";
  else if (otherHits > 0) candidateEvidence = "OTHER_FORM";
  return { searchForms: searchForms({ jeju: original, otherJejuForms: others }), supplementalTokenHits, candidateEvidence };
}

export function recommendedAction({
  exactHits = 0,
  inflectedHits = 0,
  lifeDialectHits = 0,
  supplementalTokenHits = 0,
  candidateEvidence = "NONE",
} = {}) {
  const exact = Number(exactHits) || 0;
  const inflected = Number(inflectedHits) || 0;
  const life = Number(lifeDialectHits) || 0;
  if (life > 0) return "OFFICIAL_FIRST";
  if (exact >= 3 || inflected >= 5) return "CORPUS_FIRST";
  if (exact + inflected > 0) return "CHECK_HITS";
  // audit가 0이어도 정규화/이형태에서 의미 일치 token이 있으면 조사 대상으로 올린다.
  // 동형이의어 오염 위험이 있어 raw pair 확인 전 최대 CHECK_HITS.
  const extra = Number(supplementalTokenHits) || 0;
  if (extra > 0 && (candidateEvidence === "HEADWORD_NORMALIZED" || candidateEvidence === "OTHER_FORM")) {
    return "CHECK_HITS";
  }
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

export function attachAudit(rows, auditBySeq, { tokens } = {}) {
  const index = auditBySeq instanceof Map ? auditBySeq : new Map();
  return rows.map((row) => {
    if (row.missingLexeme) {
      return {
        ...row,
        exactHits: 0,
        inflectedHits: 0,
        lifeDialectHits: 0,
        tier: "unconfirmed",
        searchForms: [],
        supplementalTokenHits: 0,
        candidateEvidence: "NONE",
        recommendedAction: "SOURCE_GAP",
      };
    }
    const audit = index.get(String(row.seq));
    const exactHits = audit?.exactHits ?? 0;
    const inflectedHits = audit?.inflectedHits ?? 0;
    const lifeDialectHits = audit?.lifeDialectHits ?? 0;
    const extra = supplementalEvidence({
      jeju: row.jeju,
      standard: row.standard,
      otherJejuForms: row.otherJejuForms,
      partOfSpeech: row.partOfSpeech,
      tokens,
    });
    let candidateEvidence = extra.candidateEvidence;
    if ((Number(exactHits) || 0) + (Number(inflectedHits) || 0) + (Number(lifeDialectHits) || 0) > 0) {
      candidateEvidence = "AUDIT";
    }
    return {
      ...row,
      exactHits,
      inflectedHits,
      lifeDialectHits,
      tier: audit?.tier ?? "unconfirmed",
      searchForms: extra.searchForms,
      supplementalTokenHits: extra.supplementalTokenHits,
      candidateEvidence,
      recommendedAction: recommendedAction({
        exactHits,
        inflectedHits,
        lifeDialectHits,
        supplementalTokenHits: extra.supplementalTokenHits,
        candidateEvidence,
      }),
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
    "searchForms",
    "supplementalTokenHits",
    "candidateEvidence",
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
        forms(row.searchForms),
        row.supplementalTokenHits ?? 0,
        row.candidateEvidence ?? "NONE",
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
  // audit 숫자는 word-usage-audit.json을 쓰고, 번호 정규화·이형태만 tokens로 보강한다.
  const tokens = loadJson("data/aihub/tokens.json");
  loadJson("data/life-dialect/items.json");

  const units = loadJson("content/units.json");
  const lexemes = loadJson("content/lexemes.json");
  const audit = loadJson("data/aihub/word-usage-audit.json");
  const rows = sortCandidateRows(
    attachAudit(selectWavePendingLexemes(units, lexemes, parsed.wave), auditIndexFromFile(audit), { tokens }),
  );
  process.stdout.write(formatTable(rows));
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) main();
