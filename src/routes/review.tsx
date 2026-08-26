import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { useMemo, useState } from "react";
import { Flashcard } from "@/components/flashcard";
import { Button } from "@/components/ui/button";
import { useProgress, type WrongCard } from "@/lib/progress";

export const Route = createFileRoute("/review")({
  component: ReviewPage,
});

function sortCards(wrongBySeq: Record<string, WrongCard>): WrongCard[] {
  return Object.values(wrongBySeq).sort((a, b) => {
    if (b.timesMissed !== a.timesMissed) return b.timesMissed - a.timesMissed;
    return b.addedAt - a.addedAt;
  });
}

export function ReviewPage() {
  const wrongBySeq = useProgress((state) => state.wrongBySeq);
  const dismissWrong = useProgress((state) => state.dismissWrong);
  const [index, setIndex] = useState(0);

  const cards = useMemo(() => sortCards(wrongBySeq), [wrongBySeq]);
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

  function prev() {
    setIndex((value) => (value - 1 + total) % total);
  }

  function next() {
    setIndex((value) => (value + 1) % total);
  }

  function remove() {
    if (!current) return;
    dismissWrong(current.seq);
    setIndex((value) => {
      const nextLength = total - 1;
      if (nextLength <= 0) return 0;
      return Math.min(value, nextLength - 1);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <p className="text-xs text-muted-foreground">카드를 눌러 뜻을 보고, 다음으로 반복합니다</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">복습노트</h1>
      </header>
      <Flashcard
        key={current.seq}
        card={current}
        index={Math.min(index, total - 1)}
        total={total}
        onPrev={prev}
        onNext={next}
        onRemove={remove}
      />
    </div>
  );
}
