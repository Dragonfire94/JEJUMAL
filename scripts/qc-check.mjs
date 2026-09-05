#!/usr/bin/env node
// content/qc-rules.yaml에 문서화된 규칙들을 units 데이터에 대해 실제로 실행하고,
// 사람이 읽을 수 있는 보고서를 콘솔과(옵션) 마크다운 파일로 출력한다.
//
//   node scripts/qc-check.mjs                 # src/data/units.json 검사, 콘솔 출력
//   node scripts/qc-check.mjs --out report.md # 보고서를 파일로도 저장
//
// error 등급 규칙을 하나라도 위반하면 exit code 1을 반환해 CI에서 실패시킬 수
// 있다. warn 등급은 보고서에는 나오지만 exit code에는 영향을 주지 않는다 —
// 전사적으로 이미 알려져 있고 다음 라운드로 계획된 문제(예: 종결어미 편중)를
// 위한 등급이다.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const finalConsonant = (ch) => {
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return null;
  return code % 28;
};

const PARTICLE_PAIRS = [
  ["이", "가", "이/가"],
  ["을", "를", "을/를"],
  ["은", "는", "은/는"],
  ["과", "와", "과/와"],
];

const KNOWN_ENDINGS = ["마씸", "수다", "우다", "읍주", "읍서", "수과", "우꽈", "수꽈", "읍네다", "수게", "저", "주", "게", "라"];
function ending(jeju) {
  const trimmed = jeju.replace(/[.?!\s]+$/, "");
  for (const e of KNOWN_ENDINGS) {
    if (trimmed.endsWith(e)) return e;
  }
  return "기타";
}

/**
 * content/qc-rules.yaml에 나열된 규칙들을 실행한다.
 * @param {Array} units - src/data/units.json과 같은 형태의 유닛 배열
 * @returns {{id:string, severity:"error"|"warn", message:string}[]}
 */
export function runChecks(units) {
  const words = units.flatMap((u) => u.words);
  const findings = [];
  const add = (id, severity, message) => findings.push({ id, severity, message });

  // DUPLICATE_SEQ
  {
    const seen = new Map();
    for (const w of words) seen.set(w.seq, (seen.get(w.seq) ?? 0) + 1);
    for (const [seq, count] of seen) {
      if (count > 1) add("DUPLICATE_SEQ", "error", `seq ${seq}가 ${count}번 등장`);
    }
  }

  // UNIT_SIZE
  for (const u of units) {
    if (u.words.length !== 10) {
      add("UNIT_SIZE", "error", `유닛 ${u.id}의 단어 수가 ${u.words.length}개 (10개여야 함)`);
    }
  }

  // POLITE_ENDING
  const bareDictionaryEnding = /(?<!니)(?<!습니)다\.$/;
  for (const w of words) {
    for (const ex of w.examples ?? []) {
      if (bareDictionaryEnding.test(ex.standard) && !ex.standard.endsWith("니다.")) {
        add("POLITE_ENDING", "error", `seq ${w.seq}(${w.jeju}) 표준어 예문이 사전 인용형으로 끝남: "${ex.standard}"`);
      }
    }
  }

  // NO_FORMATTING_ARTIFACTS
  for (const w of words) {
    for (const [label, text] of (w.examples ?? []).flatMap((ex) => [
      ["jeju", ex.jeju],
      ["standard", ex.standard],
    ])) {
      if (!text || / {2}/.test(text) || text !== text.trim() || !/[.?!]$/.test(text)) {
        add("NO_FORMATTING_ARTIFACTS", "error", `seq ${w.seq} ${label} 형식 오류: "${text}"`);
      }
    }
    if (/[>=⇒]/.test(w.standard) || w.standard.startsWith("-") || w.standard.endsWith("-")) {
      add("NO_FORMATTING_ARTIFACTS", "error", `seq ${w.seq} standard 필드 오염: "${w.standard}"`);
    }
  }

  // PARTICLE_AGREEMENT
  // 문장 전체를 형태소 분석 없이 스캔하면 "장가"(고유어), "있는"/"집는"(용언 활용
  // "-는"), "닷가"(바닷가) 같은 데서 대량 오탐이 난다. 그래서 표제어(word.standard)
  // 뜻이 예문에 등장하는 바로 그 자리 뒤에 오는 조사로만 범위를 좁힌다 — 이 경우엔
  // 어떤 명사에 붙는 조사인지 알고 있으므로 정확히 판단할 수 있다.
  for (const w of words) {
    const noun = w.standard;
    const lastChar = noun[noun.length - 1];
    const fc = finalConsonant(lastChar);
    if (fc === null) continue;
    for (const ex of w.examples ?? []) {
      const idx = ex.standard.indexOf(noun);
      if (idx === -1) continue;
      const after = ex.standard.slice(idx + noun.length, idx + noun.length + 3);
      for (const [withBatchim, withoutBatchim, label] of PARTICLE_PAIRS) {
        if (after.startsWith(withBatchim) && fc === 0) {
          add("PARTICLE_AGREEMENT", "error", `seq ${w.seq}(${noun}) "${label}" 불일치(받침 없음): "${noun}${withBatchim}"`);
        }
        if (after.startsWith(withoutBatchim) && fc !== 0) {
          add("PARTICLE_AGREEMENT", "error", `seq ${w.seq}(${noun}) "${label}" 불일치(받침 있음): "${noun}${withoutBatchim}"`);
        }
      }
      if (after.startsWith("으로") && (fc === 0 || fc === 8)) {
        add("PARTICLE_AGREEMENT", "error", `seq ${w.seq}(${noun}) "으로/로" 불일치: "${noun}으로"`);
      }
      if (after.startsWith("로 ") && fc !== 0 && fc !== 8) {
        add("PARTICLE_AGREEMENT", "error", `seq ${w.seq}(${noun}) "으로/로" 불일치(받침 있음): "${noun}로"`);
      }
    }
  }

  // NO_EXACT_DUPLICATE_EXAMPLES
  {
    const byStandard = new Map();
    const byJeju = new Map();
    for (const w of words) {
      for (const ex of w.examples ?? []) {
        if (!byStandard.has(ex.standard)) byStandard.set(ex.standard, []);
        byStandard.get(ex.standard).push(w.seq);
        if (!byJeju.has(ex.jeju)) byJeju.set(ex.jeju, []);
        byJeju.get(ex.jeju).push(w.seq);
      }
    }
    for (const [text, seqs] of byStandard) {
      if (seqs.length > 1) add("NO_EXACT_DUPLICATE_EXAMPLES", "error", `표준어 예문 중복 (seq ${seqs.join(", ")}): "${text}"`);
    }
    for (const [text, seqs] of byJeju) {
      if (seqs.length > 1) add("NO_EXACT_DUPLICATE_EXAMPLES", "error", `제주어 예문 중복 (seq ${seqs.join(", ")}): "${text}"`);
    }
  }

  // NO_ADJACENT_WORD_DUPLICATION
  for (const w of words) {
    if (w.jeju.length < 2) continue;
    const doubled = `${w.jeju} ${w.jeju}`;
    for (const ex of w.examples ?? []) {
      if (ex.standard.includes(doubled) || ex.jeju.includes(doubled)) {
        add("NO_ADJACENT_WORD_DUPLICATION", "error", `seq ${w.seq} 표제어가 인접 중복: "${ex.jeju}"`);
      }
    }
  }

  // ENDING_DIVERSITY_PER_UNIT / TOP_ENDING_SHARE
  {
    const globalCounts = new Map();
    for (const u of units) {
      const endings = u.words.flatMap((w) => (w.examples ?? []).map((ex) => ending(ex.jeju)));
      for (const e of endings) globalCounts.set(e, (globalCounts.get(e) ?? 0) + 1);
      const uniqueEndings = new Set(endings).size;
      if (uniqueEndings <= 2) {
        add("ENDING_DIVERSITY_PER_UNIT", "warn", `유닛 ${u.id}은(는) 종결어미가 ${uniqueEndings}종뿐`);
      }
    }
    const total = [...globalCounts.values()].reduce((a, b) => a + b, 0);
    if (total > 0) {
      const [topEnding, topCount] = [...globalCounts.entries()].sort((a, b) => b[1] - a[1])[0];
      const topShare = topCount / total;
      if (topShare > 0.25) {
        add(
          "TOP_ENDING_SHARE",
          "warn",
          `최다 종결어미 "-${topEnding}"이(가) 전체의 ${(topShare * 100).toFixed(1)}%(${topCount}/${total})를 차지 (목표: 25% 이하)`,
        );
      }
    }
  }

  return findings;
}

export function formatReport(findings, { wordCount, unitCount }) {
  const bySeverity = {
    error: findings.filter((f) => f.severity === "error"),
    warn: findings.filter((f) => f.severity === "warn"),
  };
  const byRule = new Map();
  for (const f of findings) {
    if (!byRule.has(f.id)) byRule.set(f.id, []);
    byRule.get(f.id).push(f);
  }

  const lines = [];
  lines.push(`# JEJUMAL QC 보고서`);
  lines.push("");
  lines.push(`- 검사 대상: ${wordCount}개 단어, ${unitCount}개 유닛`);
  lines.push(`- error: ${bySeverity.error.length}건 / warn: ${bySeverity.warn.length}건`);
  lines.push("");
  for (const [ruleId, items] of byRule) {
    lines.push(`## ${ruleId} (${items[0].severity}, ${items.length}건)`);
    for (const item of items.slice(0, 30)) lines.push(`- ${item.message}`);
    if (items.length > 30) lines.push(`- ... 외 ${items.length - 30}건`);
    lines.push("");
  }
  if (findings.length === 0) {
    lines.push("모든 규칙 통과.");
  }
  return lines.join("\n");
}

function main() {
  const units = JSON.parse(readFileSync(path.join(ROOT, "src/data/units.json"), "utf8"));
  const findings = runChecks(units);
  const wordCount = units.flatMap((u) => u.words).length;
  const report = formatReport(findings, { wordCount, unitCount: units.length });

  console.log(report);

  const outIndex = process.argv.indexOf("--out");
  if (outIndex !== -1 && process.argv[outIndex + 1]) {
    writeFileSync(process.argv[outIndex + 1], report + "\n", "utf8");
  }

  if (findings.some((f) => f.severity === "error")) {
    process.exitCode = 1;
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) main();
