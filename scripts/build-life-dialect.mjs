#!/usr/bin/env node
// content/life-dialect.json (원장) 을 검증한 뒤
// src/data/life-dialect.json (앱이 읽는 빌드 산출물) 을 생성한다.
//
// 문장마다 1,000단어 표제어와의 "후보" 연결을 계산해 붙인다. 활용형은 문자열 일치로
// 못 잡으므로 이 후보는 전부 candidate 상태다 — 자동 승인하지 않는다(P2-2 설계 원칙).
// UI가 사람이 확인하기 전까지 정답처럼 보여주면 안 된다.
//
//   node scripts/build-life-dialect.mjs
//
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { LifeDialectBundleSchema, checkLifeDialectCrossReferences } from "./life-dialect-schema.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CONTENT_PATH = path.join(ROOT, "content/life-dialect.json");
const UNITS_PATH = path.join(ROOT, "src/data/units.json");
const OUT_PATH = path.join(ROOT, "src/data/life-dialect.json");

// 링크 후보에서 제외할, 너무 흔해서 의미 없는 표제어(한 글자 조사성 어휘 등).
const MIN_MATCH_LEN = 2;

export function loadLifeDialectBundle() {
  return JSON.parse(readFileSync(CONTENT_PATH, "utf8"));
}

export function validateLifeDialectBundle(bundle) {
  const parsed = LifeDialectBundleSchema.safeParse(bundle);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    throw new Error(`생활방언 스키마 검증 실패:\n${issues.join("\n")}`);
  }
  const crossRefProblems = checkLifeDialectCrossReferences(parsed.data);
  if (crossRefProblems.length > 0) {
    throw new Error(`생활방언 상호참조 검증 실패:\n${crossRefProblems.map((p) => `  - ${p}`).join("\n")}`);
  }
  return parsed.data;
}

/** allWords 중 sentence 텍스트에 문자열 그대로 등장하는 표제어를 후보로 뽑는다. */
export function findCandidateWordLinks(sentence, allWords) {
  const matches = [];
  for (const word of allWords) {
    if (word.reviewStatus === "blocked") continue;
    const standardHit = word.standard.length >= MIN_MATCH_LEN && sentence.solutionEdited.includes(word.standard);
    const jejuHit = word.jeju.length >= MIN_MATCH_LEN && sentence.jeju.includes(word.jeju);
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

export function assembleLifeDialect(bundle, units) {
  const allWords = units.flatMap((u) => u.words);
  return {
    version: bundle.version,
    sourceLicense: bundle.sourceLicense,
    passages: bundle.passages.map((p) => ({
      id: p.id,
      seq: p.seq,
      title: p.title,
      category: p.category,
      audioUrl: p.audioUrl,
      requiredInCurriculum: p.requiredInCurriculum,
      contentAdvisory: p.contentAdvisory,
      note: p.note,
      sentences: p.sentences.map((s) => ({
        jeju: s.jeju,
        archaic: s.archaic,
        solutionOriginal: s.solutionOriginal,
        solutionEdited: s.solutionEdited,
        editReason: s.editReason,
        wordLinks: findCandidateWordLinks(s, allWords),
      })),
    })),
  };
}

function main() {
  const bundle = validateLifeDialectBundle(loadLifeDialectBundle());
  const units = JSON.parse(readFileSync(UNITS_PATH, "utf8"));
  const assembled = assembleLifeDialect(bundle, units);
  writeFileSync(OUT_PATH, JSON.stringify(assembled, null, 2) + "\n", "utf8");

  const passageCount = assembled.passages.length;
  const sentenceCount = assembled.passages.reduce((n, p) => n + p.sentences.length, 0);
  const linkCount = assembled.passages.reduce(
    (n, p) => n + p.sentences.reduce((m, s) => m + s.wordLinks.length, 0),
    0,
  );
  console.log(`content/life-dialect.json → src/data/life-dialect.json 생성 완료`);
  console.log(`  파일럿 ${passageCount}편, 문장 ${sentenceCount}개`);
  console.log(`  단어 후보 연결(candidate, 미승인) ${linkCount}개`);
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
