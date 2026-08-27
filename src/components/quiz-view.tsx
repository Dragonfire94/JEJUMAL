import { BookmarkMinus, BookmarkPlus, Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AudioButton } from "@/components/audio-button";
import { ExampleLine } from "@/components/example-line";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/lib/progress";
import type { Question, QuizResult } from "@/lib/quiz";
import { playSfx } from "@/lib/sfx";
import { rememberLastWord } from "@/lib/report";
import { firstExample } from "@/lib/units";
import { cn } from "@/lib/utils";

type QuizViewProps = {
  questions: Question[];
  onFinished: (result: QuizResult) => void;
};

export function QuizView({ questions, onFinished }: QuizViewProps) {
  const addToNotebook = useProgress((state) => state.addToNotebook);
  const dismissWrong = useProgress((state) => state.dismissWrong);
  const notebook = useProgress((state) => state.wrongBySeq);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [missedQuestions, setMissedQuestions] = useState<Question[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const nextRef = useRef<HTMLButtonElement>(null);
  const choiceRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const question = questions[index];
  const answered = Boolean(question) && picked !== null;

  useEffect(() => {
    setFocusIndex(0);
    if (question) rememberLastWord({ ...question.word, unitId: question.unitId });
  }, [index]);

  useEffect(() => {
    if (!answered) return;
    nextRef.current?.focus();
  }, [answered, index]);

  if (!question) return null;

  const progress = ((index + (answered ? 1 : 0)) / questions.length) * 100;
  const isLast = index + 1 >= questions.length;
  const inNotebook = Boolean(notebook[question.word.seq]);
  const groupLabel = question.kind === "listen" ? "소리를 듣고 뜻을 고르세요" : question.prompt;
  const example = firstExample(question.word);

  function choose(choice: string) {
    if (picked) return;
    setPicked(choice);
    const ok = choice === question.answer;
    playSfx(ok ? "correct" : "wrong");
    if (ok) {
      setCorrectCount((value) => value + 1);
      return;
    }
    setMissed((value) => (value.includes(question.word.seq) ? value : [...value, question.word.seq]));
    setMissedQuestions((value) => (value.some((item) => item.id === question.id) ? value : [...value, question]));
  }

  function moveChoice(delta: number) {
    if (answered) return;
    const count = question.choices.length;
    const active = document.activeElement;
    const current = choiceRefs.current.findIndex((node) => node === active);
    const nextIndex = current < 0 ? 0 : (current + delta + count) % count;
    setFocusIndex(nextIndex);
    choiceRefs.current[nextIndex]?.focus();
  }

  function toggleNotebook() {
    if (inNotebook) {
      dismissWrong(question.word.seq);
      setSaved((value) => value.filter((seq) => seq !== question.word.seq));
      return;
    }
    addToNotebook(question.word, question.unitId);
    setSaved((value) => (value.includes(question.word.seq) ? value : [...value, question.word.seq]));
  }

  function next() {
    if (isLast) {
      playSfx("fanfare");
      const savedSeqs = inNotebook && !saved.includes(question.word.seq) ? [...saved, question.word.seq] : saved;
      onFinished({ correct: correctCount, missedSeqs: missed, savedSeqs, missedQuestions });
      return;
    }
    setIndex((value) => value + 1);
    setPicked(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-medium tabular-nums text-muted-foreground">
          {index + 1} / {questions.length}
        </p>
        <p className="text-xs text-muted-foreground">
          {question.kind === "listen" ? "듣고 고르기" : "읽고 고르기"}
        </p>
      </div>
      <Progress value={progress} aria-label={`퀴즈 진행 ${index + 1} / ${questions.length}`} />

      <div
        key={question.id}
        className="anim-in-right flex min-h-40 flex-col items-center justify-center gap-4 rounded-2xl border border-border bg-card px-5 py-8 text-center"
      >
        {question.kind === "listen" ? (
          <>
            <p className="text-sm text-muted-foreground">{question.prompt}</p>
            <AudioButton src={question.word.soundUrl} speak={question.word.jeju} large />
            {answered ? (
              <p className="font-display text-3xl font-semibold tracking-tight">{question.word.jeju}</p>
            ) : (
              <p className="text-sm text-muted-foreground">소리를 듣고 뜻을 고르세요</p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{question.prompt}</p>
            <p className="font-display text-3xl font-semibold tracking-tight">{question.word.standard}</p>
            {answered ? <AudioButton src={question.word.soundUrl} speak={question.word.jeju} label="발음 듣기" /> : null}
          </>
        )}
      </div>

      <div
        className="grid gap-2"
        role="radiogroup"
        aria-label={groupLabel}
        aria-disabled={answered || undefined}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowRight") {
            event.preventDefault();
            moveChoice(1);
          } else if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
            event.preventDefault();
            moveChoice(-1);
          }
        }}
      >
        {question.choices.map((choice, choiceIndex) => {
          const showCorrect = answered && choice === question.answer;
          const showWrong = answered && choice === picked && choice !== question.answer;
          const tabStop = !answered && choiceIndex === focusIndex;
          return (
            <button
              key={choice}
              type="button"
              role="radio"
              aria-checked={picked === choice}
              aria-disabled={answered || undefined}
              tabIndex={answered ? -1 : tabStop ? 0 : -1}
              ref={(node) => {
                choiceRefs.current[choiceIndex] = node;
              }}
              onClick={() => choose(choice)}
              className={cn(
                "flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-base transition-[transform,background-color,border-color,color,opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)] active:scale-[0.96]",
                !answered && "border-border bg-card hover:bg-muted",
                showCorrect && "border-success bg-success/10 text-success",
                showWrong && "anim-shake border-danger bg-danger/10 text-danger",
                answered && !showCorrect && !showWrong && "border-border bg-card opacity-50",
                answered && "pointer-events-none",
              )}
            >
              <span>
                {choice}
                {showCorrect ? <span className="sr-only"> 정답</span> : null}
                {showWrong ? <span className="sr-only"> 내가 고른 오답</span> : null}
              </span>
              {showCorrect ? <Check className="size-4" aria-hidden /> : null}
              {showWrong ? <X className="size-4" aria-hidden /> : null}
            </button>
          );
        })}
      </div>

      <p className="sr-only" role="status">
        {answered
          ? picked === question.answer
            ? "정답입니다"
            : `오답입니다. 정답은 ${question.answer}입니다`
          : ""}
      </p>

      {answered ? (
        <div className="anim-rise flex flex-col gap-2">
          {example ? (
            <div className="rounded-xl border border-border bg-card px-4 py-3 text-left">
              <p className="mb-1 text-[11px] text-muted-foreground">이렇게 씁니다</p>
              <ExampleLine example={example} />
            </div>
          ) : null}
          <Button ref={nextRef} size="lg" className="w-full" onClick={next}>
            {isLast ? "결과 보기" : "다음"}
          </Button>
          <Button type="button" variant="outline" size="lg" className="w-full" onClick={toggleNotebook}>
            {inNotebook ? <BookmarkMinus className="size-4" aria-hidden /> : <BookmarkPlus className="size-4" aria-hidden />}
            {inNotebook ? "넣음 · 취소" : "복습노트에 넣기"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
