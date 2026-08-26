import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dueCount, useProgress } from "@/lib/progress";
import {
  getUnit,
  openRankIndex,
  progressPercent,
  RANKS,
  rankFromPercent,
  TOTAL_WORDS,
  unitsInRank,
  WORDS_PER_RANK,
  formatRankUnlockHint,
  nextUnlockStatus,
  rankUnlockHint,
  type RankUnlockHint,
  type Unit,
} from "@/lib/units";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const completed = useProgress((state) => state.completedUnitIds);
  const isUnlocked = useProgress((state) => state.isUnlocked);
  const continueId = useProgress((state) => state.continueUnitId());
  const continueUnit = getUnit(continueId) ?? getUnit("people-0")!;
  const reviewDue = useProgress((state) => dueCount(state.wrongBySeq));
  const doneCount = completed.length;
  const learnedWords = doneCount * 10;
  const percent = progressPercent(doneCount);
  const rank = rankFromPercent(percent);
  const unlockStatus = nextUnlockStatus(completed);
  const openRank = openRankIndex(completed);
  const [previewRank, setPreviewRank] = useState(openRank);
  const selectedRank = previewRank;
  const selected = RANKS[selectedRank]!;
  const rankUnits = unitsInRank(selectedRank);
  const rankDone = rankUnits.filter((unit) => completed.includes(unit.id)).length;

  return (
    <div className="flex flex-col gap-5">
      <header className="anim-rise pt-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground">소리로 배우는 제주어</p>
        <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">제주말</h1>
        <p className="mt-2 text-[11px] text-muted-foreground">발음 출처 · 제주특별자치도 제주어 사전</p>
      </header>

      <Card className="anim-rise" style={{ animationDelay: "80ms" }}>
        <CardContent className="flex flex-col gap-3 p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="font-display text-2xl font-semibold tracking-tight">{rank.title}</p>
              <p className="text-xs text-muted-foreground">{rank.subtitle}</p>
            </div>
            <p className="font-display text-2xl font-semibold tabular-nums">{percent}%</p>
          </div>
          <div className="relative">
            <Progress value={percent} />
            <div className="pointer-events-none absolute inset-0 flex">
              {RANKS.slice(1).map((item) => (
                <span
                  key={item.id}
                  className="absolute top-0 h-full w-px bg-background/80"
                  style={{ left: `${item.minPercent}%` }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground">
            {RANKS.map((item) => (
              <span key={item.id} className={cn(item.id === rank.id && "font-medium text-foreground")}>
                {item.title}
              </span>
            ))}
          </div>
          <p className="text-xs tabular-nums text-muted-foreground">
            {learnedWords}/{TOTAL_WORDS} 단어 · {unlockStatus}
          </p>
          <Button asChild size="lg" className="w-full justify-between">
            <Link to="/learn/$unitId" params={{ unitId: continueUnit.id }}>
              <span>{completed.includes(continueUnit.id) ? "다시 풀기" : "이어서 배우기"}</span>
              <span className="max-w-[45%] truncate font-normal opacity-80">{continueUnit.title}</span>
            </Link>
          </Button>
          {reviewDue > 0 ? (
            <Button asChild size="lg" variant="outline" className="w-full justify-between">
              <Link to="/review">
                <span>복습 {reviewDue}장</span>
                <span className="font-normal opacity-80">오늘 볼 카드</span>
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <div className="flex gap-1 overflow-x-auto pb-1">
          {RANKS.map((item, index) => {
            const first = unitsInRank(index)[0];
            const open = first ? isUnlocked(first.id) : false;
            const active = index === selectedRank;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setPreviewRank(index)}
                className={cn(
                  "flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground",
                )}
              >
                {item.title}
                {open ? null : <Lock className="size-3 opacity-70" />}
              </button>
            );
          })}
        </div>
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-semibold">{selected.title} 200단어</h2>
          <p className="text-xs tabular-nums text-muted-foreground">
            {rankDone * 10}/{WORDS_PER_RANK}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">{selected.subtitle}</p>
        <UnlockPanel hint={rankUnlockHint(selectedRank, completed)} locked={!isUnlocked(rankUnits[0]?.id ?? "")} />
        <div className="stagger-board grid grid-cols-4 gap-2">
          {rankUnits.map((unit) => (
            <UnitTile
              key={unit.id}
              unit={unit}
              unlocked={isUnlocked(unit.id)}
              done={completed.includes(unit.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function UnlockPanel({ hint, locked }: { hint: RankUnlockHint | null; locked: boolean }) {
  if (!hint) return null;
  if (!locked) {
    return <p className="text-center text-xs text-muted-foreground">{formatRankUnlockHint(hint)}</p>;
  }
  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-3">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground">해금 조건</p>
      <p className="mt-1 text-sm font-medium">{formatRankUnlockHint(hint)}</p>
      {hint.kind === "locked-advance" ? (
        <p className="mt-1 text-xs tabular-nums text-muted-foreground">
          지금 {Math.min(hint.haveWords, hint.needWords)}/{hint.needWords}단어
        </p>
      ) : null}
    </div>
  );
}

function UnitTile({
  unit,
  unlocked,
  done,
}: {
  unit: Unit;
  unlocked: boolean;
  done: boolean;
}) {
  const inner = (
    <>
      <span className="line-clamp-2 text-center text-xs font-medium leading-snug">{unit.title}</span>
      {done ? <Check className="size-3.5 text-primary" /> : null}
      {!done && !unlocked ? <Lock className="size-3.5 text-muted-foreground" /> : null}
    </>
  );
  const tileClass = cn(
    "flex min-h-[3.25rem] w-full flex-col items-center justify-center gap-1 rounded-xl border border-border bg-card px-1.5 py-2 text-center transition-[transform,opacity] duration-[var(--motion-quick)] ease-[var(--ease-out)]",
    unlocked && "active:scale-[0.96]",
    !unlocked && "opacity-50",
  );
  if (unlocked) {
    return (
      <Link to="/learn/$unitId" params={{ unitId: unit.id }} className={tileClass}>
        {inner}
      </Link>
    );
  }
  return <div className={tileClass}>{inner}</div>;
}
