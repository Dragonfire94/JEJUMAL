import { test } from "node:test";
import assert from "node:assert/strict";
import { toQuestionJeju, toQuestionStandard, planConversions } from "./diversify-endings.mjs";

test("toQuestionJeju는 -수다/-우다로 끝날 때만, 어간을 안 건드리고 바꾼다", () => {
  assert.equal(toQuestionJeju("밥을 먹었수다."), "밥을 먹었수과?");
  assert.equal(toQuestionJeju("바당이 좋아수다."), "바당이 좋아수과?");
  assert.equal(toQuestionJeju("이레 옵서 하영 좋았우다."), "이레 옵서 하영 좋았우꽈?");
  assert.equal(toQuestionJeju("이미 물어봤어마씸."), null);
  assert.equal(toQuestionJeju("이미 수과? 물었지."), null);
});

test("toQuestionStandard는 합쇼체와 해요체를 다르게 처리한다", () => {
  assert.equal(toQuestionStandard("밥을 먹었습니다."), "밥을 먹었습니까?");
  assert.equal(toQuestionStandard("집에 갔습니다."), "집에 갔습니까?");
  assert.equal(toQuestionStandard("밥을 먹었어요."), "밥을 먹었어요?");
  assert.equal(toQuestionStandard("좋습니다."), "좋습니까?");
});

test("planConversions는 후보가 2개 이상인 유닛만, 그 절반만 바꾼다", () => {
  const examples = [
    { seq: "1", jeju: "하나 했수다.", standard: "하나 했어요.", source: {} },
    { seq: "2", jeju: "둘도 했수다.", standard: "둘도 했어요.", source: {} },
    { seq: "3", jeju: "셋도 했수다.", standard: "셋도 했어요.", source: {} },
    { seq: "4", jeju: "넷은 달라마씸.", standard: "넷은 달라요.", source: {} },
  ];
  const units = [{ id: "u1", wordSeqs: ["1", "2", "3", "4"] }];
  const { converted } = planConversions(examples, units);
  // 후보 3개(1,2,3) 중 floor(3/2)=1개만 바뀌어야 한다
  assert.equal(converted.length, 1);
  const changed = examples.filter((e) => e.jeju.endsWith("수과?"));
  assert.equal(changed.length, 1);
  const untouched = examples.filter((e) => e.jeju.endsWith("수다."));
  assert.equal(untouched.length, 2);
});

test("planConversions는 이미 다양한 유닛(3종 이상)은 건드리지 않는다", () => {
  const examples = [
    { seq: "1", jeju: "하나 했수다.", standard: "하나 했어요.", source: {} },
    { seq: "2", jeju: "둘도 했수다.", standard: "둘도 했어요.", source: {} },
    { seq: "3", jeju: "셋은 달라마씸.", standard: "셋은 달라요.", source: {} },
    { seq: "4", jeju: "넷은 오라게.", standard: "넷은 와.", source: {} },
  ];
  const units = [{ id: "u1", wordSeqs: ["1", "2", "3", "4"] }];
  const { converted } = planConversions(examples, units);
  assert.equal(converted.length, 0);
});

test("planConversions는 후보가 1개뿐이면 건드리지 않는다(그래봐야 여전히 2종)", () => {
  const examples = [
    { seq: "1", jeju: "하나 했수다.", standard: "하나 했어요.", source: {} },
    { seq: "2", jeju: "둘은 달라마씸.", standard: "둘은 달라요.", source: {} },
  ];
  const units = [{ id: "u1", wordSeqs: ["1", "2"] }];
  const { converted } = planConversions(examples, units);
  assert.equal(converted.length, 0);
});

test("바뀐 예문에는 편집 사유가 기록된다", () => {
  const examples = [
    { seq: "1", jeju: "하나 했수다.", standard: "하나 했어요.", source: { type: "legacy" } },
    { seq: "2", jeju: "둘도 했수다.", standard: "둘도 했어요.", source: { type: "legacy" } },
    { seq: "3", jeju: "셋은 달라마씸.", standard: "셋은 달라요.", source: { type: "legacy" } },
  ];
  const units = [{ id: "u1", wordSeqs: ["1", "2", "3"] }];
  planConversions(examples, units);
  const changed = examples.find((e) => e.jeju.endsWith("?"));
  assert.ok(changed.source.editReason.includes("종결어미 다양화"));
  assert.equal(changed.source.type, "legacy", "원래 출처 타입은 그대로 보존돼야 한다");
});
