import rawCulture from "@/data/culture-items.json";

// life-dialect.ts와 대칭 구조의 단순 로더. 복잡한 repository/service
// layer를 만들지 않는다(docs/3c3b-culture-track-contract.md §MVP).

export type LinguisticType = "JEJU_DIALECT_FORM" | "JEJU_CULTURAL_TERM" | "BOTH";

export type CultureSource = { url: string; publisher: string };

export type RelatedMainLexemeLink = {
  seq: string;
  jeju: string;
  standard: string;
  matchedOn: "standard" | "jeju" | "both";
  status: "candidate";
};

export type RelatedLifeDialectLink = {
  passageId: string;
  sentenceIndex: number;
  status: "candidate";
};

export type CultureItem = {
  id: string;
  sourceStableId: string;
  legacySourceId: string;
  jeju: string;
  otherJejuForms: string[];
  level: "초급" | "중급" | "고급";
  sourcePosLabel: string;
  definition: string;
  linguisticType: LinguisticType;
  hasStandardEquivalent: boolean;
  containsPua: boolean;
  usageEvidenceRef: "STRONG" | "MEDIUM" | "WEAK" | "NONE";
  hasAudio: boolean;
  culturalNote: string | null;
  culturalSources: CultureSource[];
  learnerGloss: string | null;
  pendingGloss: boolean;
  relatedMainLexemeSeqs: RelatedMainLexemeLink[];
  relatedLifeDialectIds: RelatedLifeDialectLink[];
};

export type CultureBundle = {
  version: number;
  sourceLicense: { provider: string; listingUrl: string; note: string };
  items: CultureItem[];
};

export const culture = rawCulture as CultureBundle;

const byId = new Map(culture.items.map((item) => [item.id, item]));

/** 목록 화면용. source(culture-1..25) 순서를 그대로 유지한다. */
export function listItems(): CultureItem[] {
  return culture.items;
}

export function getItem(id: string): CultureItem | undefined {
  return byId.get(id);
}

export function getItemsByLevel(level: CultureItem["level"]): CultureItem[] {
  return culture.items.filter((item) => item.level === level);
}
