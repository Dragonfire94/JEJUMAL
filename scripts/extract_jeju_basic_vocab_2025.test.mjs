import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { test } from "node:test";

// 2단계(2026-09-11) extractor 수정 + 2.5단계(잔여 무결성 정밀감사)
// 검증. 이 테스트는 vocab.json을 다시 생성하지 않는다(파이썬+pymupdf
// 의존성) — 커밋된 결과물을 검사해서, 알려진 병합 오류(빛/빙떡, 사람/
// 삼춘, 혀/셋딸/셋아덜, 송편/숨비소리, 오빠/오름/올레, 하나/둘/셋/넷
// 품사)가 재발하면 잡아낸다. 알려진 오류 단어는 여기(fixture)에만 쓰고,
// scripts/extract_jeju_basic_vocab_2025.py 안에는 절대 하드코딩하지
// 않는다. 2.5단계 조사 경위는
// docs/basic-vocab-2025-extractor-residual-audit.md 참고.

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const VOCAB_PATH = path.join(ROOT, "data/jeju-basic-vocab-2025/vocab.json");

function loadVocab() {
  return JSON.parse(readFileSync(VOCAB_PATH, "utf8"));
}

function findByForm(entries, form) {
  return entries.filter((e) => e.jeju_forms.includes(form));
}

const OFFICIAL_COUNTS = {
  "초급/명사": 182, "초급/의존명사": 8, "초급/대명사": 20, "초급/수사": 10,
  "초급/동사": 100, "초급/형용사": 70, "초급/관형사": 10, "초급/부사": 40, "초급/감탄사": 10,
  "중급/명사": 215, "중급/의존명사": 12, "중급/수사": 8, "중급/동사": 120,
  "중급/형용사": 80, "중급/부사": 55, "중급/감탄사": 10,
  "고급/명사": 265, "고급/동사": 120, "고급/형용사": 100, "고급/부사": 65,
};

test("vocab.json은 유효한 JSON이고 entries 배열을 가진다", () => {
  const bundle = loadVocab();
  assert.ok(Array.isArray(bundle.entries));
  assert.ok(bundle.entries.length > 0);
});

test("entry id는 전부 고유하다", () => {
  const { entries } = loadVocab();
  const ids = entries.map((e) => e.id);
  assert.equal(new Set(ids).size, ids.length, "중복된 id가 있습니다");
});

test("pdf_page는 본문 범위(7~149) 안에 있다", () => {
  const { entries } = loadVocab();
  for (const e of entries) {
    assert.ok(e.pdf_page >= 7 && e.pdf_page < 150, `${e.id}의 pdf_page=${e.pdf_page}가 범위 밖입니다`);
  }
});

test("모든 entry는 level과 pos를 가진다", () => {
  const { entries } = loadVocab();
  for (const e of entries) {
    assert.ok(e.level, `${e.id}에 level이 없습니다`);
    assert.ok(e.pos, `${e.id}에 pos가 없습니다`);
  }
});

test("모든 entry는 definition이 비어 있지 않다", () => {
  const { entries } = loadVocab();
  for (const e of entries) {
    assert.ok(e.definition && e.definition.trim().length > 0, `${e.id}의 definition이 비어 있습니다`);
  }
});

test("표준어 대응 없음(has_standard_equivalent: false)은 standard가 빈 배열로 정직하게 표시된다", () => {
  const { entries } = loadVocab();
  for (const e of entries) {
    if (!e.has_standard_equivalent) {
      assert.deepEqual(e.standard, [], `${e.id}는 표준어 대응이 없다면서 standard가 비어있지 않습니다`);
      assert.equal(e.standard_raw, null);
    } else {
      assert.ok(e.standard.length > 0, `${e.id}는 표준어 대응이 있다면서 standard가 비어있습니다`);
    }
  }
});

test("품사별 개수는 책이 스스로 인쇄한 공식 표(p.7, p.54, p.102)와 정확히 일치한다(1개 알려진 예외 제외)", () => {
  const { entries } = loadVocab();
  const counts = {};
  for (const e of entries) {
    const key = `${e.level}/${e.pos}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  const mismatches = [];
  for (const [key, official] of Object.entries(OFFICIAL_COUNTS)) {
    const got = counts[key] || 0;
    if (got !== official) mismatches.push(`${key}: got=${got} official=${official}`);
  }
  // 알려진 잔여 불일치 1건: 고급/명사 266 vs 공식 265 (+1). 2.5단계에서
  // gap 분포·전수 읽기·유사도 검사·reverseIndex 대조·source region 중복
  // 검사까지 마쳤지만 코드 버그를 찾지 못했다 — PDF 본문 자체가 266개의
  // 독립 entry를 담고 있고 책 자신의 요약표(p.102)가 어긋난 것으로
  // 잠정 결론지었다(docs/basic-vocab-2025-extractor-residual-audit.md
  // 2절). 억지로 지우거나 합치지 않고 정직하게 남겨뒀다. 이 밖의
  // 불일치가 새로 생기면 이 테스트가 실패한다.
  assert.deepEqual(mismatches, ["고급/명사: got=266 official=265"]);
});

test("초급 수사(하나~열) 10개 전체가 대명사가 아니라 수사로 정확히 분류된다 — 우측 반쪽 품사 라벨 회귀 방지", () => {
  const { entries } = loadVocab();
  // 표본이 아니라 초급 수사 챕터 전체(하나~열, 공식 10개)를 검사한다.
  const chojubSusa = entries.filter((e) => e.level === "초급" && e.pos === "수사");
  assert.equal(chojubSusa.length, 10, `초급 수사는 10개여야 하는데 ${chojubSusa.length}개입니다`);
  const counting = ["둘", "일곱", "열"];
  for (const form of counting) {
    const matches = findByForm(entries, form).filter((e) => e.level === "초급");
    assert.ok(matches.length > 0, `${form}을 찾지 못했습니다`);
    for (const e of matches) {
      assert.equal(e.pos, "수사", `${form}(${e.id})이 수사가 아니라 ${e.pos}로 분류됨`);
    }
  }
  // 옛 코드는 우측 반쪽 라벨을 안 읽어서 하나/둘/셋/넷이 대명사로
  // 잘못 분류됐었다 — 초급 대명사 안에 숫자 표현이 하나도 없어야 한다.
  const chojupDaemyeong = entries.filter((e) => e.level === "초급" && e.pos === "대명사");
  for (const e of chojupDaemyeong) {
    assert.ok(!counting.includes(e.jeju_forms[0]), `${e.id}(${e.jeju_forms})가 대명사에 남아있습니다`);
  }
});

test("빛(빗)과 빙떡은 분리된 별개 entry다 — 표준어 대응 없는 항목 병합 회귀 방지", () => {
  const { entries } = loadVocab();
  const bit = findByForm(entries, "빗").find((e) => e.standard.includes("빛"));
  const bingtteok = findByForm(entries, "빙떡")[0];
  assert.ok(bit, "빛(빗) entry를 찾지 못했습니다");
  assert.ok(bingtteok, "빙떡 entry를 찾지 못했습니다");
  assert.notEqual(bit.id, bingtteok.id);
  assert.equal(bingtteok.has_standard_equivalent, false);
  assert.ok(!bit.jeju_forms.includes("빙떡"), "빙떡이 빛 entry에 흡수되어 있습니다");
});

test("사람(사름)과 삼춘은 분리된 별개 entry다", () => {
  const { entries } = loadVocab();
  const saram = findByForm(entries, "사름").find((e) => e.standard.includes("사람"));
  const samchun = findByForm(entries, "삼춘")[0];
  assert.ok(saram, "사람(사름) entry를 찾지 못했습니다");
  assert.ok(samchun, "삼춘 entry를 찾지 못했습니다");
  assert.notEqual(saram.id, samchun.id);
  assert.equal(samchun.has_standard_equivalent, false);
  assert.ok(!saram.jeju_forms.includes("삼춘"), "삼춘이 사람 entry에 흡수되어 있습니다");
});

test("혀(세)와 셋딸·셋아덜(둘째 딸/아들)은 전부 분리된 별개 entry다", () => {
  const { entries } = loadVocab();
  const hyeo = findByForm(entries, "세").find((e) => e.standard.includes("혀"));
  const setAdeul = findByForm(entries, "셋아덜")[0];
  const setDdal = entries.find((e) => e.level === "초급" && e.pos === "명사" && e.definition.includes("둘째 딸"));
  assert.ok(hyeo, "혀(세) entry를 찾지 못했습니다");
  assert.ok(setAdeul, "셋아덜 entry를 찾지 못했습니다");
  assert.ok(setDdal, "셋딸 entry를 찾지 못했습니다");
  const ids = new Set([hyeo.id, setAdeul.id, setDdal.id]);
  assert.equal(ids.size, 3, "혀/셋딸/셋아덜 중 일부가 병합되어 있습니다");
  assert.equal(setAdeul.has_standard_equivalent, false);
  assert.equal(setDdal.has_standard_equivalent, false);
  assert.ok(!hyeo.jeju_forms.includes("셋아덜"), "셋아덜이 혀 entry에 흡수되어 있습니다");
});

test("송편(송펜)과 숨비소리는 분리된 별개 entry다", () => {
  const { entries } = loadVocab();
  const songpyeon = findByForm(entries, "송펜").find((e) => e.standard.includes("송편"));
  const sumbi = findByForm(entries, "숨비소리")[0];
  assert.ok(songpyeon, "송편(송펜) entry를 찾지 못했습니다");
  assert.ok(sumbi, "숨비소리 entry를 찾지 못했습니다");
  assert.notEqual(songpyeon.id, sumbi.id);
  assert.equal(sumbi.has_standard_equivalent, false);
  assert.ok(!songpyeon.jeju_forms.includes("숨비소리"), "숨비소리가 송편 entry에 흡수되어 있습니다");
});

test("오빠(오라방)와 오름·올레는 서로 분리된 별개 entry다", () => {
  const { entries } = loadVocab();
  const oppa = findByForm(entries, "오라방").find((e) => e.standard.includes("오빠"));
  const oreum = findByForm(entries, "오름")[0];
  const olle = findByForm(entries, "올레")[0];
  assert.ok(oppa, "오빠(오라방) entry를 찾지 못했습니다");
  assert.ok(oreum, "오름 entry를 찾지 못했습니다");
  assert.ok(olle, "올레 entry를 찾지 못했습니다");
  const ids = new Set([oppa.id, oreum.id, olle.id]);
  assert.equal(ids.size, 3, "오빠/오름/올레 중 일부가 병합되어 있습니다");
  assert.equal(oreum.has_standard_equivalent, false);
  assert.equal(olle.has_standard_equivalent, false);
});

test("병합 의심 휴리스틱(jeju_forms>=2 + 뜻풀이 문장 수 초과)을 다시 돌리면 알려진 4건(전부 확인된 정상 변이형)만 남는다", () => {
  const { entries } = loadVocab();
  const suspects = [];
  for (const e of entries) {
    if (e.jeju_forms.length < 2) continue;
    const numbered = (e.definition.match(/\d+\)/g) || []).length;
    const frags = e.definition.split(/(?<=\.)\s*/).filter((f) => f.trim());
    const nonOr = frags.filter((f) => !f.startsWith("또는"));
    if (nonOr.length - Math.max(numbered, 1) > 0) suspects.push(e.id);
  }
  // 1차 감사(수정 전) 기준 135건에서 4건으로 감소. 4건 전부 수동 검토
  // 결과 "정상 변이형"(휴리스틱 오탐)임을 확인했다(2.5단계 보고서 3절).
  // 정확히 이 4개 id만 남아야 한다 — 새 의심 후보가 생기면(id가
  // 다르면) 실패해서 알려준다.
  const KNOWN_FALSE_POSITIVES = ["jbv2025-0474", "jbv2025-1038", "jbv2025-1057", "jbv2025-1495"];
  assert.deepEqual(
    suspects.sort(),
    [...KNOWN_FALSE_POSITIVES].sort(),
    `병합 의심 후보 목록이 알려진 4건과 다릅니다: ${suspects.join(", ")}`,
  );
});

test("동형이의어 번호는 쉼표로 나열된 표준어 중 마지막 표기에만 적용된다 — 2.5단계에서 고친 버그 회귀 방지", () => {
  const { entries } = loadVocab();
  // standard_raw "고물, 소2"는 "고물"과 동형이의어 2번인 "소"를 뜻한다.
  // "고물"까지 2번으로 취급하면 안 된다.
  const gomul = entries.find((e) => e.id === "jbv2025-1130");
  assert.ok(gomul, "jbv2025-1130(쉬=고물/소)을 찾지 못했습니다");
  assert.deepEqual(gomul.standard, ["고물", "소"]);
  assert.equal(gomul.standard_homograph_no, 2);
  // 쉼표로 나열된 다른 동의어들도 숫자가 마지막 표기에만 붙는지 확인.
  for (const id of ["jbv2025-0034", "jbv2025-0198", "jbv2025-0327"]) {
    const e = entries.find((x) => x.id === id);
    assert.ok(e, `${id}를 찾지 못했습니다`);
    assert.ok(e.standard.length >= 2, `${id}는 표준어가 2개 이상이어야 합니다`);
    assert.ok(!/\d$/.test(e.standard[0]), `${id}의 첫 표준어 "${e.standard[0]}"에 번호가 잘못 남아있습니다`);
  }
});

test("PUA 매핑 확정본(confidence: high)이 재추출 후에도 유지된다", () => {
  const { entries } = loadVocab();
  // high-confidence 매핑을 재적용하지 않으면 파서가 PDF 원문을 다시 읽을 때
  // 이전 라운드에서 이미 확정한 표기가 도로 PUA 문자로 되돌아가 PUA 포함
  // entry 수가 재추출 전(약 57개) 대비 크게(약 500개 수준으로) 뛴다.
  const puaCount = entries.filter((e) => e.contains_pua).length;
  assert.ok(puaCount < 150, `PUA 포함 entry가 ${puaCount}개 — high-confidence 매핑 재적용이 안 된 것으로 보입니다(기존 수준 ~57~60개)`);
});
