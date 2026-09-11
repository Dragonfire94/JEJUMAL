#!/usr/bin/env node
// 3C-1.1: 71개 후보의 사용 근거, 평가축, 수동 판정을 분리해 남긴다.
// 이 스크립트는 production content를 수정하지 않는다.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { auditAll } from "./audit-word-usage.mjs";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const readJson = (relative) => JSON.parse(readFileSync(path.join(ROOT, relative), "utf8"));
const stripHomograph = (value) => value.normalize("NFC").replace(/[0-9¹²³⁴⁵⁶⁷⁸⁹⁰-]+$/u, "");
// 수동 review table은 decision만 저장하지 않고 평가축과 근거 종류도 함께 보존한다.
const MANUAL_REVIEW = new Map([
  ...["삼춘", "그추룩", "이추룩", "저추룩", "봅서", "나냥으로", "요자기"].map((form) => [form, { kind: "core", decision: "CORE_ADD", everydayUtility: "HIGH", culturalImportance: form === "삼춘" ? "MEDIUM" : "LOW", redundancy: "NONE" }]),
  ["맛좋다", { kind: "hold", decision: "HOLD", everydayUtility: "HIGH", culturalImportance: "LOW", redundancy: "HIGH" }],
  ...["돌담", "빙떡", "숨비소리", "오름", "올레", "가문잔치", "곶자왈", "망사리", "물소중의", "물수건", "물적삼", "국", "반지기밥", "불턱", "빗창", "산담", "신구간", "오메기떡", "오분자기", "웃드르", "정주석", "족은눈", "ᄎᆞᆯ레", "큰눈", "테왁"].map((form) => [form, { kind: "culture", decision: "CULTURE_ADD", everydayUtility: "LOW", culturalImportance: "HIGH", redundancy: "NONE" }]),
  ...["말젯ᄄᆞᆯ", "말젯아덜", "말젯아방", "말젯어멍", "셋ᄄᆞᆯ", "셋아덜", "설남은", "조고만ᄒᆞ다", "쪼끌락ᄒᆞ다", "매기독닥"].map((form) => [form, { kind: "doNotAdd", decision: "DO_NOT_ADD", everydayUtility: "LOW", culturalImportance: "LOW", redundancy: ["조고만ᄒᆞ다", "쪼끌락ᄒᆞ다"].includes(form) ? "HIGH" : "LOW" }]),
]);
// 3C-1 원장을 덮어써도 delta가 변하지 않도록 이전 판정은 별도 기준선으로 둔다.
const PREVIOUS_DECISIONS = new Map([
  ...["삼춘", "그추룩", "이추룩", "저추룩", "봅서", "나냥으로", "요자기", "맛좋다"].map((form) => [form, "CORE_ADD"]),
  ...["돌담", "빙떡", "숨비소리", "오름", "올레", "가문잔치", "곶자왈", "망사리", "물소중의", "물수건", "물적삼", "국", "반지기밥", "불턱", "빗창", "산담", "신구간", "오메기떡", "오분자기", "웃드르", "정주석", "족은눈", "ᄎᆞᆯ레", "큰눈", "테왁"].map((form) => [form, "CULTURE_ADD"]),
  ...["말젯ᄄᆞᆯ", "말젯아덜", "말젯아방", "말젯어멍", "셋ᄄᆞᆯ", "셋아덜", "설남은", "조고만ᄒᆞ다", "쪼끌락ᄒᆞ다", "매기독닥"].map((form) => [form, "DO_NOT_ADD"]),
]);
const EXTERNAL = { "오름": ["https://www.jeju.go.kr/is/oreum/info/jejuoreum/list.wp?menuId=MENU000000000000261"], "올레": ["https://agri.jeju.go.kr/files/board/045-03-1.pdf"], "빙떡": ["https://www.jeju.go.kr/jedu/data/data.htm?act=view&page=118&seq=1538402"], "테왁": ["https://www.jeju.go.kr/jori/reference/report.htm?act=download&no=1&page=3&seq=1479413"], "불턱": ["https://agri.jeju.go.kr/files/board/%EB%8F%84%EC%A0%95%EB%B0%B1%EC%84%9C%202013-2014.pdf"], "망사리": ["https://agri.jeju.go.kr/files/board/%EB%8F%84%EC%A0%95%EB%B0%B1%EC%84%9C%202013-2014.pdf"] };

// final decision은 score나 usageEvidence에서 역산하지 않는 수동 review다.
function manualReview(form, definition) {
  const review = MANUAL_REVIEW.get(form) ?? { kind: "hold", decision: "HOLD", everydayUtility: "MEDIUM", culturalImportance: "LOW", redundancy: "LOW" };
  if (review.kind === "core") {
    const notes = { "삼춘": "친족어이면서 연장자 호칭으로도 쓰여 초급 상호작용의 핵심 슬롯이다.", "그추룩": "상태·방식을 가리키는 지시 부사로 기본 서술에 반복적으로 필요하다.", "이추룩": "화자 가까운 상태·방식을 가리키는 기본 지시 부사다.", "저추룩": "멀리 있는 상태·방식을 가리키는 기본 지시 부사다.", "봅서": "듣는 이를 부르는 실용적 감탄사로 짧은 대화에 직접 쓰인다.", "나냥으로": "‘자기 힘으로’라는 독자적 생활 표현으로 기본 서술 효용이 높다.", "요자기": "최근 시점을 말하는 생활 시간 부사로 초급 회화에 유용하다." };
    return { ...review, note: notes[form] };
  }
  if (form === "맛좋다") return { ...review, note: "음식 평가에는 유용하지만 기존 맛싯다와 같은 개념을 가르칠 위험이 있어 별도 반영 전에 검토가 필요하다." };
  if (review.kind === "culture") return { ...review, note: `2025 기본어휘의 개별 뜻풀이(“${definition}”)가 제주 지역의 장소·음식·해녀·의례·주거 맥락을 직접 설명하므로 문화 학습어로 검토했다.` };
  if (review.kind === "doNotAdd") {
    const notes = { "말젯ᄄᆞᆯ": "넷인 딸 가운데 셋째라는 매우 좁은 친족 서열어다.", "말젯아덜": "넷인 아들 가운데 셋째라는 매우 좁은 친족 서열어다.", "말젯아방": "친족의 서열을 세분하는 항목으로 초급 핵심 슬롯 우선순위가 낮다.", "말젯어멍": "친족의 서열을 세분하는 항목으로 초급 핵심 슬롯 우선순위가 낮다.", "셋ᄄᆞᆯ": "둘째 딸을 특정하는 서열어라 일반 친족어보다 우선순위가 낮다.", "셋아덜": "둘째 아들을 특정하는 서열어라 일반 친족어보다 우선순위가 낮다.", "설남은": "서른을 조금 넘는 수를 가리키는 좁은 수사 슬롯이다.", "조고만ᄒᆞ다": "‘조금 작다’ 개념이 기존 초급 형용사와 겹칠 가능성이 크다.", "쪼끌락ᄒᆞ다": "‘조금 작다’ 개념이 기존 초급 형용사와 겹칠 가능성이 크다.", "매기독닥": "특정 상황의 감탄사라 현재 핵심 생활어 슬롯의 우선순위가 낮다." };
    return { ...review, note: notes[form] };
  }
  return { ...review, note: `공식 뜻풀이(“${definition}”)는 확인했으나, 현 자료만으로 핵심 생활어 또는 문화 핵심어 슬롯의 우선순위를 확정하지 않았다.` };
}

function linePairs(items) { const split = (value) => value.split("\n").map((line) => line.trim()).filter(Boolean); const pairs = []; for (const item of items) for (const source of [item.contents, item.original]) { const jeju = split(source); const standard = split(item.solution); if (jeju.length === standard.length) jeju.forEach((line, index) => pairs.push({ jeju: line, standard: standard[index] })); } return pairs; }
function usageTier({ exactHits, inflectedHits, lifeDialectHits }) { const verified = exactHits + inflectedHits + lifeDialectHits; if (verified >= 5 || exactHits >= 3 || lifeDialectHits >= 2) return "STRONG"; if (verified >= 2 || lifeDialectHits >= 1) return "MEDIUM"; if (verified >= 1) return "WEAK"; return "NONE"; }
function semanticReview(form, definition, lexemes) {
  const normalized = stripHomograph(form); const variants = lexemes.filter((lexeme) => [lexeme.jeju, ...(lexeme.bookMeta?.otherJejuForms ?? [])].some((value) => stripHomograph(value) === normalized));
  if (variants.length) return { status: "VARIANT_ALREADY_PRESENT", candidateSeqs: variants.map((row) => row.seq), reason: "동일 제주어 표기가 현재 content의 주표제어 또는 변이형에 이미 있다." };
  if (form === "맛좋다") return { status: "SAME_CONCEPT_ALREADY_PRESENT", candidateSeqs: ["90237"], reason: "현재 content의 맛싯다(맛있다)가 ‘음식의 맛이 좋다’와 같은 학습 개념을 이미 다룬다." };
  if (["절", "메"].includes(form)) return { status: "POSSIBLE_DUPLICATE", candidateSeqs: [], reason: "짧은 표제어라 문자열·뜻풀이 대조만으로 동형이의어와 의미 중복을 배제할 수 없어 추가 수동 확인이 필요하다." };
  return { status: "NO_DUPLICATE", candidateSeqs: [], reason: `현재 lexemes의 제주어·변이형·표준어·책 뜻풀이를 대조했으나 “${definition}”와 같은 학습 개념을 확인하지 못했다.` };
}
const value = (name) => ({ HIGH: 25, MEDIUM: 14, LOW: 5, NONE: 0 }[name] ?? 0); const evidenceValue = (name) => ({ STRONG: 35, MEDIUM: 22, WEAK: 10, NONE: 0 }[name]);

function main() {
  const candidates = readJson("data/jeju-basic-vocab-2025/content-new-candidates-3a.json"); const vocab = readJson("data/jeju-basic-vocab-2025/vocab.json").entries; const lexemes = readJson("content/lexemes.json"); const tokens = readJson("data/aihub/tokens.json"); const dictionary = readJson("data/dictionary/jeju_dialect_full.json"); const life = readJson("data/life-dialect/items.json");
  if (candidates.length !== 71 || new Set(candidates.map((row) => row.stable_id)).size !== 71) throw new Error("Expected 71 unique candidates");
  const sourceById = new Map(vocab.map((row) => [row.stableId, row])); const usageRows = auditAll(candidates.map((candidate) => { const source = sourceById.get(candidate.stable_id); return { seq: candidate.stable_id, jeju: candidate.jeju_forms[0], standard: source.definition, partOfSpeech: candidate.pos === "동사" ? "verb" : candidate.pos === "형용사" ? "adjective" : "noun" }; }), tokens, linePairs(life)); const usageById = new Map(usageRows.map((row) => [row.seq, row]));
  const rows = candidates.map((candidate) => { const source = sourceById.get(candidate.stable_id); const form = candidate.jeju_forms[0]; const usage = usageById.get(candidate.stable_id); const manual = manualReview(form, source.definition); const duplicate = semanticReview(form, source.definition, lexemes); const forms = candidate.jeju_forms.map(stripHomograph); const dictionaryEntries = dictionary.filter((entry) => forms.includes(stripHomograph(entry.name)) || forms.includes(stripHomograph(entry.siteName))); const usageEvidence = usageTier(usage); const jejuDistinctiveness = candidate.has_standard_equivalent ? "MEDIUM" : "HIGH"; const score = Math.max(0, Math.min(100, evidenceValue(usageEvidence) + value(manual.everydayUtility) + value(jejuDistinctiveness) * 0.6 + value(manual.culturalImportance) * 0.6 - value(manual.redundancy) * 0.5 + (candidate.level === "초급" ? 10 : 5))); const rawExact = (tokens[form] ?? []).reduce((sum, [, count]) => sum + count, 0);
    return { stableId: candidate.stable_id, numericId: candidate.numeric_id, jejuForms: candidate.jeju_forms, level: candidate.level, sourcePos: candidate.pos, definition: source.definition, hasStandardEquivalent: candidate.has_standard_equivalent, evidence: { aihub: { rawExactHits: rawExact, rawInflectedHits: usage.inflectedHits, verifiedContextHits: usage.exactHits + usage.inflectedHits, ambiguousContextHits: Math.max(0, rawExact - usage.exactHits), examples: [], note: "tokens.json은 표준어 매핑과 빈도만 제공하며 발화/화자 식별자·원문을 제공하지 않는다. verifiedContextHits는 뜻풀이와 통하는 매핑의 집계이지 원문 발화 인용 수가 아니다." }, lifeDialect: { rawHits: usage.lifeDialectHits, verifiedContextHits: usage.lifeDialectHits, examples: [], note: "제주어 줄과 표준어 풀이 줄 수가 같은 자료만 뜻풀이 대조에 사용했다." }, dictionaryHit: dictionaryEntries.length > 0, dictionaryEntrySeqs: dictionaryEntries.map((entry) => entry.seq), officialBasicVocab2025: true, externalEvidence: EXTERNAL[form] ?? [] }, usageEvidence, semanticDuplicateReview: duplicate, assessment: { everydayUtility: manual.everydayUtility, jejuDistinctiveness, culturalImportance: manual.culturalImportance, redundancy: manual.redundancy, officialLevel: candidate.level }, score, decision: manual.decision, decisionBasis: [manual.note, "2025 기본어휘의 표제어·등급·뜻풀이를 원장과 대조했다.", `현대 사용 근거 등급은 decision과 독립적으로 ${usageEvidence}로 계산했다.`], manualReviewNote: "최종 decision은 자동 score의 임계값이 아니라 이 행의 개별 평가축과 근거를 검토한 수동 판정이다.", previousDecision: PREVIOUS_DECISIONS.get(form) ?? "HOLD" };
  });
  const decisions = ["CORE_ADD", "CULTURE_ADD", "HOLD", "DO_NOT_ADD"]; const duplicates = ["NO_DUPLICATE", "VARIANT_ALREADY_PRESENT", "SAME_CONCEPT_ALREADY_PRESENT", "POSSIBLE_DUPLICATE"]; const usages = ["STRONG", "MEDIUM", "WEAK", "NONE"]; const count = (key, values) => Object.fromEntries(values.map((entry) => [entry, rows.filter((row) => key === "semanticDuplicateReview" ? row[key].status === entry : row[key] === entry).length]));
  if (rows.some((row) => !row.decisionBasis?.length || !row.semanticDuplicateReview) || rows.filter((row) => decisions.includes(row.decision)).length !== 71) throw new Error("3C-1.1 audit invariants failed");
  const delta = rows.map((row) => ({ candidate: row.jejuForms[0], oldDecision: row.previousDecision, newDecision: row.decision, changed: row.previousDecision !== row.decision, reason: row.decisionBasis[0] })); const audit = { schemaVersion: 2, generatedFrom: "repository inputs; deterministic output", scope: "3C-1.1 evidence-first audit only; production content unchanged", method: ["AI Hub token mapping: raw count와 뜻풀이 대조 집계를 분리", "생활방언: 제주어 줄/표준어 풀이 줄이 정렬된 경우만 뜻풀이 대조", "71개 각각의 수동 평가축·결정 근거·의미 중복 검토", "score는 사용 근거·평가축·공식 등급만으로 산출하며 decision을 사용하지 않음"], limitations: ["AI Hub tokens.json에 발화 ID/원문이 없어 개별 발화 문맥 인용은 할 수 없다.", "NONE은 사어 판정이 아니며 DO_NOT_ADD는 현 핵심 앱의 우선순위 판단이다.", "POSSIBLE_DUPLICATE는 실제 content 반영 전에 추가 수동 확인이 필요하다."], summary: { rows: rows.length, uniqueStableIds: new Set(rows.map((row) => row.stableId)).size, decisions: count("decision", decisions), usageEvidence: count("usageEvidence", usages), semanticDuplicateReview: count("semanticDuplicateReview", duplicates), delta: { unchanged: delta.filter((row) => !row.changed).length, changed: delta.filter((row) => row.changed).length } }, delta, rows };
  writeFileSync(path.join(ROOT, "data/jeju-basic-vocab-2025/new-candidates-living-audit-3c1.json"), `${JSON.stringify(audit, null, 2)}\n`); console.log(JSON.stringify(audit.summary, null, 2));
}
main();
