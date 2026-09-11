import rawLifeDialect from "@/data/life-dialect.json";

export type WordLink = {
  seq: string;
  jeju: string;
  standard: string;
  matchedOn: "standard" | "jeju" | "both";
  status: "candidate";
};

export type LifeDialectSentence = {
  jeju: string;
  archaic: string;
  solutionOriginal: string;
  solutionEdited: string;
  editReason: string | null;
  wordLinks: WordLink[];
};

export type LifeDialectPassage = {
  id: string;
  seq: string;
  title: string;
  category: string;
  audioUrl: string;
  requiredInCurriculum: boolean;
  contentAdvisory: string | null;
  note: string | null;
  sentences: LifeDialectSentence[];
};

export type LifeDialectBundle = {
  version: number;
  sourceLicense: {
    provider: string;
    listingUrl: string;
    apiUrl: string;
    kogl: { typeVerified: boolean; note: string };
  };
  passages: LifeDialectPassage[];
};

export const lifeDialect = rawLifeDialect as LifeDialectBundle;

const byId = new Map(lifeDialect.passages.map((passage) => [passage.id, passage]));

export function listPassages(): LifeDialectPassage[] {
  return lifeDialect.passages;
}

export function getPassage(id: string): LifeDialectPassage | undefined {
  return byId.get(id);
}

// --- P2-2: 단어 카드 ↔ 생활방언 역방향 링크 -------------------------------
// build-life-dialect.mjs가 붙인 wordLinks는 전부 status: "candidate"다(문자열
// 일치, 활용형은 못 잡음). 여기서 만드는 역인덱스도 그대로 candidate 다.
// 화면에서는 절대 "정답"처럼 보이면 안 되고, 항상 "자동 후보(검수 전)"라고
// 밝혀야 한다.

export type WordAppearance = {
  passageId: string;
  passageTitle: string;
  sentenceIndex: number;
  jeju: string;
  solutionEdited: string;
  audioUrl: string;
};

const appearancesBySeq = new Map<string, WordAppearance[]>();
for (const passage of lifeDialect.passages) {
  passage.sentences.forEach((sentence, sentenceIndex) => {
    for (const link of sentence.wordLinks) {
      const list = appearancesBySeq.get(link.seq) ?? [];
      list.push({
        passageId: passage.id,
        passageTitle: passage.title,
        sentenceIndex,
        jeju: sentence.jeju,
        solutionEdited: sentence.solutionEdited,
        audioUrl: passage.audioUrl,
      });
      appearancesBySeq.set(link.seq, list);
    }
  });
}

/** 단어 카드 하단 "이 말이 나오는 대화" 목록용. 최대 limit개, 후보 상태 그대로. */
export function appearancesForSeq(seq: string, limit = 3): WordAppearance[] {
  return (appearancesBySeq.get(seq) ?? []).slice(0, limit);
}

/** 퀴즈 결과에서 틀린 단어들 중 첫 번째로 매칭되는 편 하나만 추천할 때 쓴다. */
export function firstAppearanceForAnySeq(seqs: string[]): WordAppearance | undefined {
  for (const seq of seqs) {
    const list = appearancesBySeq.get(seq);
    if (list && list.length > 0) return list[0];
  }
  return undefined;
}

/** 파일럿 이후에도 순서가 안정적이도록, 배열 순서 그대로 이전/다음을 계산한다. */
export function adjacentPassageIds(id: string): { prevId: string | null; nextId: string | null } {
  const ids = lifeDialect.passages.map((passage) => passage.id);
  const index = ids.indexOf(id);
  if (index === -1) return { prevId: null, nextId: null };
  return { prevId: ids[index - 1] ?? null, nextId: ids[index + 1] ?? null };
}

export type InlineQuestion = {
  sentenceIndex: number;
  prompt: string;
  correctAnswer: string;
  choices: string[];
};

const MAX_INLINE_QUESTIONS = 3;

/**
 * 핵심 표현 2~3개를 뽑아 "이 문장, 표준어로는?" 인라인 미니퀴즈를 만든다.
 * 오답 보기는 지어내지 않고 같은 편의 다른 문장 번역에서만 가져온다 — 짧은 편도
 * 최소 4문장이라 항상 3개의 오답을 확보할 수 있다.
 */
export function buildInlineQuestions(passage: LifeDialectPassage): InlineQuestion[] {
  const sentences = passage.sentences;
  if (sentences.length < 2) return [];
  const count = Math.min(MAX_INLINE_QUESTIONS, sentences.length);
  const indices = pickSpread(sentences.length, count);
  return indices.map((index) => {
    const target = sentences[index]!;
    const others = sentences.filter((_, i) => i !== index).map((s) => s.solutionEdited);
    const choices = shuffle([target.solutionEdited, ...others.slice(0, 3)]);
    return {
      sentenceIndex: index,
      prompt: target.jeju,
      correctAnswer: target.solutionEdited,
      choices,
    };
  });
}

/** 문장 배열에서 count개를 최대한 고르게 퍼진 인덱스로 뽑는다. */
function pickSpread(length: number, count: number): number[] {
  if (count >= length) return Array.from({ length }, (_, i) => i);
  const step = length / count;
  const seen = new Set<number>();
  const result: number[] = [];
  for (let i = 0; i < count; i += 1) {
    let index = Math.floor(i * step);
    while (seen.has(index) && index < length - 1) index += 1;
    seen.add(index);
    result.push(index);
  }
  return result;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}
