#!/usr/bin/env node
// AI Hub 제주어 말뭉치 토큰 빈도(data/aihub/tokens.json)를 제주어사전
// 표제어(data/dictionary/jeju_dialect_full.json)와 교차 대조해서, "진짜 사전
// 표제어이면서 실제 말뭉치에도 등장하는 어휘"를 빈도순으로 정리한 정식 산출물을
// 만든다.
//
//   node scripts/build-word-frequency.mjs
//
// 이전에는 이 계산을 매번 스크래치패드에서 새로 짜서 어휘 교체 라운드마다
// 다시 만들었다(개선안 문서 P1 참고). 이 스크립트로 고정해서 재사용한다.
//
// 참고: irish-word-frequency 저장소의 "rank / lemma / corpus frequency /
// window size" 형식을 참고해, 절대 빈도와 함께 "평균 몇 개 토큰마다 한 번
// 나오는지"를 같이 기록한다.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SCRIPT_VERSION = "1.0.0";

function hasPua(text) {
  return [...text].some((ch) => {
    const code = ch.codePointAt(0);
    return code >= 0xe000 && code <= 0xf8ff;
  });
}

function loadDictionary() {
  const entries = JSON.parse(readFileSync(path.join(ROOT, "data/dictionary/jeju_dialect_full.json"), "utf8"));
  const byName = new Map();
  for (const entry of entries) {
    const name = (entry.name ?? "").replaceAll("-", "");
    if (!byName.has(name)) byName.set(name, []);
    byName.get(name).push(entry);
  }
  return { entries, byName };
}

function resolveArrow(byName, contents, depth = 0) {
  const text = (contents ?? "").trim();
  if (text.startsWith("⇒") && depth < 3) {
    const target = text.slice(1).split(".")[0].split("=")[0].trim();
    const targets = byName.get(target);
    if (targets && targets[0]) return resolveArrow(byName, targets[0].contents, depth + 1);
  }
  return text;
}

function gloss(byName, contents) {
  const resolved = resolveArrow(byName, contents);
  const segments = resolved
    .split(".")
    .map((s) => s.trim())
    .filter(Boolean);
  const first = segments[0] ?? resolved;
  if (segments.length >= 2) return segments[segments.length - 1];
  const aliases = first
    .split("=")
    .map((a) => a.trim().replace(/^⇒/, "").trim())
    .filter(Boolean);
  return aliases.length > 0 ? aliases[aliases.length - 1] : first;
}

// 표제어 스펠링이 같은 사전 항목이 여러 개면(예: 검질 seq 2628/1381), 교차참조
// 체인이 짧고(=indirection 적고) 뜻풀이가 간결한 항목을 대표로 고른다.
function pickBestEntry(entries) {
  return [...entries].sort((a, b) => {
    const score = (e) => {
      const c = e.contents ?? "";
      const indirection = (c.match(/⇒/g) ?? []).length + (c.match(/=/g) ?? []).length;
      return [indirection, c.length];
    };
    const [ai, al] = score(a);
    const [bi, bl] = score(b);
    if (ai !== bi) return ai - bi;
    return al - bl;
  })[0];
}

export function buildFrequencyList({ tokens, dictionary, appJejuWords }) {
  const { byName } = dictionary;
  const totalTokenOccurrences = Object.values(tokens).reduce(
    (sum, mappings) => sum + mappings.reduce((s, [, count]) => s + count, 0),
    0,
  );

  const rows = [];
  for (const [token, mappings] of Object.entries(tokens)) {
    if (hasPua(token) || token.length < 2) continue;
    const entries = byName.get(token);
    if (!entries || entries.length === 0) continue; // 사전 표제어가 아니면(조사/어미/오탈자 등) 제외
    const entry = pickBestEntry(entries.filter((e) => !hasPua(e.name ?? "")));
    if (!entry) continue;
    const contents = entry.contents ?? "";
    if (!contents || contents.length > 60) continue;

    const corpusFrequency = mappings.reduce((sum, [, count]) => sum + count, 0);
    rows.push({
      lemma: token,
      dictionarySeq: entry.seq,
      standardGloss: gloss(byName, contents),
      category: entry.category_name ?? null,
      corpusFrequency,
      matchedForms: mappings.map(([form, count]) => ({ form, count })).sort((a, b) => b.count - a.count),
      alreadyInApp: appJejuWords.has(token),
    });
  }

  rows.sort((a, b) => b.corpusFrequency - a.corpusFrequency);
  return rows.map((row, index) => ({
    rank: index + 1,
    ...row,
    perMillionDialectTokens: Number(((row.corpusFrequency / totalTokenOccurrences) * 1_000_000).toFixed(2)),
    windowSize: Math.round(totalTokenOccurrences / row.corpusFrequency),
  }));
}

function main() {
  const tokens = JSON.parse(readFileSync(path.join(ROOT, "data/aihub/tokens.json"), "utf8"));
  const aihubMeta = JSON.parse(readFileSync(path.join(ROOT, "data/aihub/meta.json"), "utf8"));
  const dictionary = loadDictionary();
  const units = JSON.parse(readFileSync(path.join(ROOT, "src/data/units.json"), "utf8"));
  const appJejuWords = new Set(units.flatMap((u) => u.words.map((w) => w.jeju)));

  const rows = buildFrequencyList({ tokens, dictionary, appJejuWords });

  const output = {
    corpusVersion: {
      source: aihubMeta.source,
      uniqueUtterances: aihubMeta.uniqueUtterances,
      uniqueDialectTokens: aihubMeta.uniqueDialectTokens,
    },
    dictionaryEntryCount: dictionary.entries.length,
    scriptVersion: SCRIPT_VERSION,
    generatedAt: new Date().toISOString(),
    method: [
      "AI Hub 제주어 방언 발화 말뭉치(52만 문장)의 방언 토큰 빈도를 집계",
      "제주어사전(jeju.go.kr) 표제어와 문자열이 정확히 일치하는 토큰만 채택 — 조사/어미/오탈자 등 사전에 없는 형태는 제외",
      "같은 표제어 철자가 여러 사전 항목에 걸쳐 있으면 교차참조 체인이 가장 짧은 항목을 대표로 채택",
      "동형이의어를 구분하지 않음 — 빈도가 여러 뜻에 걸쳐 합산되었을 수 있음(예: '예'가 대답/옛날/倭를 다 포함)",
      "표준어와 철자가 같은 토큰(순수 표준어일 가능성)도 사전 표제어이면 포함함 — 별도 표시 없음",
      "일부 사전 항목은 뜻풀이가 아니라 문법 설명문(예: 관형사형 어미+의존명사 조합 설명)이라, " +
        "standardGloss가 문장 일부를 그대로 잘라온 것처럼 보일 수 있다. 이 목록은 그대로 쓸 최종 " +
        "어휘가 아니라 사람이 검토할 후보 목록이므로, 실제 편입 전에는 반드시 dictionarySeq로 원문을 " +
        "다시 확인해야 한다.",
    ],
    rowCount: rows.length,
    rows,
  };

  writeFileSync(path.join(ROOT, "data/aihub/word-frequency.json"), JSON.stringify(output, null, 2) + "\n", "utf8");
  console.log(`data/aihub/word-frequency.json 생성 완료: ${rows.length}개 표제어`);
  console.log(`  이미 앱에 있음: ${rows.filter((r) => r.alreadyInApp).length}개`);
  console.log(`  앱에 없음(후보 가능): ${rows.filter((r) => !r.alreadyInApp).length}개`);
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) main();
