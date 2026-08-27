import { Volume2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { playWord, stopAudio } from "@/lib/audio";
import { nextIntervalDays, type WrongCard } from "@/lib/progress";
import { rememberLastWord } from "@/lib/report";
import { getUnit } from "@/lib/units";
import { cn } from "@/lib/utils";

type FlashcardProps = {
  card: WrongCard;
  dueCount: number;
  total: number;
  onForgot: () => void;
  onRemembered: () => void;
  onRemove: () => void;
};

export function Flashcard({ card, dueCount, total, onForgot, onRemembered, onRemove }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const unitTitle = getUnit(card.unitId)?.title;
  const laterDays = nextIntervalDays(card.intervalDays);

  useEffect(() => {
    setFlipped(false);
    rememberLastWord({ seq: card.seq, jeju: card.jeju, standard: card.standard, unitId: card.unitId });
    void playWord(card).catch(() => undefined);
    return () => stopAudio();
  }, [card.seq, card.soundUrl, card.jeju]);

  return (
    <div className="anim-rise flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <p className="text-xs font-medium tabular-nums text-muted-foreground">
          오늘 {dueCount} · 전체 {total}
        </p>
        <p className="text-xs text-muted-foreground">{unitTitle ?? "복습노트"}</p>
      </div>

      <button
        type="button"
        onClick={() => setFlipped((value) => !value)}
        className="group relative h-64 w-full rounded-2xl border border-border bg-card text-left [perspective:1200px]"
        aria-label={flipped ? "앞면 보기" : "뒷면 보기"}
      >
        <div
          className={cn(
            "relative h-full w-full transition-transform duration-[var(--motion-slow)] ease-[var(--ease-out)] [transform-style:preserve-3d]",
            flipped && "[transform:rotateY(180deg)]",
            "motion-reduce:transition-none",
          )}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl px-6 [backface-visibility:hidden]">
            <p className="text-xs text-muted-foreground">제주말</p>
            <p className="font-display text-4xl font-semibold tracking-tight">{card.jeju}</p>
            <span className="text-xs text-muted-foreground">카드를 누르면 뜻이 보입니다</span>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl px-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-xs text-muted-foreground">표준어</p>
            <p className="font-display text-4xl font-semibold tracking-tight">{card.standard}</p>
            <span className="text-xs text-muted-foreground">다시 누르면 제주말로 돌아갑니다</span>
          </div>
        </div>
      </button>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => void playWord(card).catch(() => undefined)}
      >
        <Volume2 className="size-4" aria-hidden />
        발음 듣기
      </Button>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onForgot}>
          아직
        </Button>
        <Button type="button" size="lg" onClick={onRemembered}>
          알아요
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">아직: 오늘 큐 뒤로 · 알아요: {laterDays}일 뒤</p>
      <button
        type="button"
        onClick={onRemove}
        className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        노트에서 빼기
      </button>
    </div>
  );
}
