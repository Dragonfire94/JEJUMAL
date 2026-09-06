import { test } from "node:test";
import assert from "node:assert/strict";
import { auditWord, auditAll } from "./audit-word-usage.mjs";

function idx(tokens) {
  const map = new Map();
  for (const [token, forms] of Object.entries(tokens)) {
    const key = token[0];
    if (!map.has(key)) map.set(key, []);
    map.get(key).push([token, forms]);
  }
  return map;
}

function lifeIdx(pairs) {
  const map = new Map();
  for (const { jeju, standard } of pairs) {
    for (const token of jeju.split(/\s+/)) {
      const key = token[0];
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({ token, standard });
    }
  }
  return map;
}

test("exact 말뭉치 등장 3회 이상이면 confirmed", () => {
  const tokens = { 바당: [["바다", 5]] };
  const lexeme = { seq: "1", jeju: "바당", standard: "바다" };
  const r = auditWord(lexeme, tokens, idx(tokens), new Map());
  assert.equal(r.exactHits, 5);
  assert.equal(r.tier, "confirmed");
});

test("동형이의어 오염 방지: 뜻이 안 통하는 매핑은 안 센다", () => {
  // "상"은 사전 뜻으로 "향"이지만 말뭉치에서는 "사서/사고"의 방언 표기일 뿐이다.
  const tokens = { 상: [["사서", 429], ["사고", 38]] };
  const lexeme = { seq: "5177", jeju: "상", standard: "향" };
  const r = auditWord(lexeme, tokens, idx(tokens), new Map());
  assert.equal(r.exactHits, 0);
  assert.equal(r.tier, "unconfirmed");
});

test("동형이의어 중 뜻이 통하는 것만 골라서 센다", () => {
  const tokens = { 성: [["형", 41], ["서서", 36], ["화", 3]] };
  const lexeme = { seq: "544", jeju: "성", standard: "형" };
  const r = auditWord(lexeme, tokens, idx(tokens), new Map());
  assert.equal(r.exactHits, 41, "형만 세고 서서/화는 안 세야 한다");
});

test("1글자 뜻은 완전일치만 인정한다(포함 검사는 너무 헐겁다)", () => {
  const tokens = { 형: [["형편", 10]] }; // "형편"엔 "형"이 포함되지만 다른 낱말이다
  const lexeme = { seq: "1", jeju: "형", standard: "형" };
  const r = auditWord(lexeme, tokens, idx(tokens), new Map());
  assert.equal(r.exactHits, 0);
});

test("말뭉치 1~2회는 rare, 0회는 unconfirmed", () => {
  const tokens = { 각씨: [["아내", 2]] };
  const lexeme = { seq: "1", jeju: "각씨", standard: "아내" };
  const r = auditWord(lexeme, tokens, idx(tokens), new Map());
  assert.equal(r.tier, "rare");

  const r2 = auditWord({ seq: "2", jeju: "없는말", standard: "없음" }, {}, new Map(), new Map());
  assert.equal(r2.tier, "unconfirmed");
});

test("생활방언 등장은 그 줄의 표준어 풀이로 동형이의어를 가른다", () => {
  const pairs = [
    { jeju: "괸당집이 상 난에 감실거우다.", standard: "친척집이 초상이 나서 갈 것입니다." },
  ];
  const lexeme = { seq: "5177", jeju: "상", standard: "향" };
  const r = auditWord(lexeme, {}, new Map(), lifeIdx(pairs));
  assert.equal(r.lifeDialectHits, 0, "이 줄의 '상'은 초상이지 향이 아니다");
});

test("생활방언 줄의 뜻이 실제로 통하면 confirmed로 올린다", () => {
  const pairs = [{ jeju: "이레 옵서.", standard: "이리 오십시오." }];
  const lexeme = { seq: "1", jeju: "이레", standard: "이리" };
  const r = auditWord(lexeme, {}, new Map(), lifeIdx(pairs));
  assert.equal(r.lifeDialectHits, 1);
  assert.equal(r.tier, "confirmed");
});

test("용언은 사전 인용형이 아니라 어간으로 활용형을 찾는다", () => {
  // "족다"(작다)는 어간 "족"에 조사·어미가 붙은 "족다는/족다로"처럼
  // 표준어 쪽도 같이 "작다는/작다로"로 이어지는 형태로 말뭉치에 나온다 —
  // 표제어 그대로("족다")로는 못 찾을 활용형이다.
  const tokens = { 족다는: [["작다는", 4]], 족다로: [["작다로", 2]] };
  const lexeme = { seq: "1", jeju: "족다", standard: "작다", partOfSpeech: "adjective" };
  const r = auditWord(lexeme, tokens, idx(tokens), new Map());
  assert.equal(r.inflectedHits, 6);
});

test("용언 어간은 1글자여도 활용형을 찾는다(명사와 달리 뜻 검사가 보호막)", () => {
  const tokens = { 께다마씸: [["깨다마씸", 3]] };
  const lexeme = { seq: "1", jeju: "께다", standard: "깨다", partOfSpeech: "verb" };
  const r = auditWord(lexeme, tokens, idx(tokens), new Map());
  assert.equal(r.inflectedHits, 3);
});

test("명사는 1글자 표제어의 활용형 탐색을 안 한다(동형이의어 오탐이 너무 큼)", () => {
  // 뜻은 우연히 통하더라도("형") 1글자 명사는 애초에 활용형 탐색 대상에서 뺀다.
  const tokens = { 형편: [["형", 100]] };
  const lexeme = { seq: "1", jeju: "형", standard: "형", partOfSpeech: "noun" };
  const r = auditWord(lexeme, tokens, idx(tokens), new Map());
  assert.equal(r.inflectedHits, 0);
});

test("활용형 증거가 충분히 많으면(5회 이상) confirmed로 올라간다", () => {
  const tokens = { 족다는: [["작다는", 5]] };
  const lexeme = { seq: "1", jeju: "족다", standard: "작다", partOfSpeech: "adjective" };
  const r = auditWord(lexeme, tokens, idx(tokens), new Map());
  assert.equal(r.tier, "confirmed");
});

test("auditAll은 lexemes 전부에 대해 한 줄씩 결과를 낸다", () => {
  const lexemes = [
    { seq: "1", jeju: "바당", standard: "바다" },
    { seq: "2", jeju: "엇는말", standard: "없음" },
  ];
  const tokens = { 바당: [["바다", 10]] };
  const rows = auditAll(lexemes, tokens, []);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].tier, "confirmed");
  assert.equal(rows[1].tier, "unconfirmed");
});
