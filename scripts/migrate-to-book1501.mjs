#!/usr/bin/env node
// 2025 제주학연구센터 기본어휘(1,501개) 기반 원장 재구축.
// 일회성 마이그레이션: content/lexemes.json + content/units.json 재생성,
// 매칭되는 기존 음원을 새 seq 파일명으로 복사한다.
//
//   node scripts/migrate-to-book1501.mjs
//
// 설계:
// - seq: 등급 내장형 (초급 10101~ / 중급 20101~ / 고급 30101~), 책 순서대로
// - standard가 없는 제주 고유어 246개는 standard = jeju 표제형 (대응어 없음을
//   그대로 씀. 제주도청 카드도 같은 방식), definition에 상세 뜻
// - 유닛: 등급별 10개씩 (고급 551개는 47×10 + 9×9 = 56유닛), 총 151유닛
// - 해녀 랭크: 애기해녀 1-23 / 하군 24-45 / 중군 46-70 / 상군 71-95 /
//   대상군 96-151 (유닛 order 기준)
// - 음원: 2026-08-26 시점 seq→제주어 매핑(git) 경유, 정규화 표제형이 일치하는
//   새 seq로 복사. 발음 기준 매칭이라 동형이의어는 모두 복사해도 안전.
import { copyFileSync, existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BOOK = JSON.parse(readFileSync(path.join(ROOT, "data/jeju-basic-vocab-2025/vocab.json"), "utf8")).entries;
const AUDIO_DIR = path.join(ROOT, "public/audio");
// 2026-08-26 커밋(f8ed4e1, 공식 사전 음원 도입 시점)의 seq→제주어 표기
const OLD_UNITS = JSON.parse(
  execSync("git show f8ed4e1:src/data/units.json", { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }),
);

const LEVEL_ORDER = { 초급: 0, 중급: 1, 고급: 2 };
const LEVEL_ID = { 초급: "beginner", 중급: "intermediate", 고급: "advanced" };
const LEVEL_TITLE = { 초급: "초급", 중급: "중급", 고급: "고급" };
const SEQ_BASE = { 초급: 10101, 중급: 20101, 고급: 30101 };
const UNIT_PREFIX = { 초급: "b1", 중급: "b2", 고급: "b3" };
const POS_MAP = {
  명사: "noun", 의존명사: "noun", 대명사: "pronoun", 수사: "number",
  동사: "verb", 형용사: "adjective", 관형사: "determiner",
  부사: "adverb", 감탄사: "interjection",
};

/**
 * 동형이의어 SPLIT: 같은 표준어·다른 뜻인 29개 그룹(59개 entry).
 * conceptId가 다르면 퀴즈에서 서로 다른 개념으로 취급되고,
 * quizGloss가 읽기 문항의 뜻 표시에 쓰인다 ("다리(신체)" vs "다리(교량)").
 * 뜻이 거의 같은 변이형 그룹(얼굴, 언제, 쌓다 등)은 일부러 빼서
 * 같은 개념으로 묶이게 둔다.
 */
const CONCEPT_SPLIT = {
  "jbv2025-0001": ["다리#1", "다리(신체)"], "jbv2025-0043": ["다리#2", "다리(교량)"],
  "jbv2025-0046": ["달#1", "달(하늘의 달)"], "jbv2025-0184": ["달#2", "달(한 달)"],
  "jbv2025-0061": ["모양#1", "모양(생김새)"], "jbv2025-0674": ["모양#2", "모양(추측)"],
  "jbv2025-0109": ["살#1", "살(몸의 살)"], "jbv2025-0189": ["살#2", "살(나이)"],
  "jbv2025-0215": ["다섯#1", "다섯(수)"], "jbv2025-0395": ["다섯#2", "다섯(관형사)"],
  "jbv2025-0216": ["여섯#1", "여섯(수)"], "jbv2025-0396": ["여섯#2", "여섯(관형사)"],
  "jbv2025-0218": ["여덟#1", "여덟(수)"], "jbv2025-0397": ["여덟#2", "여덟(관형사)"],
  "jbv2025-0219": ["아홉#1", "아홉(수)"], "jbv2025-0398": ["아홉#2", "아홉(관형사)"],
  "jbv2025-0233": ["갈다#1", "갈다(바꾸다)"], "jbv2025-0234": ["갈다#2", "갈다(날을 갈다)"],
  "jbv2025-0235": ["고르다#1", "고르다(가려내다)"], "jbv2025-0696": ["고르다#2", "고르다(고르게 하다)"],
  "jbv2025-0236": ["감다#1", "감다(눈을 감다)"], "jbv2025-0237": ["감다#2", "감다(머리를 감다)"],
  "jbv2025-0271": ["부르다#1", "부르다(부르다)"], "jbv2025-0354": ["부르다#2", "부르다(배부르다)"],
  "jbv2025-0273": ["바르다#1", "바르다(바르다)"], "jbv2025-0841": ["바르다#2", "바르다(곧게 하다)"],
  "jbv2025-0281": ["있다#1", "있다(머물다)"], "jbv2025-0363": ["있다#2", "있다(존재하다)"],
  "jbv2025-0292": ["열다#1", "열다(열다)"], "jbv2025-0293": ["열다#2", "열다(열매가 열리다)"],
  "jbv2025-0301": ["끼다#1", "끼다(끼우다)"], "jbv2025-0794": ["끼다#3", "끼다(퍼지다)"],
  "jbv2025-0312": ["뛰다#1", "뛰다(달리다)"], "jbv2025-0313": ["뛰다#2", "뛰다(심장이 뛰다)"],
  "jbv2025-0314": ["뜨다#1", "뜨다(눈을 뜨다)"], "jbv2025-0798": ["뜨다#2", "뜨다(떠오르다)"],
  "jbv2025-1328": ["뜨다#3", "뜨다(발효하다)"],
  "jbv2025-0336": ["낮다#1", "낮다(높이가 낮다)"], "jbv2025-0822": ["낮다#2", "낮다(수준이 낮다)"],
  "jbv2025-0341": ["달다#1", "달다(달콤하다)"], "jbv2025-0713": ["달다#2", "달다(매달다)"],
  "jbv2025-0435": ["참#1", "참(정말)"], "jbv2025-0450": ["참#2", "참(문득)"],
  "jbv2025-0457": ["김#1", "김(잡초)"], "jbv2025-0633": ["김#2", "김(수증기)"],
  "jbv2025-0569": ["띠#1", "띠(띠풀)"], "jbv2025-0665": ["띠#2", "띠(십이지)"],
  "jbv2025-0634": ["깃#1", "깃(깃털)"], "jbv2025-1183": ["깃#2", "깃(옷깃)"],
  "jbv2025-0726": ["맡다#1", "맡다(냄새를 맡다)"], "jbv2025-0727": ["맡다#2", "맡다(책임을 맡다)"],
  "jbv2025-0738": ["말다#1", "말다(돌돌 감다)"], "jbv2025-1320": ["말다#3", "말다(물에 담그다)"],
  "jbv2025-0852": ["밭다#1", "밭다(숨이 차다)"], "jbv2025-1286": ["밭다#2", "밭다(눌어붙다)"],
  "jbv2025-1205": ["떼#1", "떼(잔디)"], "jbv2025-1206": ["떼#2", "떼(뗏목)"],
  "jbv2025-1228": ["곯다#1", "곯다(덜 차다)"], "jbv2025-1340": ["곯다#2", "곯다(상하다)"],
};

/** 동형이의어 번호·공백 제거 (감사 스크립트와 같은 정규화) */
function norm(s) {
  return String(s ?? "").replace(/[0-9¹²³⁴⁵⁶⁷⁸⁹⁰]+$/u, "").replace(/\s+/g, "");
}

function bookOrder(a, b) {
  return (
    LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] ||
    a.chapter_no - b.chapter_no ||
    a.pdf_page - b.pdf_page ||
    (a.id < b.id ? -1 : 1)
  );
}

/** n개를 8~10개씩 k유닛으로 균등 분할 */
function chunkWords(n) {
  let k = Math.ceil(n / 10);
  while (n / k < 8) k -= 1;
  const base = Math.floor(n / k);
  const rem = n % k;
  const sizes = [];
  for (let i = 0; i < k; i++) sizes.push(base + (i < rem ? 1 : 0));
  return sizes;
}

/** 유닛 order(1-based) → 해녀 rankIndex(0-4) */
function rankIndexOfOrder(order) {
  if (order <= 23) return 0; // 애기해녀: 초급 전반
  if (order <= 45) return 1; // 하군: 초급 후반
  if (order <= 70) return 2; // 중군: 중급 전반
  if (order <= 95) return 3; // 상군: 중급 후반
  return 4; // 대상군: 고급 전체
}

function main() {
  const entries = [...BOOK].sort(bookOrder);
  if (entries.length !== 1501) throw new Error(`책 entries가 1501개가 아님: ${entries.length}`);

  // --- lexemes.json ---
  const lexemes = [];
  const seqByEntryId = new Map();
  const formToSeqs = new Map(); // 정규화 표제형 → 새 seq 목록 (음원 매칭용)
  const counters = { 초급: 0, 중급: 0, 고급: 0 };
  for (const e of entries) {
    const pos = POS_MAP[e.pos];
    if (!pos) throw new Error(`미매핑 품사: ${e.pos} (${e.id})`);
    const idx = counters[e.level]++;
    const seq = String(SEQ_BASE[e.level] + idx);
    seqByEntryId.set(e.id, seq);
    // jeju_forms 추출 누락 1건(jbv2025-0146 옆): 제주어에서도 같은 말이므로 표준어로 폴백
    const jeju = e.jeju_forms[0] ?? e.standard[0];
    if (!e.jeju_forms[0]) console.log(`폴백: ${e.id} jeju = standard \"${e.standard[0]}\"`);
    const lexeme = {
      seq,
      jeju,
      standard: e.standard.length > 0 ? e.standard[0] : jeju, // 고유어: 대응어 없으면 그대로
      definition: e.definition,
      level: LEVEL_ID[e.level],
      partOfSpeech: pos,
      pendingExample: true,
    };
    if (e.jeju_forms.length > 1) lexeme.otherJejuForms = e.jeju_forms.slice(1);
    if (e.contains_pua) lexeme.containsPua = true;
    const split = CONCEPT_SPLIT[e.id];
    if (split) {
      lexeme.conceptId = split[0];
      lexeme.quizGloss = split[1];
    }
    // 출처 (콘텐츠 원장 전용, 빌드 산출물에는 안 나감)
    lexeme.bookRef = { id: e.id, pdfPage: e.pdf_page };
    lexemes.push(lexeme);
    for (const form of e.jeju_forms) {
      const key = norm(form);
      if (!formToSeqs.has(key)) formToSeqs.set(key, []);
      if (!formToSeqs.get(key).includes(seq)) formToSeqs.get(key).push(seq);
    }
  }
  const seqSet = new Set(lexemes.map((l) => l.seq));
  if (seqSet.size !== lexemes.length) throw new Error("seq 중복 발생");

  // --- units.json ---
  const units = [];
  let order = 0;
  for (const level of ["초급", "중급", "고급"]) {
    const levelSeqs = entries.filter((e) => e.level === level).map((e) => seqByEntryId.get(e.id));
    const sizes = chunkWords(levelSeqs.length);
    let cursor = 0;
    sizes.forEach((size, ui) => {
      order += 1;
      const wordSeqs = levelSeqs.slice(cursor, cursor + size);
      cursor += size;
      units.push({
        id: `${UNIT_PREFIX[level]}-${String(ui + 1).padStart(2, "0")}`,
        title: `${LEVEL_TITLE[level]} ${ui + 1}`,
        themeId: LEVEL_ID[level],
        rankIndex: rankIndexOfOrder(order),
        order,
        wordSeqs,
      });
    });
  }
  if (order !== 151) throw new Error(`유닛 수 151이 아님: ${order}`);
  const placedCount = units.reduce((s, u) => s + u.wordSeqs.length, 0);
  if (placedCount !== 1501) throw new Error(`배치 단어 수 1501이 아님: ${placedCount}`);

  // --- 음원: 8/26 seq → 제주어 → 새 seq로 복사 ---
  const oldSeqToJeju = new Map();
  const unitList = Array.isArray(OLD_UNITS) ? OLD_UNITS : OLD_UNITS.units ?? [];
  for (const unit of unitList) {
    for (const w of unit.words ?? []) oldSeqToJeju.set(w.seq, w.jeju);
  }
  const files = readdirSync(AUDIO_DIR).filter((f) => f.endsWith(".mp3"));
  let copied = 0;
  const noOldMap = [];
  const noMatch = [];
  const collisions = [];
  for (const file of files) {
    const oldSeq = file.slice(0, -4);
    const jeju = oldSeqToJeju.get(oldSeq);
    if (!jeju) { noOldMap.push(oldSeq); continue; }
    const targets = formToSeqs.get(norm(jeju)) ?? [];
    if (targets.length === 0) { noMatch.push(oldSeq); continue; }
    for (const seq of targets) {
      const dest = path.join(AUDIO_DIR, `${seq}.mp3`);
      if (existsSync(dest)) { collisions.push(`${oldSeq}→${seq}`); continue; }
      copyFileSync(path.join(AUDIO_DIR, file), dest);
      copied += 1;
    }
  }

  writeFileSync(path.join(ROOT, "content/lexemes.json"), JSON.stringify(lexemes, null, 2) + "\n", "utf8");
  writeFileSync(path.join(ROOT, "content/units.json"), JSON.stringify(units, null, 2) + "\n", "utf8");

  console.log(`lexemes: ${lexemes.length}, units: ${units.length}`);
  console.log(`음원 복사: ${copied}개 파일`);
  console.log(`8/26 매핑 없음: ${noOldMap.length}, 책 매칭 없음: ${noMatch.length}, 충돌: ${collisions.length}`);
  if (collisions.length > 0) console.log("충돌:", collisions.slice(0, 10).join(", "));
}

main();
