import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { dueCount, useProgress } from "@/lib/progress";
import {
  STATS_CHART_DAYS,
  chartDays,
  chartHasActivity,
  localDateKey,
  quizAccuracy,
  reviewsDone,
  studyStreak,
  rankMastery,
} from "@/lib/stats";
import { TOTAL_WORDS, nextUnlockStatus, progressPercent } from "@/lib/units";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stats")({
  component: StatsPage,
});

function StatsPage() {
  const completed = useProgress((state) => state.completedUnitIds);
  const dailyStats = useProgress((state) => state.dailyStats);
  const wrongBySeq = useProgress((state) => state.wrongBySeq);
  const todayKey = localDateKey();
  const today = dailyStats[todayKey];
  const newWords = today?.wordsStudied ?? 0;
  const reviews = today ? reviewsDone(today) : 0;
  const percent = progressPercent(completed.length);
  const unlockStatus = nextUnlockStatus(completed);
  const streak = useMemo(() => studyStreak(dailyStats, todayKey), [dailyStats, todayKey]);
  const days = useMemo(() => chartDays(dailyStats, todayKey), [dailyStats, todayKey]);
  const hasChart = chartHasActivity(days);
  const ranks = useMemo(() => rankMastery(completed), [completed]);
  const dueCards = useProgress((state) => dueCount(state.wrongBySeq));
  const notebookCount = Object.keys(wrongBySeq).length;
  const weekReviews = days.reduce((sum, day) => sum + reviewsDone(day), 0);
  const maxWords = Math.max(10, ...days.map((day) => day.wordsStudied));

  return (
    <div className="flex flex-col gap-6">
      <header className="anim-rise pt-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">통계</h1>
        <p className="mt-1 text-xs text-muted-foreground">최근 기록만 보여드려요. 오늘부터 쌓입니다.</p>
      </header>

      <section className="grid grid-cols-3 gap-2">
        <SummaryCard label="오늘" value={`${newWords}`} hint={`신규 ${newWords} · 복습 ${reviews}`} />
        <SummaryCard label="연속" value={`${streak}`} hint="일" />
        <SummaryCard label="진행" value={`${percent}%`} hint={`${completed.length * 10}/${TOTAL_WORDS}단어`} />
      </section>
      <p className="text-center text-xs tabular-nums text-muted-foreground">{unlockStatus}</p>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">최근 {STATS_CHART_DAYS}일 학습량</h2>
        {hasChart ? (
          <div className="flex h-28 items-end gap-1 rounded-2xl border border-border bg-card px-3 pb-2 pt-4">
            {days.map((day) => {
              const height = day.wordsStudied ? Math.max(8, Math.round((day.wordsStudied / maxWords) * 100)) : 0;
              return (
                <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                  <div
                    className={cn("w-full rounded-sm bg-primary", day.wordsStudied ? "opacity-100" : "opacity-20")}
                    style={{ height: `${height}%` }}
                    title={`${day.date} ${day.wordsStudied}단어`}
                  />
                  <span className="text-[9px] tabular-nums text-muted-foreground">{Number(day.date.slice(-2))}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyChart />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">최근 {STATS_CHART_DAYS}일 정답률</h2>
        {hasChart ? (
          <div className="flex h-28 items-end gap-1 rounded-2xl border border-border bg-card px-3 pb-2 pt-4">
            {days.map((day) => {
              const accuracy = quizAccuracy(day);
              const height = accuracy ?? 0;
              return (
                <div key={day.date} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1">
                  <div
                    className={cn("w-full rounded-sm", accuracy === null ? "bg-muted" : "bg-primary")}
                    style={{ height: `${accuracy === null ? 6 : Math.max(8, height)}%` }}
                    title={accuracy === null ? `${day.date} 기록 없음` : `${day.date} ${accuracy}%`}
                  />
                  <span className="text-[9px] tabular-nums text-muted-foreground">{Number(day.date.slice(-2))}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyChart />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">등급별</h2>
        <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-4">
          {ranks.map((rank) => (
            <div key={rank.id} className={cn("flex flex-col gap-1", !rank.open && "opacity-50")}>
              <div className="flex items-baseline justify-between gap-2 text-sm">
                <span>{rank.title}</span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {rank.wordsDone}/{rank.wordsTotal} · {rank.percent}%
                </span>
              </div>
              <Progress value={rank.percent} />
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-medium">복습노트</h2>
        <Card>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm">대기 {dueCards}장 · 노트 {notebookCount}장</p>
              <p className="text-xs text-muted-foreground">최근 {STATS_CHART_DAYS}일 복습 {weekReviews}회</p>
            </div>
            <Link to="/review" className="text-sm font-medium text-primary">
              보러 가기
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="anim-rise rounded-2xl border border-border bg-card px-3 py-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function EmptyChart() {
  return (
    <p className="rounded-2xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
      기록이 쌓이면 여기 그래프가 채워져요
    </p>
  );
}
