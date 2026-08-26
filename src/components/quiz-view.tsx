import { BookmarkMinus, BookmarkPlus, Check, X } from "lucide-react";
import { useState } from "react";
import { AudioButton } from "@/components/audio-button";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/lib/progress";
import type { Question } from "@/lib/quiz";
import { playSfx } from "@/lib/sfx";
import { cn } from "@/lib/utils";

type QuizViewProps = {
  questions: Question[];
  onFinished: (result: { correct: number; missedSeqs: string[]; savedSeqs: string[] }) => void;
};

export function QuizView({ questions, onFinished }: QuizViewProps) {
  const addToNotebook = useProgress((state) => state.addToNotebook);
  const dismissWrong = useProgress((state) => state.dismissWrong);
  const notebook = useProgress((state) => state.wrongBySeq);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const question = questions[index];
  if (!question) return null;

  const answered = picked !== null;
  const progress = ((index + (answered ? 1 : 0)) / questions.length) * 100;
  const isLast = index + 1 >= questions.length;
  const inNotebook = Boolean(notebook[question.word.seq]);

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
      onFinished({ correct: correctCount, missedSeqs: missed, savedSeqs });
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
      <Progress value={progress} />

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

      <div className="grid gap-2">
        {question.choices.map((choice) => {
          const showCorrect = answered && choice === question.answer;
          const showWrong = answered && choice === picked && choice !== question.answer;
          return (
            <button
              key={choice}
              type="button"
              onClick={() => choose(choice)}
              disabled={answered}
              className={cn(
                "flex min-h-12 items-center justify-between rounded-xl border px-4 py-3 text-left text-base transition-[transform,background-color,border-color,color,opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)] active:scale-[0.96]",
                !answered && "border-border bg-card hover:bg-muted",
                showCorrect && "border-success bg-success/10 text-success",
                showWrong && "anim-shake border-danger bg-danger/10 text-danger",
                answered && !showCorrect && !showWrong && "border-border bg-card opacity-50",
              )}
            >
              <span>{choice}</span>
              {showCorrect ? <Check className="size-4" /> : null}
              {showWrong ? <X className="size-4" /> : null}
            </button>
          );
        })}
      </div>

      {answered ? (
        <div className="anim-rise flex flex-col gap-2">
          <Button size="lg" className="w-full" onClick={next}>
            {isLast ? "결과 보기" : "다음"}
          </Button>
          <Button type="button" variant="outline" size="lg" className="w-full" onClick={toggleNotebook}>
            {inNotebook ? <BookmarkMinus className="size-4" /> : <BookmarkPlus className="size-4" />}
            {inNotebook ? "넣음 · 취소" : "복습노트에 넣기"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
