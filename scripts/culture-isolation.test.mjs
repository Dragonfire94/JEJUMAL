// 3C-3C — Culture Track이 main curriculum(유닛/퀴즈/SRS)을 오염하지
// 않는다는 것을 자동으로 고정한다(docs/3c3b-culture-track-contract.md
// §5의 5개 invariant). UI를 렌더하지 않고도 정적 검사로 확인 가능한
// 것들만 다룬다 — 무거운 browser framework를 새로 들이지 않는다.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function read(relPath) {
  return readFileSync(path.join(ROOT, relPath), "utf8");
}

test("INVARIANT 1 — culture.ts/culture 라우트는 src/lib/units.ts를 import하지 않는다", () => {
  for (const file of ["src/lib/culture.ts", "src/routes/culture.index.tsx", "src/routes/culture.$id.tsx"]) {
    const src = read(file);
    assert.ok(!/from ["']@\/lib\/units["']/.test(src), `${file}이 @/lib/units를 import합니다`);
  }
});

test("INVARIANT 2 — culture.ts/culture 라우트는 src/lib/quiz.ts를 import하지 않는다", () => {
  for (const file of ["src/lib/culture.ts", "src/routes/culture.index.tsx", "src/routes/culture.$id.tsx"]) {
    const src = read(file);
    assert.ok(!/from ["']@\/lib\/quiz["']/.test(src), `${file}이 @/lib/quiz를 import합니다`);
  }
});

test("INVARIANT 3 — culture 상세 라우트는 src/lib/progress.ts(main SRS)를 import하지 않는다", () => {
  const src = read("src/routes/culture.$id.tsx");
  assert.ok(!/from ["']@\/lib\/progress["']/.test(src), "culture.$id.tsx가 @/lib/progress를 import합니다");
});

test("INVARIANT 5(일부) — build-culture.mjs는 main production 파일을 쓰지 않는다", () => {
  const src = read("scripts/build-culture.mjs");
  // 읽기는 허용(vocab.json provenance 대조, units.json/life-dialect.json
  // 문자열 매칭)하지만, writeFileSync 대상은 오직 culture 산출물이어야 한다.
  const writeCalls = [...src.matchAll(/writeFileSync\(([A-Z_]+),/g)].map((m) => m[1]);
  assert.deepEqual(writeCalls, ["OUT_PATH"], "build-culture.mjs가 OUT_PATH 외의 경로에 씁니다");
  assert.ok(src.includes('OUT_PATH = path.join(ROOT, "src/data/culture-items.json")'));
  assert.ok(!src.includes('"content/lexemes.json"'));
  assert.ok(!src.includes('"content/units.json"'));
  assert.ok(!src.includes('"content/examples.json"'));
});

test("audio button 금지 — culture.$id.tsx는 AudioButton/playWord/TTS를 import하지 않는다", () => {
  const src = read("src/routes/culture.$id.tsx");
  assert.ok(!/from ["']@\/components\/audio-button["']/.test(src));
  assert.ok(!/from ["']@\/lib\/audio["']/.test(src));
  assert.ok(!/speechSynthesis/.test(src));
});

test("culture quiz 없음 — culture 라우트에 quiz 관련 컴포넌트가 없다", () => {
  for (const file of ["src/routes/culture.index.tsx", "src/routes/culture.$id.tsx"]) {
    const src = read(file);
    assert.ok(!/quiz-view|inline-question|buildLesson|buildInlineQuestions/.test(src), `${file}에 quiz 관련 코드가 있습니다`);
  }
});

test("main placed/pendingPlacement 불변 — content 원장 기준 989/59 그대로다", () => {
  const lexemes = JSON.parse(read("content/lexemes.json"));
  const units = JSON.parse(read("content/units.json"));
  const placed = units.reduce((n, u) => n + u.wordSeqs.length, 0);
  const pending = lexemes.filter((l) => l.pendingPlacement).length;
  assert.equal(lexemes.length, 1048);
  assert.equal(placed, 989);
  assert.equal(pending, 59);
  assert.equal(units.length, 100);
});
