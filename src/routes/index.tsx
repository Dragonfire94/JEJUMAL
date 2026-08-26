import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Lock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useProgress } from "@/lib/progress";
import {
  getUnit,
  nextRank,
  openRankIndex,
  progressPercent,
  RANKS,
  rankFromPercent,
  TOTAL_WORDS,
  unitsInRank,
  unitsToNextRank,
  WORDS_PER_RANK,
  type Unit,
} from "@/lib/units";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const completed = useProgress((state) => state.completedUnitIds);
  const isUnlocked = useProgress((state) => state.isUnlocked);
  const continueId = useProgress((state) => state.continueUnitId());
  const continueUnit = getUnit(continueId) ?? getUnit("people-0")!;
  const doneCount = completed.length;
  const learnedWords = doneCount * 10;
  const percent = progressPercent(doneCount);
  const rank = rankFromPercent(percent);
  const following = nextRank(percent);
  const remain = unitsToNextRank(doneCount);
  const openRank = openRankIndex(completed);
  const [previewRank, setPreviewRank] = useState(openRank);
  const selectedRank = previewRank;
  const selected = RANKS[selectedRank]!;
  const rankUnits = unitsInRank(selectedRank);
  const rankDone = rankUnits.filter((unit) => completed.includes(unit.id)).length;
  const rankOpen = rankUnits[0] ? isUnlocked(rankUnits[0].id) : false;

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
            {learnedWords}/{TOTAL_WORDS} 단어
            {following ? ` · ${following.title}까지 ${remain * 10}단어` : " · 대상군 마스터"}
          </p>
          <Button asChild size="lg" className="w-full justify-between">
            <Link to="/learn/$unitId" params={{ unitId: continueUnit.id }}>
              <span>{completed.includes(continueUnit.id) ? "다시 풀기" : "이어서 배우기"}</span>
              <span className="max-w-[45%] truncate font-normal opacity-80">{continueUnit.title}</span>
            </Link>
          </Button>
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
        {rankOpen ? (
          selectedRank < RANKS.length - 1 ? (
            <p className="text-center text-xs text-muted-foreground">
              이 200단어를 모두 마치면 {RANKS[selectedRank + 1]?.title}이 열립니다
            </p>
          ) : null
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            {RANKS[selectedRank - 1]?.title} 200단어를 마치면 열립니다
          </p>
        )}
      </section>
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
