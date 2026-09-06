#!/usr/bin/env node
// 종결어미 분포를 측정한다 — 4차(docs/product-improvement-plan.md P1-2) 작업의
// 계측 도구. qc-check.mjs의 ENDING_DIVERSITY_PER_UNIT/TOP_ENDING_SHARE가 쓰는
// 것과 같은 KNOWN_ENDINGS/ending() 규칙을 따로 유지하지 않기 위해 여기서
// export하고 qc-check.mjs가 이 모듈을 가져다 쓴다.
//
//   node scripts/measure-endings.mjs            # 앱(src/data/units.json) 분포
//   node scripts/measure-endings.mjs --life      # 생활방언 100편 분포(비교 기준)
//
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

export const KNOWN_ENDINGS = [
  "마씸", "수다", "우다", "읍주", "읍서", "수과", "우꽈", "수꽈", "읍네다", "수게", "저", "주", "게", "라",
];

export function ending(jeju) {
  const trimmed = jeju.replace(/[.?!\s]+$/, "");
  for (const e of KNOWN_ENDINGS) {
    if (trimmed.endsWith(e)) return e;
  }
  return "기타";
}

export function distribution(sentences) {
  const counts = new Map();
  for (const s of sentences) {
    const e = ending(s);
    counts.set(e, (counts.get(e) ?? 0) + 1);
  }
  const total = sentences.length;
  return [...counts.entries()]
    .map(([e, c]) => ({ ending: e, count: c, share: total ? c / total : 0 }))
    .sort((a, b) => b.count - a.count);
}

export function unitsUnderThreshold(units, maxDistinct = 2) {
  return units
    .map((u) => {
      const distinct = new Set(u.words.flatMap((w) => (w.examples ?? []).map((ex) => ending(ex.jeju))));
      return { id: u.id, distinct: distinct.size };
    })
    .filter((row) => row.distinct <= maxDistinct);
}

function loadAppSentences() {
  const units = JSON.parse(readFileSync(path.join(ROOT, "src/data/units.json"), "utf8"));
  const sentences = units.flatMap((u) => u.words.flatMap((w) => (w.examples ?? []).map((ex) => ex.jeju)));
  return { units, sentences };
}

function loadLifeDialectSentences() {
  const items = JSON.parse(readFileSync(path.join(ROOT, "data/life-dialect/items.json"), "utf8"));
  return items.flatMap((it) =>
    it.contents
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
  );
}

function report(label, sentences) {
  console.log(`\n## ${label} (문장 ${sentences.length}개)`);
  for (const row of distribution(sentences).slice(0, 15)) {
    console.log(`  ${row.ending.padEnd(6)} ${String(row.count).padStart(4)}  ${(row.share * 100).toFixed(1)}%`);
  }
}

function main() {
  const wantLife = process.argv.includes("--life");
  if (wantLife) {
    report("생활방언 100편 (jeju.go.kr 공식 자료, 현대 표기)", loadLifeDialectSentences());
    console.log(
      "\n참고: 생활방언은 KNOWN_ENDINGS 밖의 '기타'가 압도적으로 많다 — 실제 구어는 훨씬" +
        " 다양한 종결형을 쓴다는 뜻이다. 위 표는 상위 15개만 보여준다.",
    );
    return;
  }
  const { units, sentences } = loadAppSentences();
  report("앱 예문 (src/data/units.json)", sentences);
  const under = unitsUnderThreshold(units, 2);
  console.log(`\n종결어미 2종 이하인 유닛: ${under.length}/${units.length}`);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) main();
