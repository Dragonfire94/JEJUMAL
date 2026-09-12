import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  mappingMatches,
  usageTier,
  classifyAihub,
  reviewDuplicates,
  buildAudit,
  CATALOG,
  stripHomograph,
} from "./audit_new_basic_vocab_candidates.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

test("의미 앵커 일치는 짧은 표준어만 인정하고 긴 definition 문장은 쓰지 않는다", () => {
  assert.equal(mappingMatches("삼촌", "삼촌"), true);
  assert.equal(mappingMatches("그렇게", "그렇게"), true);
  assert.equal(
    mappingMatches("부모님의 남자 형제를 이르거나 부르는 말", "삼촌"),
    false,
    "긴 뜻풀이를 앵커로 넣으면 삼촌 mapping이 실패하는 것이 3C-1.1 결함이다. 짧은 앵커만 쓴다.",
  );
});

test("봅서 호격 앵커는 보세요 mapping을 의미 일치로 치지 않는다", () => {
  assert.equal(mappingMatches("여보세요", "보세요"), false);
  assert.equal(mappingMatches("이봐요", "봐요"), false);
  assert.equal(mappingMatches("여보시오", "보십시오"), false);
});

test("형용사는 어간 활용형을 의미 일치로 인정한다", () => {
  assert.equal(mappingMatches("맛있다", "맛있어", true), true);
  assert.equal(mappingMatches("맛있다", "맛있다고", true), true);
});

test("1글자 앵커는 완전 일치만 인정한다", () => {
  assert.equal(mappingMatches("파도", "파도"), true);
  assert.equal(mappingMatches("형", "형편"), false);
});

test("usageEvidence 문턱은 decision과 무관하다", () => {
  assert.equal(usageTier({ meaningMatched: 81, lifeVerified: 0 }), "STRONG");
  assert.equal(usageTier({ meaningMatched: 2, lifeVerified: 1 }), "MEDIUM");
  assert.equal(usageTier({ meaningMatched: 1, lifeVerified: 0 }), "WEAK");
  assert.equal(usageTier({ meaningMatched: 0, lifeVerified: 0 }), "NONE");
});

test("AI Hub 분류는 raw와 meaning-matched를 분리하고 verifiedContextHits를 만들지 않는다", () => {
  const tokens = {
    삼춘: [
      ["삼촌", 81],
      ["아저씨", 6],
      ["할머니", 13],
    ],
  };
  const firstCharIndex = new Map([["삼", [["삼춘", tokens.삼춘]]]]);
  const result = classifyAihub({
    forms: ["삼춘"],
    pos: "명사",
    meaningTerms: ["삼촌", "아저씨"],
    rejectTerms: ["할머니"],
    tokens,
    firstCharIndex,
  });
  assert.equal(result.rawFormHits, 100);
  assert.equal(result.meaningMatchedMappingHits, 87);
  assert.equal(result.rejectedMappingHits, 13);
  assert.equal(result.contextAvailable, false);
  assert.equal("verifiedContextHits" in result, false);
});

test("의미 중복 검토는 후보 trail을 남기고 기본 NO_DUPLICATE만 찍지 않는다", () => {
  const lexemes = [
    { seq: "7357", jeju: "경", standard: "그렇게" },
    { seq: "7463", jeju: "영", standard: "이렇게" },
  ];
  const review = reviewDuplicates({
    forms: ["그추룩"],
    meaningTerms: ["그렇게"],
    extraSearchTerms: ["그렇게"],
    alwaysReviewSeqs: ["7357"],
    overrides: {
      7357: { result: "SAME_CONCEPT", reason: "경이 같은 지시 부사다." },
    },
    lexemes,
  });
  assert.equal(review.status, "SAME_CONCEPT_ALREADY_PRESENT");
  assert.equal(review.candidateConceptsReviewed.length >= 1, true);
  assert.equal(review.candidateConceptsReviewed[0].seq, "7357");
  assert.equal(review.candidateConceptsReviewed[0].result, "SAME_CONCEPT");
});

test("CATALOG는 71개 후보 주표기를 모두 커버한다", () => {
  const candidates = JSON.parse(
    readFileSync(path.join(ROOT, "data/jeju-basic-vocab-2025/content-new-candidates-3a.json"), "utf8"),
  );
  for (const row of candidates) {
    assert.ok(CATALOG[row.jeju_forms[0]], `missing catalog for ${row.jeju_forms[0]}`);
    assert.ok(CATALOG[row.jeju_forms[0]].meaningTerms.length >= 1);
  }
  assert.equal(Object.keys(CATALOG).length, 71);
});

test("동형이의어 suffix 정규식은 위첨자를 벗긴다", () => {
  assert.equal(stripHomograph("복삭ᄒᆞ다1"), "복삭ᄒᆞ다");
  assert.equal(stripHomograph("빈싹²"), "빈싹");
});

test("저장소 입력으로 만든 감사는 3C-1.2 불변식을 지킨다", () => {
  const audit = JSON.parse(
    readFileSync(path.join(ROOT, "data/jeju-basic-vocab-2025/new-candidates-living-audit-3c1.json"), "utf8"),
  );
  assert.equal(audit.schemaVersion, 3);
  assert.equal(audit.summary.rows, 71);
  assert.equal(audit.summary.uniqueStableIds, 71);
  assert.equal(audit.rows.length, 71);
  for (const row of audit.rows) {
    assert.ok(row.meaningAnchors.standardTerms.length >= 1, row.jejuForms[0]);
    assert.ok(Array.isArray(row.semanticDuplicateReview.candidateConceptsReviewed));
    assert.ok(row.decisionBasis.length >= 3);
    assert.equal(row.evidence.aihub.verifiedContextHits, undefined);
    assert.equal(row.evidence.aihub.contextAvailable, false);
    assert.notEqual(row.usageEvidence, undefined);
  }
  const 삼춘 = audit.rows.find((row) => row.jejuForms[0] === "삼춘");
  assert.equal(삼춘.usageEvidence, "STRONG");
  assert.ok(삼춘.evidence.aihub.meaningMatchedMappingHits >= 80);
  assert.equal(삼춘.decision, "CORE_ADD");
  const 그추룩 = audit.rows.find((row) => row.jejuForms[0] === "그추룩");
  assert.notEqual(그추룩.usageEvidence, "NONE");
  assert.equal(그추룩.semanticDuplicateReview.status, "SAME_CONCEPT_ALREADY_PRESENT");
  assert.equal(그추룩.decision, "HOLD");
  const 봅서 = audit.rows.find((row) => row.jejuForms[0] === "봅서");
  assert.equal(
    봅서.evidence.aihub.matchedStandardTerms.some((row) => row.term === "보세요"),
    false,
  );
  assert.equal(봅서.decision, "HOLD");
  const 맛좋다 = audit.rows.find((row) => row.jejuForms[0] === "맛좋다");
  assert.equal(맛좋다.semanticDuplicateReview.status, "SAME_CONCEPT_ALREADY_PRESENT");
  const 절 = audit.rows.find((row) => row.jejuForms[0] === "절");
  assert.equal(절.semanticDuplicateReview.status, "NO_DUPLICATE");
  assert.ok(절.evidence.lifeDialect.contextVerifiedHits >= 1);
  const 메 = audit.rows.find((row) => row.jejuForms[0] === "메");
  assert.equal(메.semanticDuplicateReview.status, "POSSIBLE_DUPLICATE");
  assert.ok(메.evidence.dictionaryHomographNote.includes("메께라"));
  const culture = audit.rows.filter((row) => row.decision === "CULTURE_ADD");
  assert.equal(culture.length, 25);
  assert.ok(culture.every((row) => row.assessment.linguisticType));
});

test("buildAudit는 decision을 바꿔도 usageEvidence 계산을 그대로 둔다", () => {
  const tokens = { 삼춘: [["삼촌", 81]] };
  const audit = buildAudit({
    candidates: Array.from({ length: 71 }, (_, index) => {
      const forms = Object.keys(CATALOG);
      return {
        stable_id: `id-${index}`,
        numeric_id: `n-${index}`,
        level: "초급",
        pos: "명사",
        jeju_forms: [forms[index]],
        has_standard_equivalent: false,
      };
    }),
    vocab: Object.keys(CATALOG).map((form, index) => ({
      stableId: `id-${index}`,
      definition: `${form} 뜻`,
    })),
    lexemes: [{ seq: "7357", jeju: "경", standard: "그렇게" }],
    tokens,
    dictionary: [],
    lifeItems: [],
  });
  const 삼춘 = audit.rows.find((row) => row.jejuForms[0] === "삼춘");
  assert.equal(삼춘.usageEvidence, "STRONG");
  assert.equal(삼춘.decision, "CORE_ADD");
  const holdRow = audit.rows.find((row) => row.decision === "HOLD");
  assert.ok(holdRow);
  assert.ok(["NONE", "WEAK", "MEDIUM", "STRONG"].includes(holdRow.usageEvidence));
});
