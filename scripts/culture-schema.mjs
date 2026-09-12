// content/culture-items.json (원장) 스키마.
// 3C-1.2에서 CULTURE_ADD로 확정한 제주 문화어 25개를, 메인 100-unit
// curriculum과 분리된 별도 열람형 Culture Track으로 담는다
// (docs/3c3b-culture-track-contract.md 참고). build-culture.mjs(생성)와
// 향후 검사 스크립트가 함께 사용한다.
//
// life-dialect-schema.mjs와 같은 스타일(Zod + 별도 cross-reference
// 검사 함수)을 따르되, Culture 전용 필드로 작성한다.
import { z } from "zod";

export const LINGUISTIC_TYPES = ["JEJU_DIALECT_FORM", "JEJU_CULTURAL_TERM", "BOTH"];

export const CultureItemSchema = z
  .object({
    // route/persist 안정 slug. culture-1..culture-25. 한 번 배정하면
    // 재사용/재배치하지 않는다(3C-3B §4).
    id: z.string().regex(/^culture-\d+$/),
    // 2025 source 진짜 identity(jbv2025-p...-y...). main lexeme의
    // bookMeta.bookId와 같은 역할이지만, Culture item은 main seq를
    // 발급하지 않는다 — 이 필드가 유일한 canonical identity다.
    sourceStableId: z.string().regex(/^jbv2025-p\d{3}[lr]-y\d{5}$/),
    // audit/debug 전용. main lexeme의 bookMeta.legacyBookId와 같은 역할.
    legacySourceId: z.string().regex(/^jbv2025-\d{4}$/),
    jeju: z.string().min(1),
    otherJejuForms: z.array(z.string()).default([]),
    level: z.enum(["초급", "중급", "고급"]),
    sourcePosLabel: z.string().min(1),
    definition: z.string().min(1),
    linguisticType: z.enum(LINGUISTIC_TYPES),
    hasStandardEquivalent: z.boolean(),
    containsPua: z.boolean().default(false),
    // 3C-1.2 감사의 usageEvidence 값(참고용). culture item 존재 자체는
    // 이미 CULTURE_ADD로 확정됐으므로 이 필드로 노출 여부를 정하지 않는다.
    usageEvidenceRef: z.enum(["STRONG", "MEDIUM", "WEAK", "NONE"]),
    hasAudio: z.boolean().default(false),
    // 공식 제주 문화 출처 기반 설명. 지금은 대부분 비어 있다(§3C-3B §7) —
    // AI가 상식으로 문화 설명을 창작하지 않는다.
    culturalNote: z.string().nullable().default(null),
    culturalSources: z
      .array(z.object({ url: z.string().min(1), publisher: z.string().min(1) }))
      .default([]),
    // learner-facing Korean gloss(PR #12/3C-3A 정책). 25개 전부
    // has_standard_equivalent:false라 사람 검수 전까지는 null로 둘 수
    // 있다 — 이 transitional 상태 자체가 3C-3B §10에서 허용된 MVP다.
    learnerGloss: z.string().min(1).nullable().default(null),
    pendingGloss: z.boolean().default(true),
    reviewStatus: z.enum(["approved", "provisional", "blocked"]).optional(),
  })
  .superRefine((item, ctx) => {
    if (item.learnerGloss === null && item.pendingGloss !== true) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "learnerGloss가 null이면 pendingGloss는 반드시 true여야 합니다",
        path: ["pendingGloss"],
      });
    }
    if (item.learnerGloss !== null && item.learnerGloss.trim() !== item.learnerGloss) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "learnerGloss는 앞뒤 공백 없이 trim된 문자열이어야 합니다",
        path: ["learnerGloss"],
      });
    }
  });

// build-culture.mjs가 build-time에 계산해 붙이는 candidate cross-link.
// content/culture-items.json(사람이 편집하는 원장)에는 없고, 생성된
// src/data/culture-items.json에만 존재한다.
export const RelatedMainLexemeLinkSchema = z.object({
  seq: z.string().regex(/^\d+$/),
  jeju: z.string().min(1),
  standard: z.string().min(1),
  matchedOn: z.enum(["standard", "jeju", "both"]),
  status: z.literal("candidate"),
});

export const RelatedLifeDialectLinkSchema = z.object({
  passageId: z.string().min(1),
  sentenceIndex: z.number().int().min(0),
  status: z.literal("candidate"),
});

export const CultureBundleSchema = z.object({
  version: z.number().int().min(1),
  sourceLicense: z.object({
    provider: z.string().min(1),
    listingUrl: z.string().min(1),
    note: z.string().min(1),
  }),
  items: z.array(CultureItemSchema).min(1),
});

/** id/sourceStableId 중복 등 zod 하나로 표현하기 어려운 관계 규칙. */
export function checkCultureCrossReferences({ items }) {
  const problems = [];
  const idCounts = new Map();
  const stableIdCounts = new Map();
  for (const item of items) {
    idCounts.set(item.id, (idCounts.get(item.id) ?? 0) + 1);
    stableIdCounts.set(item.sourceStableId, (stableIdCounts.get(item.sourceStableId) ?? 0) + 1);
  }
  for (const [id, count] of idCounts) {
    if (count > 1) problems.push(`중복 culture item id: ${id} (${count}회)`);
  }
  for (const [sid, count] of stableIdCounts) {
    if (count > 1) problems.push(`중복 sourceStableId: ${sid} (${count}회)`);
  }
  return problems;
}
