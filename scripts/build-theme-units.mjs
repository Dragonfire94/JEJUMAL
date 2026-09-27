#!/usr/bin/env node
// 테마 우선 유닛 재구성 (2026-09-27 승인).
// data/theme-assignments.json (classify-themes.mjs 산출물)을 읽어
// content/units.json을 테마별 유닛으로 다시 쓴다.
// lexemes.json / seq / 음원 파일은 그대로 둔다.
//
// 규칙:
// - 테마 순서는 평균 난이도(초급0/중급1/고급2)가 낮은 순 = 쉬운 테마부터
// - 테마 안에서는 초급 → 중급 → 고급 순, 같은 등급 안에서는 책 순서
// - 유닛당 8~10개 (chunkWords 균등 분할)
// - 동형이의어 쌍은 theme-assignments 단계에서 이미 같은 테마로 강제됨
//
//   node scripts/build-theme-units.mjs
//
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const BOOK = JSON.parse(
  readFileSync(path.join(ROOT, "data/jeju-basic-vocab-2025/vocab.json"), "utf8"),
).entries;
const ASSIGN = JSON.parse(
  readFileSync(path.join(ROOT, "data/theme-assignments.json"), "utf8"),
).assignments;
const LEXEMES = JSON.parse(readFileSync(path.join(ROOT, "content/lexemes.json"), "utf8"));

const THEMES = [
  { id: "greeting", title: "기초/인사" },
  { id: "family", title: "가족/사람" },
  { id: "body", title: "몸/건강" },
  { id: "food", title: "음식" },
  { id: "market", title: "시장에서" },
  { id: "home", title: "집안일" },
  { id: "sea", title: "바다/물질" },
  { id: "farm", title: "농사" },
  { id: "nature", title: "자연/날씨" },
  { id: "animals", title: "동식물" },
  { id: "move", title: "이동" },
  { id: "work", title: "일/노동" },
  { id: "emotion", title: "감정/성격" },
  { id: "time", title: "시간/방향/수량" },
];

const LEVEL_ORDER = { 초급: 0, 중급: 1, 고급: 2 };

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

function bookOrder(a, b) {
  return (
    LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level] ||
    a.chapter_no - b.chapter_no ||
    a.pdf_page - b.pdf_page ||
    (a.id < b.id ? -1 : 1)
  );
}

function main() {
  if (BOOK.length !== 1501) throw new Error(`책 entries가 1501개가 아님: ${BOOK.length}`);
  const unassigned = BOOK.filter((e) => !ASSIGN[e.id]);
  if (unassigned.length > 0)
    throw new Error(`미분류 ${unassigned.length}개: ${unassigned.map((e) => e.id).join(", ")}`);

  // seq 조회: lexemes.json의 bookRef.id 경유
  const seqByEntryId = new Map(LEXEMES.map((l) => [l.bookRef.id, l.seq]));
  const missing = BOOK.filter((e) => !seqByEntryId.has(e.id));
  if (missing.length > 0) throw new Error(`seq 없음: ${missing.map((e) => e.id).join(", ")}`);

  // 테마별 평균 난이도로 순서 결정 (쉬운 테마부터)
  const themeAvg = new Map();
  for (const t of THEMES) {
    const ids = BOOK.filter((e) => ASSIGN[e.id] === t.id);
    const avg = ids.reduce((s, e) => s + LEVEL_ORDER[e.level], 0) / ids.length;
    themeAvg.set(t.id, avg);
  }
  const ordered = [...THEMES].sort((a, b) => themeAvg.get(a.id) - themeAvg.get(b.id));
  console.log("테마 순서:", ordered.map((t) => `${t.title}(${themeAvg.get(t.id).toFixed(2)})`).join(" → "));

  const units = [];
  let order = 0;
  const perTheme = [];
  for (const t of ordered) {
    const entries = BOOK.filter((e) => ASSIGN[e.id] === t.id).sort(bookOrder);
    const sizes = chunkWords(entries.length);
    perTheme.push([t.title, entries.length, sizes.length]);
    let cursor = 0;
    sizes.forEach((size, ui) => {
      order += 1;
      const wordSeqs = entries.slice(cursor, cursor + size).map((e) => seqByEntryId.get(e.id));
      cursor += size;
      units.push({
        id: `${t.id}-${String(ui + 1).padStart(2, "0")}`,
        title: `${t.title} ${ui + 1}`,
        themeId: t.id,
        rankIndex: 0, // 아래에서 재계산
        order,
        wordSeqs,
      });
    });
  }

  // 해녀 랭크: 기존 경계(23/45/70/95/151)를 새 유닛 수에 비례 배분
  const total = units.length;
  const bounds = [23, 45, 70, 95].map((b) => Math.round((total * b) / 151));
  for (const u of units) {
    u.rankIndex = bounds.filter((b) => u.order > b).length;
  }

  const placed = units.reduce((s, u) => s + u.wordSeqs.length, 0);
  if (placed !== 1501) throw new Error(`배치 단어 수 1501이 아님: ${placed}`);
  const allSeqs = units.flatMap((u) => u.wordSeqs);
  if (new Set(allSeqs).size !== 1501) throw new Error("seq 중복/누락 발생");

  writeFileSync(path.join(ROOT, "content/units.json"), JSON.stringify(units, null, 2) + "\n", "utf8");

  console.log(`유닛 ${total}개, 랭크 경계: ${bounds.join("/")}`);
  for (const [title, n, k] of perTheme) console.log(`  ${title}: ${n}단어 → ${k}유닛`);
}

main();
