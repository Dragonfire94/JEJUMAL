import { test } from "node:test";
import assert from "node:assert/strict";
import { ending, distribution, unitsUnderThreshold } from "./measure-endings.mjs";

test("ending()은 알려진 종결형을 정확히 잡는다", () => {
  assert.equal(ending("먹었수다."), "수다");
  assert.equal(ending("먹었수다"), "수다");
  assert.equal(ending("먹었어마씸?"), "마씸");
  assert.equal(ending("고와."), "기타");
});

test("distribution()은 개수와 비율을 내림차순으로 준다", () => {
  const rows = distribution(["a수다", "b수다", "c마씸"]);
  assert.equal(rows[0].ending, "수다");
  assert.equal(rows[0].count, 2);
  assert.equal(rows[0].share, 2 / 3);
  assert.equal(rows[1].ending, "마씸");
});

test("unitsUnderThreshold는 종결어미 종류가 threshold 이하인 유닛만 고른다", () => {
  const units = [
    { id: "u1", words: [{ examples: [{ jeju: "a수다" }] }, { examples: [{ jeju: "b수다" }] }] },
    { id: "u2", words: [{ examples: [{ jeju: "a수다" }] }, { examples: [{ jeju: "b마씸" }] }, { examples: [{ jeju: "c게" }] }] },
  ];
  const flagged = unitsUnderThreshold(units, 2);
  assert.deepEqual(flagged.map((r) => r.id), ["u1"]);
});

test("ㅂ서 surface forms canonicalize to 읍서", () => {
  assert.equal(ending("혼저 옵서."), "읍서");
  assert.equal(ending("이것 좀 봐 줍서."), "읍서");
  assert.equal(ending("조심헙서."), "읍서");
  assert.equal(ending("이디 앚입서."), "읍서");
  assert.equal(ending("여기 놉서."), "읍서");
  assert.equal(ending("잘 닫읍서."), "읍서");
});

test("existing known endings stay exact", () => {
  assert.equal(ending("오늘 옵수다."), "수다");
  assert.equal(ending("그렇주."), "주");
  assert.equal(ending("가라."), "라");
});
