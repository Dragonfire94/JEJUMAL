#!/usr/bin/env node
// 3C-1: 새로 복구된 71개 후보를 기존 content와 내부 근거 자료에 대해
// 재현 가능하게 점검한다. 이 스크립트는 후보를 content에 추가하지 않는다.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const readJson = (relative) => JSON.parse(readFileSync(path.join(ROOT, relative), "utf8"));
const stripHomograph = (value) => value.normalize("NFC").replace(/[0-9¹²³⁴⁵⁶⁷⁸⁹⁰-]+$/u, "");
const wordBoundary = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 이 분류는 말뭉치 hit만으로 자동 결정하지 않는다. 문화 고유성·초급 학습
// 효용과 중복 위험을 사람이 검토해 명시한 정책표다. NONE은 사어 판정이 아니다.
const CORE = new Set(["삼춘", "그추룩", "이추룩", "저추룩", "봅서", "나냥으로", "요자기", "맛좋다"]);
const CULTURE = new Set([
  "돌담", "빙떡", "숨비소리", "오름", "올레", "가문잔치", "곶자왈", "망사리",
  "물소중의", "물수건", "물적삼", "국", "반지기밥", "불턱", "빗창", "산담",
  "신구간", "오메기떡", "오분자기", "웃드르", "정주석", "족은눈", "큰눈", "테왁", "ᄎᆞᆯ레",
]);
const DO_NOT_ADD = new Set([
  "말젯ᄄᆞᆯ", "말젯아덜", "말젯아방", "말젯어멍", "셋ᄄᆞᆯ", "셋아덜", "설남은",
  "조고만ᄒᆞ다", "쪼끌락ᄒᆞ다", "매기독닥",
]);
const EXTERNAL = {
  "오름": ["https://www.jeju.go.kr/is/oreum/info/jejuoreum/list.wp?menuId=MENU000000000000261"],
  "올레": ["https://agri.jeju.go.kr/files/board/045-03-1.pdf"],
  "빙떡": ["https://www.jeju.go.kr/jedu/data/data.htm?act=view&page=118&seq=1538402"],
  "테왁": ["https://www.jeju.go.kr/jori/reference/report.htm?act=download&no=1&page=3&seq=1479413"],
  "불턱": ["https://agri.jeju.go.kr/files/board/%EB%8F%84%EC%A0%95%EB%B0%B1%EC%84%9C%202013-2014.pdf"],
  "망사리": ["https://agri.jeju.go.kr/files/board/%EB%8F%84%EC%A0%95%EB%B0%B1%EC%84%9C%202013-2014.pdf"],
};

function occurrences(text, form) {
  return (text.match(new RegExp(wordBoundary(form), "gu")) ?? []).length;
}

function decisionFor(form) {
  if (CORE.has(form)) return "CORE_ADD";
  if (CULTURE.has(form)) return "CULTURE_ADD";
  if (DO_NOT_ADD.has(form)) return "DO_NOT_ADD";
  return "HOLD";
}

function ratingFor(decision, rawHits, cultural) {
  if (rawHits >= 20) return "STRONG";
  if (rawHits >= 3) return "MEDIUM";
  if (cultural || decision === "HOLD") return "WEAK";
  return "NONE";
}

function main() {
  const candidates = readJson("data/jeju-basic-vocab-2025/content-new-candidates-3a.json");
  const vocab = readJson("data/jeju-basic-vocab-2025/vocab.json").entries;
  const lexemes = readJson("content/lexemes.json");
  const tokens = readJson("data/aihub/tokens.json");
  const lifeItems = readJson("data/life-dialect/items.json");
  const dictionary = readJson("data/dictionary/jeju_dialect_full.json");
  if (candidates.length !== 71 || candidates.some((row) => row.jeju_forms.length === 0) || new Set(candidates.map((row) => row.stable_id)).size !== 71) {
    throw new Error("3C-1 candidate invariant failed: expected 71 non-empty, unique stable IDs");
  }
  const vocabByStableId = new Map(vocab.map((row) => [row.stableId, row]));
  const lifeText = lifeItems.map((row) => `${row.contents}\n${row.original}`).join("\n");
  const rows = candidates.map((candidate) => {
    const source = vocabByStableId.get(candidate.stable_id);
    if (!source) throw new Error(`Candidate source not found: ${candidate.stable_id}`);
    const forms = candidate.jeju_forms;
    const normalizedForms = new Set(forms.map(stripHomograph));
    const rawAihubByForm = Object.fromEntries(forms.map((form) => [form, (tokens[form] ?? []).reduce((sum, [, count]) => sum + count, 0)]));
    const rawInflectedByForm = Object.fromEntries(forms.map((form) => {
      const verbLike = ["동사", "형용사"].includes(candidate.pos);
      const root = verbLike && form.endsWith("다") ? form.slice(0, -1) : form;
      const maxSuffix = verbLike ? 6 : 3;
      const count = Object.entries(tokens)
        .filter(([token]) => token !== form && token.startsWith(root) && token.length <= root.length + maxSuffix)
        .reduce((sum, [, mappings]) => sum + mappings.reduce((inner, [, hits]) => inner + hits, 0), 0);
      return [form, count];
    }));
    const rawLifeByForm = Object.fromEntries(forms.map((form) => [form, occurrences(lifeText, form)]));
    const aihubExactRaw = Object.values(rawAihubByForm).reduce((sum, count) => sum + count, 0);
    const aihubInflectedRaw = Object.values(rawInflectedByForm).reduce((sum, count) => sum + count, 0);
    const lifeDialectHits = Object.values(rawLifeByForm).reduce((sum, count) => sum + count, 0);
    const dictionaryEntries = dictionary.filter((entry) => normalizedForms.has(stripHomograph(entry.name)) || normalizedForms.has(stripHomograph(entry.siteName)));
    const exactContent = lexemes.filter((lexeme) => [lexeme.jeju, ...(lexeme.bookMeta?.otherJejuForms ?? [])].some((form) => normalizedForms.has(stripHomograph(form))));
    const primary = forms[0];
    const decision = decisionFor(primary);
    const cultural = decision === "CULTURE_ADD";
    const usageEvidence = ratingFor(decision, aihubExactRaw + lifeDialectHits, cultural);
    const existingType = primary.length <= 1 || primary === "절" ? "POSSIBLE_DUPLICATE" : exactContent.length ? "VARIANT_EXISTS" : "TRUE_NEW";
    const everydayUtility = decision === "CORE_ADD" ? "HIGH" : decision === "CULTURE_ADD" ? "LOW" : decision === "DO_NOT_ADD" ? "LOW" : "MEDIUM";
    const culturalImportance = cultural ? "HIGH" : ["삼춘", "가문잔치"].includes(primary) ? "MEDIUM" : "LOW";
    const jejuDistinctiveness = candidate.has_standard_equivalent ? "MEDIUM" : "HIGH";
    const redundancy = existingType === "POSSIBLE_DUPLICATE" || decision === "DO_NOT_ADD" ? "HIGH" : "LOW";
    const score = Math.max(0, Math.min(100, (usageEvidence === "STRONG" ? 35 : usageEvidence === "MEDIUM" ? 22 : usageEvidence === "WEAK" ? 10 : 0) + (everydayUtility === "HIGH" ? 25 : everydayUtility === "MEDIUM" ? 14 : 5) + (jejuDistinctiveness === "HIGH" ? 15 : 8) + (culturalImportance === "HIGH" ? 15 : culturalImportance === "MEDIUM" ? 8 : 0) + (candidate.level === "초급" ? 10 : 5) - (redundancy === "HIGH" ? 20 : redundancy === "LOW" ? 5 : 0)));
    return {
      stableId: candidate.stable_id, numericId: candidate.numeric_id, jejuForms: forms, level: candidate.level,
      sourcePos: candidate.pos, definition: source.definition, hasStandardEquivalent: candidate.has_standard_equivalent,
      existingContentMatch: { type: existingType, seqs: exactContent.map((row) => row.seq), note: "Exact/동형이의어 suffix 제거 대조. 의미 동등성은 자동 확정하지 않았다." },
      evidence: {
        aihubExact: aihubExactRaw, aihubInflected: aihubInflectedRaw,
        aihubVariant: forms.slice(1).reduce((sum, form) => sum + rawAihubByForm[form], 0),
        aihubExactByForm: rawAihubByForm, aihubInflectedByForm: rawInflectedByForm,
        lifeDialectHits, lifeDialectByForm: rawLifeByForm, dictionaryHit: dictionaryEntries.length > 0,
        dictionaryEntrySeqs: dictionaryEntries.map((entry) => entry.seq),
        externalEvidence: EXTERNAL[primary] ?? [],
        caveat: "AI Hub/생활방언의 raw 문자열 hit는 표준어 대응이 없는 항목에서 뜻 문맥을 자동 판별할 수 없다. 동형이의어·짧은 표제어는 사용 증거로 과장하지 않았다.",
      },
      usageEvidence, everydayUtility, jejuDistinctiveness, culturalImportance, redundancy, score, decision,
      reason: decision === "CORE_ADD"
        ? "현재 학습자가 실제 상호작용·기본 서술에서 만날 가능성이 높고, 최소 하나의 내부 사용 근거 또는 초급 핵심 효용이 있어 핵심 후보로 제안한다."
        : decision === "CULTURE_ADD"
          ? "일상 회화 빈도와 별개로 제주 지역의 장소·음식·해녀·의례 맥락을 이해하는 데 독자적 가치가 있어 문화 학습 후보로 제안한다."
          : decision === "DO_NOT_ADD"
            ? "공식 수록 사실은 유지하되, 매우 좁은 친족/수사 슬롯 또는 중복 위험 때문에 현 핵심 앱의 우선순위에는 맞지 않는다고 본다. 이는 사어 판정이 아니다."
            : "공식 학습어·정의 근거는 있으나, 현 자료만으로 핵심 생활어 또는 문화 핵심어로 확정하기에 현대 사용·초급 효용 근거가 부족해 보류한다.",
    };
  });
  const by = (key) => Object.fromEntries([...new Set(rows.map((row) => row[key]))].sort().map((value) => [value, rows.filter((row) => row[key] === value).length]));
  const audit = {
    schemaVersion: 1, generatedFrom: "repository inputs; deterministic output", scope: "3C-1 audit only; production content unchanged",
    method: ["2025 기본어휘 원장(stableId/등급/품사/뜻풀이)", "AI Hub tokens.json raw exact-token count", "jeju.go.kr 생활방언 원문 raw occurrence", "기존 제주어 사전 이름 exact/동형이의어 suffix 제거 대조", "content/lexemes.json exact/variant 대조 및 사람 검토 정책표"],
    limitations: ["70개는 표준어 대응이 없어 raw corpus hit만으로 의미 문맥을 자동 확인할 수 없다.", "dictionary hit와 공식 기본어휘 수록은 현대 고빈도 사용의 증거가 아니다.", "NONE은 사어 판정이 아니며, DO_NOT_ADD는 현 핵심 앱 우선순위 판단일 뿐 단어의 부정이 아니다."],
    summary: { rows: rows.length, uniqueStableIds: new Set(rows.map((row) => row.stableId)).size, decisions: by("decision"), usageEvidence: by("usageEvidence"), existingContentMatch: Object.fromEntries(["TRUE_NEW", "VARIANT_EXISTS", "SAME_MEANING_EXISTS", "POSSIBLE_DUPLICATE"].map((type) => [type, rows.filter((row) => row.existingContentMatch.type === type).length])), }, rows,
  };
  writeFileSync(path.join(ROOT, "data/jeju-basic-vocab-2025/new-candidates-living-audit-3c1.json"), `${JSON.stringify(audit, null, 2)}\n`);
  console.log(JSON.stringify(audit.summary, null, 2));
}
main();
