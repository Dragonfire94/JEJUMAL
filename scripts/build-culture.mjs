#!/usr/bin/env node
// content/culture-items.json(원장)을 검증한 뒤, 현재 vocab.json과
// provenance를 대조하고, main src/data/units.json·src/data/life-dialect.json
// 문자열 매칭으로 build-time candidate cross-link를 계산해
// src/data/culture-items.json(앱이 읽는 빌드 산출물)을 생성한다.
//
// life-dialect의 "생성물은 source가 아니다, cross-link는 build-time에
// 계산한다" 패턴을 그대로 따른다(docs/3c3b-culture-track-contract.md
// §1, §6). Culture item은 main lexeme/unit/quiz/progress 어디에도
// 섞이지 않는다 — 이 스크립트가 main content/lexemes.json·
// content/units.json·content/examples.json을 절대 읽거나 쓰지 않는
// 것도 그 격리의 일부다.
//
//   node scripts/build-culture.mjs
//
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { CultureBundleSchema, checkCultureCrossReferences } from "./culture-schema.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CONTENT_PATH = path.join(ROOT, "content/culture-items.json");
const VOCAB_PATH = path.join(ROOT, "data/jeju-basic-vocab-2025/vocab.json");
const UNITS_PATH = path.join(ROOT, "src/data/units.json");
const LIFE_DIALECT_PATH = path.join(ROOT, "src/data/life-dialect.json");
const OUT_PATH = path.join(ROOT, "src/data/culture-items.json");

// life-dialect의 findCandidateWordLinks와 같은 최소 길이 필터 — 한 글자
// 표제어 오탐(조사성 어휘 등)을 막는다.
const MIN_MATCH_LEN = 2;

export function loadCultureBundle() {
  return JSON.parse(readFileSync(CONTENT_PATH, "utf8"));
}

export function validateCultureBundle(bundle) {
  const parsed = CultureBundleSchema.safeParse(bundle);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    throw new Error(`Culture 스키마 검증 실패:\n${issues.join("\n")}`);
  }
  const crossRefProblems = checkCultureCrossReferences(parsed.data);
  if (crossRefProblems.length > 0) {
    throw new Error(`Culture 상호참조 검증 실패:\n${crossRefProblems.map((p) => `  - ${p}`).join("\n")}`);
  }
  return parsed.data;
}

/**
 * content/culture-items.json의 각 item이 현재 data/jeju-basic-vocab-2025/vocab.json
 * source와 실제로 일치하는지 대조한다(D-4 요구사항). source drift가
 * 있으면(누락된 stableId, jeju/level/pos/definition 불일치) 즉시 던진다
 * — 원장이 vocab.json 재추출 후에도 최신 상태인지 보증한다.
 */
export function checkVocabProvenance(items, vocabRows) {
  const vocabByStableId = new Map(vocabRows.map((r) => [r.stableId, r]));
  const problems = [];
  for (const item of items) {
    const v = vocabByStableId.get(item.sourceStableId);
    if (!v) {
      problems.push(`${item.id}: sourceStableId(${item.sourceStableId})가 현재 vocab.json에 없습니다`);
      continue;
    }
    if (v.jeju_forms[0] !== item.jeju) {
      problems.push(
        `${item.id}: jeju가 vocab.json과 다릅니다(원장 "${item.jeju}" vs vocab.json "${v.jeju_forms[0]}") — ` +
          "PUA 매핑 등으로 vocab.json 표기가 바뀌었으면 원장도 갱신해야 합니다",
      );
    }
    if (v.level !== item.level) problems.push(`${item.id}: level 불일치(원장 ${item.level} vs vocab.json ${v.level})`);
    if (v.pos !== item.sourcePosLabel) {
      problems.push(`${item.id}: sourcePosLabel 불일치(원장 ${item.sourcePosLabel} vs vocab.json ${v.pos})`);
    }
    if (v.definition !== item.definition) problems.push(`${item.id}: definition이 vocab.json과 다릅니다`);
    if (v.has_standard_equivalent !== item.hasStandardEquivalent) {
      problems.push(`${item.id}: hasStandardEquivalent 불일치`);
    }
  }
  return problems;
}

/** allWords 중 sentence 텍스트에 문자열 그대로 등장하는 표제어를 후보로 뽑는다(life-dialect와 대칭). */
export function findCandidateMainLexemeLinks(item, allWords) {
  const matches = [];
  const forms = [item.jeju, ...item.otherJejuForms];
  for (const word of allWords) {
    if (word.reviewStatus === "blocked") continue;
    const standardHit = word.standard.length >= MIN_MATCH_LEN && forms.some((f) => f.includes(word.standard));
    const jejuHit = word.jeju.length >= MIN_MATCH_LEN && forms.some((f) => f.includes(word.jeju));
    if (standardHit || jejuHit) {
      matches.push({
        seq: word.seq,
        jeju: word.jeju,
        standard: word.standard,
        matchedOn: standardHit && jejuHit ? "both" : standardHit ? "standard" : "jeju",
        status: "candidate",
      });
    }
  }
  return matches;
}

/** life-dialect 문장 중 culture item 표제 형태가 등장하는 곳을 후보로 뽑는다. */
export function findCandidateLifeDialectLinks(item, passages) {
  const matches = [];
  const forms = [item.jeju, ...item.otherJejuForms].filter((f) => f.length >= MIN_MATCH_LEN);
  for (const passage of passages) {
    passage.sentences.forEach((sentence, sentenceIndex) => {
      const hit = forms.some((f) => sentence.jeju.includes(f) || sentence.solutionEdited.includes(f));
      if (hit) {
        matches.push({ passageId: passage.id, sentenceIndex, status: "candidate" });
      }
    });
  }
  return matches;
}

export function assembleCulture(bundle, allWords, lifeDialectPassages) {
  return {
    version: bundle.version,
    sourceLicense: bundle.sourceLicense,
    items: bundle.items.map((item) => ({
      ...item,
      relatedMainLexemeSeqs: findCandidateMainLexemeLinks(item, allWords),
      relatedLifeDialectIds: findCandidateLifeDialectLinks(item, lifeDialectPassages),
    })),
  };
}

function main() {
  const bundle = validateCultureBundle(loadCultureBundle());

  const vocab = JSON.parse(readFileSync(VOCAB_PATH, "utf8"));
  const provenanceProblems = checkVocabProvenance(bundle.items, vocab.entries);
  if (provenanceProblems.length > 0) {
    throw new Error(`vocab.json provenance 불일치:\n${provenanceProblems.map((p) => `  - ${p}`).join("\n")}`);
  }

  const units = JSON.parse(readFileSync(UNITS_PATH, "utf8"));
  const allWords = units.flatMap((u) => u.words);

  let lifeDialectPassages = [];
  try {
    const lifeDialect = JSON.parse(readFileSync(LIFE_DIALECT_PATH, "utf8"));
    lifeDialectPassages = lifeDialect.passages ?? [];
  } catch {
    // life-dialect 빌드 산출물이 아직 없으면 candidate link 없이 진행한다
    // (culture build가 life-dialect build 순서에 의존하지 않게 한다).
  }

  const assembled = assembleCulture(bundle, allWords, lifeDialectPassages);
  writeFileSync(OUT_PATH, JSON.stringify(assembled, null, 2) + "\n", "utf8");

  const mainLinkCount = assembled.items.reduce((n, i) => n + i.relatedMainLexemeSeqs.length, 0);
  const lifeDialectLinkCount = assembled.items.reduce((n, i) => n + i.relatedLifeDialectIds.length, 0);
  const pendingGlossCount = assembled.items.filter((i) => i.pendingGloss).length;
  console.log(`content/culture-items.json → src/data/culture-items.json 생성 완료`);
  console.log(`  culture item ${assembled.items.length}개`);
  console.log(`  gloss 대기(pendingGloss) ${pendingGlossCount}개`);
  console.log(`  main lexeme 후보 연결(candidate) ${mainLinkCount}개`);
  console.log(`  life-dialect 후보 연결(candidate) ${lifeDialectLinkCount}개`);
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
