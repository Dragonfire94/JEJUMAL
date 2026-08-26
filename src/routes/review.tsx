import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { Flashcard } from "@/components/flashcard";
import { Button } from "@/components/ui/button";
import { cardIsDue, sortWrongCards, useProgress } from "@/lib/progress";
import { playSfx } from "@/lib/sfx";

export const Route = createFileRoute("/review")({
  component: ReviewPage,
});

export function ReviewPage() {
  const wrongBySeq = useProgress((state) => state.wrongBySeq);
  const markForgot = useProgress((state) => state.markForgot);
  const markRemembered = useProgress((state) => state.markRemembered);
  const dismissWrong = useProgress((state) => state.dismissWrong);
  const [index, setIndex] = useState(0);

  const cards = useMemo(() => sortWrongCards(wrongBySeq), [wrongBySeq]);
  const dueCount = useMemo(() => cards.filter((card) => cardIsDue(card)).length, [cards]);
  const total = cards.length;
  const current = total ? cards[Math.min(index, total - 1)] : undefined;

  if (!current || total === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight">복습노트</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          노트가 비어 있습니다. 퀴즈를 풀다 다시 보고 싶은 말을 넣으면 카드가 여기 쌓입니다.
        </p>
        <Button asChild>
          <Link to="/">
            <BookOpen className="size-4" />
            배우러 가기
          </Link>
        </Button>
      </div>
    );
  }

  function forgot() {
    if (!current) return;
    playSfx("wrong");
    markForgot(current.seq);
    setIndex(0);
  }

  function remembered() {
    if (!current) return;
    playSfx("correct");
    markRemembered(current.seq);
    setIndex(0);
  }

  function remove() {
    if (!current) return;
    dismissWrong(current.seq);
    setIndex(0);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-muted-foreground">
          {dueCount > 0 ? "오늘 볼 카드부터 나옵니다. 알아도 노트에 남습니다." : "오늘은 다 봤습니다. 더 돌리거나 빼면 됩니다."}
        </p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">복습노트</h1>
      </header>
      <Flashcard
        key={current.seq}
        card={current}
        dueCount={dueCount}
        total={total}
        onForgot={forgot}
        onRemembered={remembered}
        onRemove={remove}
      />
    </div>
  );
}
