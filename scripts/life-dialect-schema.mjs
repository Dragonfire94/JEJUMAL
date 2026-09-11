// content/life-dialect.json (원장) 스키마.
// 생활방언 100편 중 파일럿 10편만 골라 문장 단위로 쪼갠 콘텐츠다.
// build-life-dialect.mjs(생성)와 향후 검사 스크립트가 함께 사용한다.
import { z } from "zod";

export const SentenceSchema = z.object({
  jeju: z.string().min(1),
  archaic: z.string().min(1),
  solutionOriginal: z.string().min(1),
  solutionEdited: z.string().min(1),
  editReason: z.string().nullable(),
});

export const PassageSchema = z.object({
  id: z.string().min(1),
  seq: z.string().regex(/^\d+$/),
  title: z.string().min(1),
  category: z.string().min(1),
  audioUrl: z.string().min(1),
  sourceAudioUrl: z.string().optional(),
  requiredInCurriculum: z.boolean(),
  contentAdvisory: z.string().nullable(),
  selectionNote: z.string().nullable().optional(),
  note: z.string().nullable(),
  sentences: z.array(SentenceSchema).min(1),
});

export const LifeDialectBundleSchema = z.object({
  version: z.number().int().min(1),
  sourceLicense: z.object({
    provider: z.string().min(1),
    listingUrl: z.string().min(1),
    apiUrl: z.string().min(1),
    kogl: z.object({
      typeVerified: z.boolean(),
      note: z.string().min(1),
    }),
  }),
  passages: z.array(PassageSchema).min(1),
});

/** id/seq 중복 등 zod 하나로 표현하기 어려운 관계 규칙. */
export function checkLifeDialectCrossReferences({ passages }) {
  const problems = [];
  const idCounts = new Map();
  const seqCounts = new Map();
  for (const p of passages) {
    idCounts.set(p.id, (idCounts.get(p.id) ?? 0) + 1);
    seqCounts.set(p.seq, (seqCounts.get(p.seq) ?? 0) + 1);
  }
  for (const [id, count] of idCounts) {
    if (count > 1) problems.push(`중복 passage id: ${id} (${count}회)`);
  }
  for (const [seq, count] of seqCounts) {
    if (count > 1) problems.push(`중복 passage seq: ${seq} (${count}회)`);
  }
  return problems;
}
