#!/usr/bin/env node
// 종결어미 편중 유닛(ENDING_DIVERSITY_PER_UNIT)을 기계적으로 안전한 범위에서
// 완화한다 — 4차(docs/product-improvement-plan.md P1-2) 작업.
//
// 방식: "-수다."/"-우다." 로 끝나는 평서문을, 제주어에서 그 평서형과 항상
// 짝을 이루는 의문형 "-수과?"/"-우꽈?" 로 바꾼다. 이 짝은 지어낸 규칙이
// 아니라 생활방언 100편(공식 자료)에 실제로 등장하는 형태이고
// (data/life-dialect), 표준어 "-습니다"/"-습니까?"와 정확히 대응하는
// 합쇼체 평서/의문 쌍이라 앞의 어간이 무엇이든 항상 성립한다 — 동사마다
// 다른 활용 규칙을 새로 지어낼 필요가 없다는 뜻이다.
//
// 표준어 쪽은 두 갈래로 나눈다:
//   "...습니다." / "...ㅂ니다." → "...습니까?" / "...ㅂ니까?" (합쇼체는 형태가 바뀜)
//   그 외(예: 해요체 "...어요.")  → 끝의 "."만 "?"로 바꿈 (해요체는 평서/의문이 같은 형태)
//
// 한 유닛에서 이 조건에 맞는 예문이 2개 이상일 때만, 그 절반(내림)만 바꾼다.
// 전부 바꾸면 편중이 -수다에서 -수과로 옮겨갈 뿐이라 의미가 없다. 1개뿐이면
// 바꿔도 여전히 종결형 2종 그대로라 건드리지 않는다.
//
//   node scripts/diversify-endings.mjs           # content/examples.json 갱신
//   node scripts/diversify-endings.mjs --dry-run # 몇 개나 바뀔지만 보여줌
//
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { ending } from "./measure-endings.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const EDIT_REASON = "종결어미 다양화: 평서문(-수다/-우다)을 대응 의문형(-수과/-우꽈)으로 바꿈(4차)";

/** jeju 문장을 대응하는 의문형으로 바꾼다. 대상이 아니면 null. */
export function toQuestionJeju(jeju) {
  if (/수다\.$/.test(jeju)) return jeju.replace(/수다\.$/, "수과?");
  if (/우다\.$/.test(jeju)) return jeju.replace(/우다\.$/, "우꽈?");
  return null;
}

/** standard 문장을 같은 의미의 의문형으로 바꾼다. */
export function toQuestionStandard(standard) {
  if (/니다\.$/.test(standard)) return standard.replace(/니다\.$/, "니까?");
  return standard.replace(/\.$/, "?");
}

function distinctEndings(unit, exBySeq) {
  const set = new Set();
  for (const seq of unit.wordSeqs) {
    for (const ex of exBySeq.get(seq) ?? []) set.add(ending(ex.jeju));
  }
  return set;
}

/**
 * @param {object[]} examples content/examples.json
 * @param {object[]} units content/units.json
 * @returns {{ examples: object[], converted: {seq:string, before:string, after:string}[] }}
 */
export function planConversions(examples, units) {
  const exBySeq = new Map();
  for (const ex of examples) {
    if (!exBySeq.has(ex.seq)) exBySeq.set(ex.seq, []);
    exBySeq.get(ex.seq).push(ex);
  }

  const converted = [];
  const flaggedUnits = units.filter((u) => distinctEndings(u, exBySeq).size <= 2);

  for (const unit of flaggedUnits) {
    const candidates = [];
    for (const seq of unit.wordSeqs) {
      for (const ex of exBySeq.get(seq) ?? []) {
        if (toQuestionJeju(ex.jeju)) candidates.push(ex);
      }
    }
    if (candidates.length < 2) continue;
    const howMany = Math.floor(candidates.length / 2);
    for (let i = 0; i < howMany; i += 1) {
      const ex = candidates[i];
      const before = ex.jeju;
      const nextJeju = toQuestionJeju(ex.jeju);
      if (!nextJeju) continue;
      ex.jeju = nextJeju;
      ex.standard = toQuestionStandard(ex.standard);
      ex.source = { ...ex.source, editReason: EDIT_REASON };
      converted.push({ seq: ex.seq, before, after: ex.jeju });
    }
  }
  return { examples, converted };
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const examplesPath = path.join(ROOT, "content/examples.json");
  const unitsPath = path.join(ROOT, "content/units.json");
  const examples = JSON.parse(readFileSync(examplesPath, "utf8"));
  const units = JSON.parse(readFileSync(unitsPath, "utf8"));

  const { converted } = planConversions(examples, units);
  console.log(`대상 유닛의 평서문 → 의문형 변환: ${converted.length}개`);
  if (dryRun) {
    for (const c of converted.slice(0, 10)) console.log(`  ${c.seq}: ${c.before} → ${c.after}`);
    if (converted.length > 10) console.log(`  ... 외 ${converted.length - 10}개`);
    return;
  }
  writeFileSync(examplesPath, JSON.stringify(examples, null, 2) + "\n", "utf8");
  console.log("content/examples.json 갱신 완료. node scripts/build-content.mjs로 반영하세요.");
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) main();
