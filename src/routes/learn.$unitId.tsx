import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Volume2 } from "lucide-react";
import { useState } from "react";
import { ExampleLine } from "@/components/example-line";
import { QuizView } from "@/components/quiz-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { playWord } from "@/lib/audio";
import { rememberLastWord } from "@/lib/report";
import { track } from "@/lib/track";
import { useProgress } from "@/lib/progress";
import {
  buildLesson,
  hasPassed,
  PASS_PERCENT,
  shuffleQuestions,
  type Question,
  type QuizResult,
} from "@/lib/quiz";
import { formatUnitNumber, getUnit, nextUnit, currentRank, rankFromWave, firstExample, formatRankUnlockHint, rankUnlockHint, rankIndexOfWave, type Word } from "@/lib/units";
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
  const touchUnit = useProgress((state) => state.touchUnit);
  const recordQuiz = useProgress((state) => state.recordQuiz);
  const isUnlocked = useProgress((state) => state.isUnlocked);
  const completed = useProgress((state) => state.completedUnitIds);
  const addToNotebook = useProgress((state) => state.addToNotebook);
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState<"main" | "retry">("main");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState({
    correct: 0,
    total: 0,
    passed: false,
    missedSeqs: [] as string[],
    savedSeqs: [] as string[],
    missedQuestions: [] as Question[],
  });
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
    const lesson = buildLesson(currentUnit);
    touchUnit(currentUnit.id);
    setQuestions(lesson);
    setRound("main");
    setPromotedTo(null);
    setScore({
      correct: 0,
      total: lesson.length,
      passed: false,
      missedSeqs: [],
      savedSeqs: [],
      missedQuestions: [],
    });
    setPhase("quiz");
    track("unit_start", { unitId: currentUnit.id, rank: pack?.id ?? "" });
  }

  function finish(result: QuizResult) {
    const total = round === "main" ? questions.length : score.total;
    const correct = round === "main" ? result.correct : score.correct + result.correct;
    const passed = hasPassed(correct, total);
    const savedSeqs = [...new Set([...score.savedSeqs, ...result.savedSeqs])];
    recordQuiz(result.correct, questions.length);
    const before = useProgress.getState().completedUnitIds;
    const already = before.includes(currentUnit.id);

    if (passed && !already) {
      completeUnit(currentUnit.id);
      const after = [...before, currentUnit.id];
      const prev = currentRank(before);
      const next = currentRank(after);
      if (prev.id !== next.id) {
        setPromotedTo(next.title);
        track("rank_open", { rank: next.id, unitId: currentUnit.id });
      }
    } else if (passed) {
      completeUnit(currentUnit.id);
    } else {
      touchUnit(currentUnit.id);
    }

    track(passed ? "unit_pass" : "unit_fail", {
      unitId: currentUnit.id,
      rank: pack?.id ?? "",
      round,
      percent: total ? Math.round((correct / total) * 100) : 0,
    });

    setScore({
      correct,
      total,
      passed,
      missedSeqs: result.missedSeqs,
      savedSeqs,
      missedQuestions: result.missedQuestions,
    });
    setPhase("results");
  }

  function retryMissed() {
    if (score.missedQuestions.length === 0) return;
    setQuestions(shuffleQuestions(score.missedQuestions));
    setRound("retry");
    setPhase("quiz");
    track("retry_start", { unitId: currentUnit.id, missed: score.missedQuestions.length });
  }

  if (phase === "quiz") {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader
          kicker={`${pack?.title ?? ""} · 200단어`}
          title={round === "retry" ? "틀린 것만 다시" : "퀴즈"}
        />
        <QuizView
          key={questions.map((question) => question.id).join("|")}
          questions={questions}
          onFinished={finish}
        />
      </div>
    );
  }

  if (phase === "results") {
    const missedWords = currentUnit.words.filter((word) => score.missedSeqs.includes(word.seq));
    const savedCount = score.savedSeqs.length;
    const percent = score.total ? Math.round((score.correct / score.total) * 100) : 0;
    const need = Math.ceil((score.total * PASS_PERCENT) / 100);
    const stuck = !score.passed && round === "retry";

    function leaveToReview() {
      for (const word of missedWords) addToNotebook(word, currentUnit.id);
      void navigate({ to: missedWords.length > 0 || savedCount > 0 ? "/review" : "/" });
    }
    return (
      <div className="flex flex-col gap-6">
        <PageHeader kicker={currentUnit.title} title="결과" />
        <div className="anim-rise rounded-2xl border border-border bg-card px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">{score.passed ? "클리어" : "아직 클리어 전"}</p>
          <p className="mt-2 font-display text-5xl font-semibold tabular-nums tracking-tight">
            {score.correct}
            <span className="text-2xl text-muted-foreground">/{score.total}</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{percent}%</p>
          {score.passed ? (
            promotedTo ? (
              <p className="mt-3 font-medium text-primary">{promotedTo}으로 승급했습니다</p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">{PASS_PERCENT}% 이상으로 이 유닛을 마쳤습니다</p>
            )
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              {need}문제 이상 맞혀야 클리어입니다. 틀린 것만 다시 풀어 보세요.
            </p>
          )}
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
          {stuck ? (
            <>
              <Button size="lg" onClick={leaveToReview}>
                복습노트에서 이어서
              </Button>
              <p className="text-center text-xs text-muted-foreground">이 유닛은 나중에 다시 열 수 있습니다</p>
            </>
          ) : null}
          {score.missedQuestions.length > 0 ? (
            <Button size="lg" variant={score.passed || stuck ? "outline" : "default"} onClick={retryMissed}>
              틀린 것만 다시 · {score.missedQuestions.length}문제
            </Button>
          ) : null}
          {!stuck && savedCount > 0 ? (
            <Button asChild size="lg" variant={score.passed && score.missedQuestions.length === 0 ? "default" : "outline"}>
              <Link to="/review">복습노트 보기</Link>
            </Button>
          ) : null}
          {score.passed && following && isUnlocked(following.id) ? (
            <Button asChild size="lg" variant={score.missedQuestions.length > 0 || savedCount > 0 ? "outline" : "default"}>
              <Link to="/learn/$unitId" params={{ unitId: following.id }}>
                {rankFromWave(following.rankIndex).id === pack?.id
                  ? `다음 · ${following.title}`
                  : `${rankFromWave(following.rankIndex).title} 시작`}
              </Link>
            </Button>
          ) : following && !score.passed && !stuck ? (
            <p className="text-center text-sm text-muted-foreground">
              {PASS_PERCENT}%를 넘기면 다음으로 갈 수 있습니다
            </p>
          ) : following && !isUnlocked(following.id) ? (
            <p className="text-center text-sm text-muted-foreground">
              {formatRankUnlockHint(
                rankUnlockHint(rankIndexOfWave(currentUnit.rankIndex), completed) ?? {
                  kind: "locked-advance",
                  prevTitle: pack?.title ?? "이전 등급",
                  haveWords: 0,
                  needWords: 120,
                },
              )}
            </p>
          ) : null}
          <Button asChild variant="outline" size="lg">
            <Link to="/">{stuck ? "오늘은 여기까지" : "유닛 목록"}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader kicker={pack ? `${pack.title} · 200단어` : `유닛 ${formatUnitNumber(currentUnit.order)}`} title={currentUnit.title} />
      <p className="text-sm text-muted-foreground">
        단어를 들어 본 뒤 듣기 10문제, 읽기 10문제를 풉니다. {PASS_PERCENT}% 이상이면 클리어입니다. 틀리면 그 문제만 다시 풀 수 있습니다.
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
    rememberLastWord({ seq: word.seq, jeju: word.jeju, standard: word.standard });
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
      {words.map((word) => {
        const example = firstExample(word);
        return (
        <li key={word.seq} className="flex items-start gap-3 px-3 py-2.5">
          <button
            type="button"
            className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors duration-[var(--motion-quick)] hover:bg-muted"
            onClick={() => void play(word)}
            aria-label={`${word.jeju} 발음 듣기`}
          >
            <Volume2 className={cn("size-4", playingSeq === word.seq && "animate-pulse text-primary")} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-medium">{word.jeju}</span>
              <span className="shrink-0 text-sm text-muted-foreground">
                {failedSeq === word.seq ? "재생 안 됨" : word.standard}
              </span>
            </div>
            {example ? <div className="mt-1"><ExampleLine example={example} /></div> : null}
          </div>
        </li>
        );
      })}
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
