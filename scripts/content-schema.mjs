// 콘텐츠 원장(content/*.json)의 스키마와 상호참조 검증 규칙.
// build-content.mjs(생성)와 qc-check.mjs(검사)가 함께 사용한다.
import { z } from "zod";

export const PART_OF_SPEECH = [
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "number",
  "interjection",
];

export const REVIEW_STATUS = ["approved", "provisional", "blocked"];

export const LexemeSchema = z.object({
  seq: z.string().regex(/^\d+$/, "seq는 숫자 문자열이어야 합니다"),
  jeju: z.string().min(1),
  standard: z.string().min(1),
  partOfSpeech: z.enum(PART_OF_SPEECH),
  reviewStatus: z.enum(REVIEW_STATUS).optional(),
});

export const UnitSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  themeId: z.string().min(1),
  rankIndex: z.number().int().min(0),
  order: z.number().int().min(1),
  wordSeqs: z.array(z.string()).length(10, "유닛은 정확히 10개의 표제어를 가져야 합니다"),
});

const OriginalTextSchema = z
  .object({
    jeju: z.string().min(1),
    standard: z.string().min(1),
  })
  .nullable();

export const ExampleSourceSchema = z.object({
  type: z.enum(["legacy", "authored", "official", "corpus", "adapted"]),
  sourceId: z.string().optional(),
  originalText: OriginalTextSchema.optional(),
  editReason: z.string().optional(),
});

export const ExampleReviewSchema = z.object({
  meaning: z.enum(REVIEW_STATUS),
  naturalness: z.enum(REVIEW_STATUS),
  translation: z.enum(REVIEW_STATUS),
});

export const ExampleSchema = z.object({
  id: z.string().min(1),
  seq: z.string().regex(/^\d+$/),
  jeju: z.string().min(4).max(80),
  standard: z.string().min(2),
  source: ExampleSourceSchema,
  review: ExampleReviewSchema,
});

export const ContentBundleSchema = z.object({
  units: z.array(UnitSchema),
  lexemes: z.array(LexemeSchema),
  examples: z.array(ExampleSchema),
});

/**
 * 개별 스키마 통과 후에도 필요한 "관계" 무결성을 검사한다.
 * Zod 하나로는 표현하기 어려운 교차 참조 규칙들이다.
 * 문제가 없으면 빈 배열, 있으면 사람이 읽을 사유 문자열 배열을 반환한다.
 */
export function checkCrossReferences({ units, lexemes, examples }) {
  const problems = [];

  const lexemeBySeq = new Map(lexemes.map((l) => [l.seq, l]));
  const seqCounts = new Map();
  for (const l of lexemes) {
    seqCounts.set(l.seq, (seqCounts.get(l.seq) ?? 0) + 1);
  }
  for (const [seq, count] of seqCounts) {
    if (count > 1) problems.push(`중복 seq: ${seq} (${count}회)`);
  }

  const unitIdCounts = new Map();
  for (const u of units) {
    unitIdCounts.set(u.id, (unitIdCounts.get(u.id) ?? 0) + 1);
  }
  for (const [id, count] of unitIdCounts) {
    if (count > 1) problems.push(`중복 유닛 id: ${id} (${count}회)`);
  }

  const seqUsedInUnit = new Map();
  for (const u of units) {
    for (const seq of u.wordSeqs) {
      if (!lexemeBySeq.has(seq)) {
        problems.push(`유닛 ${u.id}이(가) 참조하는 seq ${seq}가 lexemes.json에 없음`);
        continue;
      }
      const prevUnit = seqUsedInUnit.get(seq);
      if (prevUnit && prevUnit !== u.id) {
        problems.push(`seq ${seq}가 유닛 ${prevUnit}과 ${u.id}에 중복 배정됨`);
      }
      seqUsedInUnit.set(seq, u.id);
    }
  }

  for (const l of lexemes) {
    if (!seqUsedInUnit.has(l.seq)) {
      problems.push(`lexeme seq ${l.seq}(${l.jeju})가 어느 유닛에도 배정되지 않음`);
    }
  }

  const examplesBySeq = new Map();
  for (const ex of examples) {
    if (!lexemeBySeq.has(ex.seq)) {
      problems.push(`예문 ${ex.id}이(가) 참조하는 seq ${ex.seq}가 lexemes.json에 없음`);
      continue;
    }
    if (!examplesBySeq.has(ex.seq)) examplesBySeq.set(ex.seq, []);
    examplesBySeq.get(ex.seq).push(ex);
  }
  for (const l of lexemes) {
    const list = examplesBySeq.get(l.seq) ?? [];
    if (list.length === 0) {
      problems.push(`lexeme seq ${l.seq}(${l.jeju})에 예문이 하나도 없음`);
    }
  }

  const blockedSeqs = new Set(lexemes.filter((l) => l.reviewStatus === "blocked").map((l) => l.seq));
  for (const ex of examples) {
    if (blockedSeqs.has(ex.seq) && ex.review.meaning !== "blocked") {
      problems.push(`lexeme seq ${ex.seq}는 blocked인데 예문 ${ex.id}의 review.meaning은 "${ex.review.meaning}"임`);
    }
  }

  return problems;
}
