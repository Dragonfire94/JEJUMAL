import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { test } from "node:test";
import { assembleUnits, loadContentBundle, validateBundle } from "./build-content.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const UNITS_PATH = path.join(ROOT, "src/data/units.json");

test("content/ 원장은 유효한 스키마와 상호참조를 가진다", () => {
  const bundle = loadContentBundle();
  // 문제가 있으면 여기서 예외를 던진다.
  assert.doesNotThrow(() => validateBundle(bundle));
});

test("committed src/data/units.json은 content/ 원장에서 그대로 재생성된 결과와 일치한다", () => {
  // 누군가 units.json을 직접 손으로 고치고 content/ 쪽을 안 고치면 이 테스트가 잡아낸다.
  const bundle = validateBundle(loadContentBundle());
  const rebuilt = assembleUnits(bundle);
  const committed = JSON.parse(readFileSync(UNITS_PATH, "utf8"));
  assert.deepEqual(
    rebuilt,
    committed,
    "src/data/units.json이 content/ 원장과 어긋납니다. node scripts/build-content.mjs 를 다시 실행해서 커밋하세요.",
  );
});

test("유닛은 정확히 100개(단어 1000개), 표제어 원장은 그보다 많을 수 있다", () => {
  // content/lexemes.json은 2025 기본어휘 대량 반영(pendingPlacement) 이후로 유닛에
  // 배정된 1,000개보다 많은 표제어를 담을 수 있다 — 유닛 배정 전 "대기" 단어들도
  // 원장에는 있어야 나중에 채울 수 있기 때문이다. 그래서 유닛/단어 수는 정확히
  // 고정하되, lexemes 총수는 "유닛에 배정된 수 이상"으로만 검증한다.
  const bundle = validateBundle(loadContentBundle());
  assert.equal(bundle.units.length, 100);
  const wordsInUnits = bundle.units.reduce((sum, u) => sum + u.wordSeqs.length, 0);
  assert.equal(wordsInUnits, 1000);
  assert.ok(bundle.lexemes.length >= wordsInUnits);
});
