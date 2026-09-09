#!/usr/bin/env node
// 1,000단어가 "사전에만 있는 말"이 아니라 실제로 쓰이는 증거가 있는지
// 감사한다. 판정 기준을 세 갈래로 나눈다:
//
//   corpus   AI Hub 방언 대화 말뭉치(524,406문장, 5,638개 대화 파일 — 주로
//            중장년 화자의 생활사·명절·결혼 인터뷰) 에 그 표제어가 실제로
//            등장하는가
//   life     생활방언 100편(jeju.go.kr 공식 자료, 현대 표기)에 등장하는가
//   dict     사전(jeju_dialect_full.json)에 표제어로 있는가 — 이건 전부 있다.
//            사전 등재 자체는 "쓰인다"는 증거가 아니라 "채록된 적 있다"는
//            증거에 가깝다는 게 이 감사의 출발점이다.
//
// 중요한 주의: 말뭉치에 없다고 그 단어가 안 쓰인다는 뜻은 아니다. 말뭉치가
// 다루는 화제(생활사·명절·결혼·관광)가 한정돼 있고 화자도 소수다. 이 감사는
// "확인됐다/못 했다"를 가르는 것이지 "산 말/죽은 말"을 가르는 게 아니다.
// 그래서 이 결과만으로 단어를 지우거나 blocked 처리하지 않는다 — 사람이
// 후속 조사(다른 화자·다른 자료)를 할 목록을 만드는 게 목적이다.
//
//   node scripts/audit-word-usage.mjs               # 콘솔 보고서
//   node scripts/audit-word-usage.mjs --out FILE     # data/aihub/word-usage-audit.json 로도 저장
//
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const MIN_HEADWORD_LEN_FOR_INFLECTED = 2; // 1글자는 조사 결합형 탐지가 오탐이 너무 많다
const MAX_NOUN_SUFFIX_LEN = 3; // 명사 표제어: "표제어+최대 3글자"(조사)까지만 활용형으로 인정
const MAX_VERB_SUFFIX_LEN = 6; // 용언 어간: 제주어 어미가 길어서(-아났주게 등) 더 넉넉히 잡는다

function loadLexemes() {
  return JSON.parse(readFileSync(path.join(ROOT, "content/lexemes.json"), "utf8"));
}

function loadTokens() {
  return JSON.parse(readFileSync(path.join(ROOT, "data/aihub/tokens.json"), "utf8"));
}

function splitLines(text) {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * 생활방언 100편을 "제주어 줄 ↔ 표준어 풀이 줄" 쌍으로 돌려준다. contents/
 * original/solution의 줄 수가 어긋나는 편(20/100, 알려진 정렬 문제)은
 * 뜻을 대응시킬 수 없어 건너뛴다 — 억지로 맞추면 다른 문장의 뜻을 우리
 * 표제어 뜻으로 오인하는 동형이의어 오염이 또 생긴다.
 */
function loadLifeDialectLinePairs() {
  const items = JSON.parse(readFileSync(path.join(ROOT, "data/life-dialect/items.json"), "utf8"));
  const pairs = [];
  for (const it of items) {
    const contentsLines = splitLines(it.contents);
    const originalLines = splitLines(it.original);
    const solutionLines = splitLines(it.solution);
    if (contentsLines.length === solutionLines.length) {
      for (let i = 0; i < contentsLines.length; i += 1) {
        pairs.push({ jeju: contentsLines[i], standard: solutionLines[i] });
      }
    }
    // original(고어 표기)도 같은 줄의 solution과 대응시킨다
    if (originalLines.length === solutionLines.length) {
      for (let i = 0; i < originalLines.length; i += 1) {
        pairs.push({ jeju: originalLines[i], standard: solutionLines[i] });
      }
    }
  }
  return pairs;
}

function globCore(standard) {
  return standard.split(/[.(]/)[0].trim();
}

/**
 * 말뭉치 토큰 하나는 여러 표준어 뜻(동형이의어 포함)에 매핑돼 있을 수 있다
 * — 예: "상"은 사전 뜻으로 "향"이지만 말뭉치에서는 거의 다 "사다/사서"의
 * 방언 표기라 이 둘은 전혀 다른 낱말이다. 그 토큰의 등장 횟수를 우리
 * 표제어의 실사용 증거로 셀지는, 매핑된 표준어 중 실제로 뜻이 통하는 게
 * 있는지로 가른다. 뜻(core)이 1글자면 "포함" 검사가 너무 헐거워서
 * (예: "형"이 "형편"에도 포함) 정확히 같을 때만 인정한다.
 *
 * 용언은 표준어 쪽도 활용형으로 나온다("짚다"의 실제 말뭉치 짝은 "짚어서/
 * 짚고"이지 "짚다"라는 문자열을 포함하지 않는다) — 그래서 "포함" 검사가
 * 거의 항상 실패해 용언 전체가 근거 없음으로 잘못 나왔다. 용언은 뜻(core)의
 * 어간("짚다"→"짚")으로 시작하는지를 추가로 본다.
 */
function meaningMatches(core, standard, isVerbLike = false) {
  if (isVerbLike && core.endsWith("다") && core.length > 1) {
    const stem = core.slice(0, -1);
    if (stem && standard.startsWith(stem)) return true;
  }
  if (core.length <= 1 || standard.length <= 1) return core === standard;
  return standard.includes(core) || core.includes(standard);
}

/**
 * 223,067개 토큰을 매 단어마다 훑으면 너무 느리다(1,000 x 223,067).
 * 첫 글자로만 미리 묶어 두면 startsWith 후보가 크게 줄어든다.
 */
function buildFirstCharIndex(tokens) {
  const index = new Map();
  for (const [token, forms] of Object.entries(tokens)) {
    if (!token) continue;
    const key = token[0];
    if (!index.has(key)) index.set(key, []);
    index.get(key).push([token, forms]);
  }
  return index;
}

/**
 * 줄마다 나온 낱말 토큰을, 그 줄의 표준어 풀이와 함께 첫 글자로 묶어 둔다
 * — 말뭉치와 같은 이유(속도)와 같은 방식(동형이의어는 그 줄의 풀이로 판별).
 */
function buildLifeDialectIndex(pairs) {
  const index = new Map();
  for (const { jeju, standard } of pairs) {
    for (const raw of jeju.split(/\s+/)) {
      const token = raw.replace(/^[",.!?…()]+|[",.!?…()]+$/g, "");
      if (!token) continue;
      const key = token[0];
      if (!index.has(key)) index.set(key, []);
      index.get(key).push({ token, standard });
    }
  }
  return index;
}

/**
 * 활용형을 찾을 "뿌리"들을 정한다. 명사는 표제어 그대로(+조사만 짧게 붙는다).
 * 용언(동사/형용사)은 사전 인용형("-다")이 실제 발화에 그대로 안 나오고
 * 어간에 다른 어미가 붙어 나온다 — "족다"(작다)는 말뭉치에 "족은/족으난/
 * 족아났주게"로 나오지 "족다"로는 거의 안 나온다. 그래서 용언은 어간(표제어
 * 끝의 "다"를 뗀 것)도 같이 찾고, 제주어 어미가 길 수 있어 허용 접미 길이를
 * 더 넉넉히 준다.
 *
 * 일부 표제어는 사전 표기 자체가 "지프(짚으)다"처럼 두 어간을 괄호로 함께
 * 적어 둔다("지프"/"짚(으)" 둘 다 실사용형). 이걸 그냥 "다"만 떼면 뿌리가
 * "지프(짚으)"라는, 말뭉치에 있을 리 없는 문자열이 되어 무조건 0건으로
 * 나온다 — 실제 있던 5개 표제어가 전부 이렇게 묻혀 있었다. 괄호 앞/안을
 * 각각 뿌리로 쪼갠다.
 */
function inflectionRoots(headword, partOfSpeech) {
  const roots = [{ root: headword, maxSuffixLen: MAX_NOUN_SUFFIX_LEN, minRootLen: MIN_HEADWORD_LEN_FOR_INFLECTED }];
  const isVerbLike = partOfSpeech === "verb" || partOfSpeech === "adjective";
  if (!isVerbLike) return roots;

  const bracketed = headword.match(/^(.+?)\(([^)]+)\)다$/);
  if (bracketed) {
    const [, outer, inner] = bracketed;
    if (outer) roots.push({ root: outer, maxSuffixLen: MAX_VERB_SUFFIX_LEN, minRootLen: 1 });
    const innerStem = inner.endsWith("으") ? inner.slice(0, -1) : inner; // "짚으"→"짚" 매개모음 제거
    if (innerStem) roots.push({ root: innerStem, maxSuffixLen: MAX_VERB_SUFFIX_LEN, minRootLen: 1 });
    return roots;
  }

  if (headword.endsWith("다") && headword.length > 1) {
    // 용언 어간은 1글자짜리도 많다("귿다"→귿, "께다"→께). 명사 1글자와 달리
    // 뜻 일치 검사(meaningMatches)가 보호막이라 여기서는 길이 제한을 안 둔다.
    roots.push({ root: headword.slice(0, -1), maxSuffixLen: MAX_VERB_SUFFIX_LEN, minRootLen: 1 });
  }
  return roots;
}

/**
 * @param {{seq:string, jeju:string, standard:string, partOfSpeech?:string}} lexeme
 * @param {Record<string, [string, number][]>} tokens
 * @param {Map<string, [string, [string, number][]][]>} firstCharIndex
 * @param {Map<string, {token:string, standard:string}[]>} lifeDialectIndex
 */
export function auditWord(lexeme, tokens, firstCharIndex, lifeDialectIndex) {
  const headword = lexeme.jeju.trim();
  const core = globCore(lexeme.standard);
  const isVerbLike = lexeme.partOfSpeech === "verb" || lexeme.partOfSpeech === "adjective";
  const roots = inflectionRoots(headword, lexeme.partOfSpeech);

  let exactHits = 0;
  let inflectedHits = 0;
  const exactEntry = tokens[headword];
  if (exactEntry) {
    // 동형이의어 오염 방지: 매핑된 표준어 중 우리 표제어의 뜻과 실제로
    // 통하는 것만 센다 ("상"→[사서,사고,...]처럼 뜻이 안 통하면 0으로 둔다).
    exactHits = exactEntry
      .filter(([standard]) => meaningMatches(core, standard, isVerbLike))
      .reduce((sum, [, count]) => sum + count, 0);
  }

  const countedTokens = new Set([headword]);
  for (const { root, maxSuffixLen, minRootLen } of roots) {
    if (root.length < minRootLen) continue;
    const candidates = firstCharIndex.get(root[0]) ?? [];
    for (const [token, forms] of candidates) {
      if (countedTokens.has(token)) continue;
      if (!token.startsWith(root)) continue;
      if (token.length > root.length + maxSuffixLen) continue;
      const matchingForms = forms.filter(([standard]) => meaningMatches(core, standard, isVerbLike));
      if (matchingForms.length > 0) {
        inflectedHits += matchingForms.reduce((sum, [, count]) => sum + count, 0);
        countedTokens.add(token);
      }
    }
  }

  let lifeDialectHits = 0;
  const countedLifeTokens = new Set();
  for (const { root, minRootLen } of roots) {
    if (root.length < minRootLen) continue;
    const lifeCandidates = lifeDialectIndex.get(root[0]) ?? [];
    for (const { token, standard } of lifeCandidates) {
      if (token !== root && !token.startsWith(root)) continue;
      const key = `${token}::${standard}`;
      if (countedLifeTokens.has(key)) continue;
      if (meaningMatches(core, standard, isVerbLike)) {
        lifeDialectHits += 1;
        countedLifeTokens.add(key);
      }
    }
  }

  // exactHits와 inflectedHits를 각각 따로 문턱을 재면 "원형 2회+활용형 4회
  // (합 6회)"가 confirmed 문턱(원형 3회, 활용형 5회) 어느 쪽도 안 넘어서
  // rare로 떨어지는 모순이 생긴다(83개 중 23개가 실제로 이랬다 — 외부 검토
  // 중 지적받아 확인함). 합계 하나로 판정한다.
  const corpusHits = exactHits + inflectedHits;
  let tier;
  if (exactHits >= 3 || lifeDialectHits >= 1 || corpusHits >= 5) {
    tier = "confirmed";
  } else if (corpusHits >= 1) {
    tier = "rare";
  } else {
    tier = "unconfirmed";
  }

  return {
    seq: lexeme.seq,
    jeju: lexeme.jeju,
    standard: lexeme.standard,
    exactHits,
    inflectedHits,
    lifeDialectHits,
    tier,
  };
}

export function auditAll(lexemes, tokens, lifeDialectPairs) {
  const firstCharIndex = buildFirstCharIndex(tokens);
  const lifeDialectIndex = buildLifeDialectIndex(lifeDialectPairs);
  return lexemes.map((l) => auditWord(l, tokens, firstCharIndex, lifeDialectIndex));
}

function main() {
  const outIdx = process.argv.indexOf("--out");
  const outPath = outIdx !== -1 ? process.argv[outIdx + 1] : null;

  const lexemes = loadLexemes();
  const tokens = loadTokens();
  const lifeDialectPairs = loadLifeDialectLinePairs();

  const rows = auditAll(lexemes, tokens, lifeDialectPairs);
  const byTier = { confirmed: [], rare: [], unconfirmed: [] };
  for (const r of rows) byTier[r.tier].push(r);

  console.log(`# 1,000단어 실사용 근거 감사\n`);
  console.log(`- confirmed(말뭉치 원형 3회 이상, 합계 5회 이상, 또는 생활방언 등장): ${byTier.confirmed.length}`);
  console.log(`- rare(말뭉치 원형+활용형 합계 1~4회): ${byTier.rare.length}`);
  console.log(`- unconfirmed(둘 다 0회 — 사전에만 있음): ${byTier.unconfirmed.length}`);
  console.log(`\n주의: unconfirmed는 "안 쓰이는 말"이 아니라 "이 두 자료로는 확인 못 한 말"이다.`);

  if (outPath) {
    const full = path.join(ROOT, outPath);
    writeFileSync(
      full,
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          method: [
            "AI Hub 방언 대화 말뭉치(524,406문장)에서 정확히 일치하는 토큰의 등장 횟수 — 단, 그 토큰이 매핑된 표준어 중 표제어 뜻과 통하는 것만 센다(동형이의어 오염 방지, 1글자 뜻은 완전일치만 인정)",
            "조사/어미가 붙은 형태(명사는 표제어+최대 3글자, 용언은 어간+최대 6글자)도 같은 방식으로 뜻이 통할 때만 활용형으로 인정",
            "용언(동사·형용사)은 표준어 쪽도 활용형으로 나오므로, 뜻 일치 검사에서 표제어의 어간으로 시작하는지도 함께 본다(\"짚다\"↔\"짚어서\")",
            "괄호로 두 어간을 함께 적은 표제어(\"지프(짚으)다\")는 괄호 앞/안을 각각 어간으로 나눠 찾는다",
            "생활방언 100편(jeju.go.kr 공식 자료)에서 제주어 줄과 그 줄의 표준어 풀이가 정확히 대응하는 편만(80/100, 줄 수가 안 맞는 20편은 뜻 대응이 불가능해 제외) 같은 동형이의어 판정으로 확인",
            "confirmed: 말뭉치 원형 3회 이상, 또는 원형+활용형 합계 5회 이상, 또는 생활방언 등장 / rare: 원형+활용형 합계 1~4회 / unconfirmed: 전부 0회",
          ],
          caveat:
            "말뭉치는 5,638개 대화 파일(생활사·명절·결혼·관광 인터뷰 위주)로 화제가 한정돼 있고, " +
            "생활방언 100편 중 20편은 줄 수가 안 맞아 이 감사에서 제외했다(별개 문제, " +
            "content/README-life-dialect.md 참고). 용언의 어간 기준 뜻 일치는 1~2글자 짧은 어간에서 " +
            "동형이의어 오염 위험이 명사보다 크다(예: 서로 다른 단어가 같은 첫 음절로 시작하는 경우) — " +
            "완전히 배제하진 못했다. unconfirmed는 안 쓰인다는 증거가 아니라 " +
            "이 두 자료로는 못 찾았다는 뜻이다. 이 결과만으로 단어를 지우거나 비노출 처리하지 " +
            "않는다 — 후속 조사 대상 목록이다.",
          summary: {
            total: rows.length,
            confirmed: byTier.confirmed.length,
            rare: byTier.rare.length,
            unconfirmed: byTier.unconfirmed.length,
          },
          rows,
        },
        null,
        2,
      ) + "\n",
      "utf8",
    );
    console.log(`\n저장: ${outPath}`);
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) main();
