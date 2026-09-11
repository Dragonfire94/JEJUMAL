import { useState } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { playSfx } from "@/lib/sfx";
import type { InlineQuestion as InlineQuestionData } from "@/lib/life-dialect";

/**
 * 생활방언 본문 안에 넣는 작은 정답 확인 문항. 기존 QuizView는 화면·상태(진행률,
 * 채점, 오답 저장)가 무거워서 본문 흐름에 넣기 부적절하다 — 이건 정답 제출과
 * 즉시 피드백만 가진다(docs/product-improvement-plan.md P2-1).
 */
export function InlineQuestion({
  question,
  index,
  onAnswered,
}: {
  question: InlineQuestionData;
  index: number;
  onAnswered?: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  const answered = picked !== null;
  const correct = picked === question.correctAnswer;

  function pick(choice: string) {
    if (answered) return;
    setPicked(choice);
    playSfx(choice === question.correctAnswer ? "correct" : "wrong");
    onAnswered?.(choice === question.correctAnswer);
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">문제 {index + 1} · 표준어로는?</p>
      <p className="font-medium">{question.prompt}</p>
      <div className="grid gap-2">
        {question.choices.map((choice) => {
          const isCorrectChoice = choice === question.correctAnswer;
          const isPicked = choice === picked;
          return (
            <button
              key={choice}
              type="button"
              onClick={() => pick(choice)}
              disabled={answered}
              className={cn(
                "flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2.5 text-left text-sm transition-colors duration-[var(--motion-quick)]",
                !answered && "active:scale-[0.98]",
                answered && isCorrectChoice && "border-success bg-success/10",
                answered && isPicked && !isCorrectChoice && "border-danger bg-danger/10",
              )}
            >
              <span>{choice}</span>
              {answered && isCorrectChoice ? <Check className="size-4 shrink-0 text-success" /> : null}
              {answered && isPicked && !isCorrectChoice ? <X className="size-4 shrink-0 text-danger" /> : null}
            </button>
          );
        })}
      </div>
      {answered ? (
        <p className={cn("text-xs", correct ? "text-success" : "text-muted-foreground")}>
          {correct ? "맞았습니다" : `정답: ${question.correctAnswer}`}
        </p>
      ) : null}
    </div>
  );
}
