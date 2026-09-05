#!/usr/bin/env node
// content/{units,lexemes,examples}.json (원장, 사람이 편집하는 소스) 를 검증한 뒤
// src/data/units.json (앱이 실제로 읽는 빌드 산출물) 을 생성한다.
//
// units.json을 직접 손으로 고치지 말 것 — 다음 실행 때 조용히 덮어써진다.
// 콘텐츠를 바꾸려면 content/ 아래 원장 파일을 고치고 이 스크립트를 다시 실행한다.
//
//   node scripts/build-content.mjs
//
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { ContentBundleSchema, checkCrossReferences } from "./content-schema.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CONTENT_DIR = path.join(ROOT, "content");
const OUT_PATH = path.join(ROOT, "src/data/units.json");
const AUDIO_DIR = path.join(ROOT, "public/audio");

function readJson(name) {
  return JSON.parse(readFileSync(path.join(CONTENT_DIR, `${name}.json`), "utf8"));
}

export function loadContentBundle() {
  return {
    units: readJson("units"),
    lexemes: readJson("lexemes"),
    examples: readJson("examples"),
  };
}

export function validateBundle(bundle) {
  const parsed = ContentBundleSchema.safeParse(bundle);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    throw new Error(`콘텐츠 스키마 검증 실패:\n${issues.join("\n")}`);
  }
  const crossRefProblems = checkCrossReferences(parsed.data);
  if (crossRefProblems.length > 0) {
    throw new Error(`콘텐츠 상호참조 검증 실패:\n${crossRefProblems.map((p) => `  - ${p}`).join("\n")}`);
  }
  return parsed.data;
}

export function assembleUnits(bundle) {
  const lexemeBySeq = new Map(bundle.lexemes.map((l) => [l.seq, l]));
  const examplesBySeq = new Map();
  for (const ex of bundle.examples) {
    if (!examplesBySeq.has(ex.seq)) examplesBySeq.set(ex.seq, []);
    examplesBySeq.get(ex.seq).push(ex);
  }

  return bundle.units.map((u) => ({
    id: u.id,
    title: u.title,
    themeId: u.themeId,
    rankIndex: u.rankIndex,
    order: u.order,
    words: u.wordSeqs.map((seq) => {
      const lexeme = lexemeBySeq.get(seq);
      const examples = (examplesBySeq.get(seq) ?? []).map((ex) => ({
        jeju: ex.jeju,
        standard: ex.standard,
      }));
      const word = {
        seq: lexeme.seq,
        jeju: lexeme.jeju,
        standard: lexeme.standard,
        soundUrl: `/audio/${lexeme.seq}.mp3`,
        partOfSpeech: lexeme.partOfSpeech,
        examples,
      };
      if (lexeme.reviewStatus) word.reviewStatus = lexeme.reviewStatus;
      word.hasAudio = existsSync(path.join(AUDIO_DIR, `${lexeme.seq}.mp3`));
      return word;
    }),
  }));
}

function main() {
  const bundle = loadContentBundle();
  const validated = validateBundle(bundle);
  const units = assembleUnits(validated);
  const json = JSON.stringify(units, null, 2) + "\n";
  writeFileSync(OUT_PATH, json, "utf8");

  const totalWords = units.reduce((sum, u) => sum + u.words.length, 0);
  const noAudio = units.flatMap((u) => u.words).filter((w) => !w.hasAudio).length;
  const blocked = units.flatMap((u) => u.words).filter((w) => w.reviewStatus === "blocked").length;
  console.log(`content/ → src/data/units.json 생성 완료`);
  console.log(`  유닛 ${units.length}개, 단어 ${totalWords}개`);
  console.log(`  음원 없음(hasAudio=false): ${noAudio}개`);
  console.log(`  비노출(blocked): ${blocked}개`);
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
