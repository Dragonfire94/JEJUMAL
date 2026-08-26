import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Volume2 } from "lucide-react";
import { useState } from "react";
import { QuizView } from "@/components/quiz-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { playWord } from "@/lib/audio";
import { useProgress } from "@/lib/progress";
import { buildLesson, type Question } from "@/lib/quiz";
import { formatUnitNumber, getUnit, nextUnit, progressPercent, RANKS, rankFromPercent, rankFromWave, type Word } from "@/lib/units";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/$unitId")({
  component: LearnPage,
});

type Phase = "intro" | "quiz" | "results";

function LearnPage() {
  const { unitId } = Route.useParams();
  const unit = getUnit(unitId);
  const unlocked = useProgress((state) => state.isUnlocked(unitId));
  const completeUnit = useProgress((state) => state.completeUnit);
  const isUnlocked = useProgress((state) => state.isUnlocked);
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState({ correct: 0, total: 0, missedSeqs: [] as string[], savedSeqs: [] as string[] });
  const [promotedTo, setPromotedTo] = useState<string | null>(null);
  const following = unit ? nextUnit(unit.id) : undefined;
  const pack = unit ? rankFromWave(unit.rankIndex) : undefined;

  if (!unit) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="font-medium">없는 유닛입니다</p>
        <Button asChild>
          <Link to="/">홈으로</Link>
        </Button>
      </div>
    );
  }

  const currentUnit = unit;

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="font-medium">아직 잠긴 유닛입니다</p>
        <Button asChild>
          <Link to="/">홈으로</Link>
        </Button>
      </div>
    );
  }

  function start() {
    setQuestions(buildLesson(currentUnit));
    setPhase("quiz");
  }

  function finish(result: { correct: number; missedSeqs: string[]; savedSeqs: string[] }) {
    const before = useProgress.getState().completedUnitIds;
    const already = before.includes(currentUnit.id);
    completeUnit(currentUnit.id);
    if (!already) {
      const prev = rankFromPercent(progressPercent(before.length));
      const next = rankFromPercent(progressPercent(before.length + 1));
      if (prev.id !== next.id) setPromotedTo(next.title);
    }
    setScore({ ...result, total: questions.length });
    setPhase("results");
  }

  if (phase === "quiz") {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader kicker={`${pack?.title ?? ""} · 200단어`} title="퀴즈" />
        <QuizView questions={questions} onFinished={finish} />
      </div>
    );
  }

  if (phase === "results") {
    const missedWords = currentUnit.words.filter((word) => score.missedSeqs.includes(word.seq));
    const savedCount = score.savedSeqs.length;
    const percent = score.total ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="flex flex-col gap-6">
        <PageHeader kicker={currentUnit.title} title="결과" />
        <div className="anim-rise rounded-2xl border border-border bg-card px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">맞힌 문제</p>
          <p className="mt-2 font-display text-5xl font-semibold tabular-nums tracking-tight">
            {score.correct}
            <span className="text-2xl text-muted-foreground">/{score.total}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{percent}%</p>
          {promotedTo ? (
            <p className="mt-3 font-medium text-primary">{promotedTo}으로 승급했습니다</p>
          ) : null}
          {savedCount > 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">복습노트에 {savedCount}개 넣었습니다</p>
          ) : null}
        </div>
        {missedWords.length > 0 ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">틀린 말</h2>
              <Badge variant="danger">{missedWords.length}개</Badge>
            </div>
            <WordList words={missedWords} />
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">이 유닛은 전부 맞혔습니다.</p>
        )}
        <div className="grid gap-2">
          {savedCount > 0 ? (
            <Button asChild size="lg">
              <Link to="/review">복습노트 보기</Link>
            </Button>
          ) : null}
          {following && isUnlocked(following.id) ? (
            <Button asChild size="lg" variant={savedCount > 0 ? "outline" : "default"}>
              <Link to="/learn/$unitId" params={{ unitId: following.id }}>
                {rankFromWave(following.rankIndex).id === pack?.id
                  ? `다음 · ${following.title}`
                  : `${rankFromWave(following.rankIndex).title} 시작`}
              </Link>
            </Button>
          ) : following ? (
            <p className="text-center text-sm text-muted-foreground">
              이 200단어를 모두 마치면 {rankFromWave(following.rankIndex).title}이 열립니다
            </p>
          ) : null}
          <Button asChild variant="outline" size="lg">
            <Link to="/">유닛 목록</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader kicker={pack ? `${pack.title} · 200단어` : `유닛 ${formatUnitNumber(currentUnit.order)}`} title={currentUnit.title} />
      <p className="text-sm text-muted-foreground">
        단어를 들어 본 뒤 듣기 10문제, 읽기 10문제를 풉니다. 다시 보고 싶은 말은 복습노트에 넣으면 됩니다.
      </p>
      <WordList words={currentUnit.words} />
      <Button size="lg" className="w-full" onClick={start}>
        퀴즈 시작
      </Button>
    </div>
  );
}

function WordList({ words }: { words: Word[] }) {
  const [playingSeq, setPlayingSeq] = useState<string | null>(null);
  const [failedSeq, setFailedSeq] = useState<string | null>(null);

  async function play(word: Word) {
    setFailedSeq(null);
    setPlayingSeq(word.seq);
    try {
      await playWord(word);
    } catch {
      setFailedSeq(word.seq);
    } finally {
      setPlayingSeq((current) => (current === word.seq ? null : current));
    }
  }

  return (
    <ul className="stagger-list divide-y divide-border rounded-2xl border border-border bg-card">
      {words.map((word) => (
        <li key={word.seq} className="flex items-center gap-3 px-3 py-2">
          <button
            type="button"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors duration-[var(--motion-quick)] hover:bg-muted"
            onClick={() => void play(word)}
            aria-label={`${word.jeju} 발음 듣기`}
          >
            <Volume2 className={cn("size-4", playingSeq === word.seq && "animate-pulse text-primary")} />
          </button>
          <span className="min-w-0 flex-1 font-medium">{word.jeju}</span>
          <span className="text-sm text-muted-foreground">
            {failedSeq === word.seq ? "재생 안 됨" : word.standard}
          </span>
        </li>
      ))}
    </ul>
  );
}

function PageHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <header className="flex items-start gap-3">
      <Button asChild variant="ghost" size="icon" className="-ml-2">
        <Link to="/" aria-label="뒤로">
          <ArrowLeft className="size-5" />
        </Link>
      </Button>
      <div>
        <p className="text-xs text-muted-foreground">{kicker}</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
    </header>
  );
}
