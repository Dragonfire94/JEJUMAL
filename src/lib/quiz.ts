import type { Unit, Word } from "@/lib/units";
import { units } from "@/lib/units";

export type QuestionKind = "listen" | "read";

export type Question = {
  id: string;
  kind: QuestionKind;
  word: Word;
  unitId: string;
  prompt: string;
  answer: string;
  choices: string[];
};

const allWords: Word[] = units.flatMap((unit) => unit.words);

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}

function levenshtein(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i += 1) dp[i]![0] = i;
  for (let j = 0; j < cols; j += 1) dp[0]![j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + cost,
      );
    }
  }
  return dp[a.length]![b.length]!;
}

function tooSimilar(a: string, b: string): boolean {
  const max = Math.max(a.length, b.length);
  if (max === 0) return true;
  if (a === b) return true;
  return levenshtein(a, b) / max <= 0.34;
}

function uniqueTexts(words: Word[], field: "jeju" | "standard", exceptSeq: string): string[] {
  const seen = new Set<string>();
  const texts: string[] = [];
  for (const word of words) {
    if (word.seq === exceptSeq) continue;
    const text = word[field];
    if (seen.has(text)) continue;
    seen.add(text);
    texts.push(text);
  }
  return texts;
}

function pickDistractors(answer: string, pools: string[][], count: number): string[] {
  const chosen: string[] = [];
  const seen = new Set<string>([answer]);

  const take = (strict: boolean) => {
    for (const pool of pools) {
      for (const option of shuffle(pool)) {
        if (chosen.length >= count) return;
        if (!option || seen.has(option)) continue;
        if (strict && tooSimilar(option, answer)) continue;
        if (strict && chosen.some((item) => tooSimilar(item, option))) continue;
        seen.add(option);
        chosen.push(option);
      }
    }
  };

  take(true);
  if (chosen.length < count) take(false);
  return chosen;
}

function distractorPools(word: Word, preferred: Word[], field: "jeju" | "standard"): string[][] {
  const samePos = allWords.filter(
    (item) => item.seq !== word.seq && item.partOfSpeech === word.partOfSpeech,
  );
  return [
    uniqueTexts(preferred, field, word.seq),
    uniqueTexts(samePos, field, word.seq),
    uniqueTexts(allWords, field, word.seq),
  ];
}

export function buildLesson(unit: Unit): Question[] {
  const sameUnit = unit.words;

  const listen: Question[] = sameUnit.map((word) => {
    const distractors = pickDistractors(word.standard, distractorPools(word, sameUnit, "standard"), 3);
    return {
      id: `${word.seq}-listen`,
      kind: "listen" as const,
      word,
      unitId: unit.id,
      prompt: "이 말의 뜻은 무엇일까요?",
      answer: word.standard,
      choices: shuffle([word.standard, ...distractors]),
    };
  });

  const read: Question[] = sameUnit.map((word) => {
    const distractors = pickDistractors(word.jeju, distractorPools(word, sameUnit, "jeju"), 3);
    return {
      id: `${word.seq}-read`,
      kind: "read" as const,
      word,
      unitId: unit.id,
      prompt: "이 뜻을 제주말로 하면?",
      answer: word.jeju,
      choices: shuffle([word.jeju, ...distractors]),
    };
  });

  return [...shuffle(listen), ...shuffle(read)];
}

export function buildReviewQuiz(words: Word[], unitIdBySeq: Record<string, string>): Question[] {
  if (words.length === 0) return [];
  return shuffle(words).flatMap((word) => {
    const meaningChoices = pickDistractors(word.standard, distractorPools(word, words, "standard"), 3);
    const jejuChoices = pickDistractors(word.jeju, distractorPools(word, words, "jeju"), 3);
    const unitId = unitIdBySeq[word.seq] ?? "";
    return [
      {
        id: `${word.seq}-review-listen`,
        kind: "listen" as const,
        word,
        unitId,
        prompt: "이 말의 뜻은 무엇일까요?",
        answer: word.standard,
        choices: shuffle([word.standard, ...meaningChoices]),
      },
      {
        id: `${word.seq}-review-read`,
        kind: "read" as const,
        word,
        unitId,
        prompt: "이 뜻을 제주말로 하면?",
        answer: word.jeju,
        choices: shuffle([word.jeju, ...jejuChoices]),
      },
    ];
  });
}
