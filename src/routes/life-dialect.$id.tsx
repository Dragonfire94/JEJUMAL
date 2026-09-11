import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Volume2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InlineQuestion } from "@/components/inline-question";
import { playAudio } from "@/lib/audio";
import { buildInlineQuestions, getPassage, adjacentPassageIds, type LifeDialectPassage } from "@/lib/life-dialect";
import { useProgress, type LifeDialectRating } from "@/lib/progress";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/life-dialect/$id")({
  loader: ({ params }) => {
    const passage = getPassage(params.id);
    if (!passage) throw notFound();
    return passage;
  },
  component: LifeDialectDetailPage,
});

// 레슨 흐름(3~5분), docs/product-improvement-plan.md P2-1:
// 상황 확인 → 자막 없이 듣기 → 제주어 자막 → 단어 하이라이트 → 인라인 미니퀴즈
// → 표준어 확인 → 전체 듣기 → 자기평가. 문장별 타임코드가 없어 3번 "무슨
// 상황인가?" 의미 문항은 지어내지 않고, 대신 전체 듣기 후 자막을 순서대로 연다.
type Stage = "intro" | "listen" | "jeju" | "quiz" | "standard" | "rating";

const STAGE_ORDER: Stage[] = ["intro", "listen", "jeju", "quiz", "standard", "rating"];

function LifeDialectDetailPage() {
  const passage = Route.useLoaderData();
  const [stage, setStage] = useState<Stage>("intro");
  const [playing, setPlaying] = useState(false);
  const [played, setPlayed] = useState(false);
  const completePassage = useProgress((state) => state.completeLifeDialectPassage);
  const setRating = useProgress((state) => state.setLifeDialectRating);
  const savedRating = useProgress((state) => state.lifeDialectProgress[passage.id]?.selfRating ?? null);
  const { prevId, nextId } = adjacentPassageIds(passage.id);
  const questions = useMemo(() => buildInlineQuestions(passage), [passage]);

  const stageIndex = STAGE_ORDER.indexOf(stage);

  async function playFull() {
    setPlaying(true);
    try {
      await playAudio(passage.audioUrl);
      setPlayed(true);
    } finally {
      setPlaying(false);
    }
  }

  function goto(next: Stage) {
    if (next === "listen" && stage === "intro") {
      track("life_dialect_start", { passageId: passage.id, seq: passage.seq });
    }
    if (next === "quiz" && questions.length === 0) {
      setStage("standard");
      return;
    }
    setStage(next);
    if (next === "rating") {
      completePassage(passage.id);
      track("life_dialect_complete", { passageId: passage.id, seq: passage.seq });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PassageHeader passage={passage} />
      <ProgressDots current={stageIndex} total={STAGE_ORDER.length} />

      {stage === "intro" ? (
        <IntroStage passage={passage} onStart={() => goto("listen")} />
      ) : null}

      {stage === "listen" ? (
        <ListenStage playing={playing} played={played} onPlay={() => void playFull()} onNext={() => goto("jeju")} />
      ) : null}

      {stage === "jeju" ? (
        <JejuStage
          passage={passage}
          onReplay={() => void playFull()}
          playing={playing}
          onNext={() => goto("quiz")}
        />
      ) : null}

      {stage === "quiz" ? (
        <QuizStage questions={questions} onNext={() => goto("standard")} />
      ) : null}

      {stage === "standard" ? (
        <StandardStage passage={passage} onNext={() => goto("rating")} />
      ) : null}

      {stage === "rating" ? (
        <RatingStage
          savedRating={savedRating}
          onRate={(rating) => setRating(passage.id, rating)}
          onReplay={() => void playFull()}
          prevId={prevId}
          nextId={nextId}
        />
      ) : null}
    </div>
  );
}

function PassageHeader({ passage }: { passage: LifeDialectPassage }) {
  return (
    <header className="flex items-start gap-3">
      <Button asChild variant="ghost" size="icon" className="-ml-2">
        <Link to="/life-dialect" aria-label="목록으로">
          <ArrowLeft className="size-5" />
        </Link>
      </Button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs text-muted-foreground">{passage.category}</p>
          {!passage.requiredInCurriculum ? <Badge variant="outline">선택</Badge> : null}
        </div>
        <h1 className="font-display text-xl font-semibold tracking-tight">{passage.title}</h1>
      </div>
    </header>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors duration-[var(--motion-quick)]",
            i <= current ? "bg-primary" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}

function IntroStage({ passage, onStart }: { passage: LifeDialectPassage; onStart: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">
          자막 없이 먼저 들어봅니다. 무슨 상황인지 짐작하며 들으세요.
        </p>
        {passage.contentAdvisory ? (
          <p className="mt-3 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
            {passage.contentAdvisory}
          </p>
        ) : null}
      </div>
      <Button size="lg" onClick={onStart}>
        시작하기
      </Button>
    </div>
  );
}

function ListenStage({
  playing,
  played,
  onPlay,
  onNext,
}: {
  playing: boolean;
  played: boolean;
  onPlay: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <p className="text-center text-sm text-muted-foreground">자막 없이 전체 듣기</p>
      <Button size="lg" onClick={onPlay} className="h-16 min-w-40 rounded-xl px-8 text-base">
        <Volume2 className={cn("size-5", playing && "animate-pulse")} />
        {played ? "다시 듣기" : "듣기"}
      </Button>
      <Button variant="outline" size="lg" className="w-full" onClick={onNext} disabled={!played}>
        {played ? "제주어 자막 보기" : "먼저 들어보세요"}
      </Button>
    </div>
  );
}

function JejuStage({
  passage,
  onReplay,
  playing,
  onNext,
}: {
  passage: LifeDialectPassage;
  onReplay: () => void;
  playing: boolean;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" onClick={onReplay} className="self-start">
        <Volume2 className={cn("size-4", playing && "animate-pulse")} />
        다시 듣기
      </Button>
      <ul className="flex flex-col gap-3">
        {passage.sentences.map((sentence, i) => (
          <li key={i} className="rounded-2xl border border-border bg-card p-4">
            <p className="font-medium leading-relaxed">
              <HighlightedSentence text={sentence.jeju} links={sentence.wordLinks} />
            </p>
          </li>
        ))}
      </ul>
      {passage.note ? <p className="text-xs text-muted-foreground">{passage.note}</p> : null}
      <Button size="lg" onClick={onNext}>
        다음
      </Button>
    </div>
  );
}

function HighlightedSentence({
  text,
  links,
}: {
  text: string;
  links: { jeju: string; standard: string }[];
}) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  // wordLinks는 승인 전 후보(candidate)라서 정답처럼 굵게 표시하지 않고,
  // 탭하면 뜻을 보여주는 밑줄 표시로만 쓴다.
  const hit = links.find((link) => text.includes(link.jeju));
  if (!hit) return <>{text}</>;
  const idx = text.indexOf(hit.jeju);
  const before = text.slice(0, idx);
  const middle = text.slice(idx, idx + hit.jeju.length);
  const after = text.slice(idx + hit.jeju.length);
  const key = idx;
  const isRevealed = revealed.has(key);
  return (
    <>
      {before}
      <button
        type="button"
        onClick={() => setRevealed((prev) => new Set(prev).add(key))}
        className="underline decoration-dotted decoration-muted-foreground underline-offset-4"
      >
        {middle}
      </button>
      {isRevealed ? <span className="ml-1 text-xs text-muted-foreground">({hit.standard})</span> : null}
      {after}
    </>
  );
}

function QuizStage({
  questions,
  onNext,
}: {
  questions: ReturnType<typeof buildInlineQuestions>;
  onNext: () => void;
}) {
  const [answeredCount, setAnsweredCount] = useState(0);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">핵심 표현 미니퀴즈</p>
      {questions.map((question, i) => (
        <InlineQuestion
          key={i}
          question={question}
          index={i}
          onAnswered={() => setAnsweredCount((n) => n + 1)}
        />
      ))}
      <Button size="lg" onClick={onNext} disabled={answeredCount < questions.length}>
        {answeredCount < questions.length ? "문제를 모두 풀어주세요" : "표준어 확인"}
      </Button>
    </div>
  );
}

function StandardStage({ passage, onNext }: { passage: LifeDialectPassage; onNext: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {passage.sentences.map((sentence, i) => (
          <li key={i} className="rounded-2xl border border-border bg-card p-4">
            <p className="font-medium leading-relaxed">{sentence.jeju}</p>
            <p className="mt-1 text-sm text-muted-foreground">{sentence.solutionEdited}</p>
          </li>
        ))}
      </ul>
      <Button size="lg" onClick={onNext}>
        다음
      </Button>
    </div>
  );
}

function RatingStage({
  savedRating,
  onRate,
  onReplay,
  prevId,
  nextId,
}: {
  savedRating: LifeDialectRating | null;
  onRate: (rating: LifeDialectRating) => void;
  onReplay: () => void;
  prevId: string | null;
  nextId: string | null;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">이 편, 얼마나 익숙한가요?</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            variant={savedRating === "reviewing" ? "default" : "outline"}
            onClick={() => onRate("reviewing")}
          >
            복습 중
          </Button>
          <Button variant={savedRating === "familiar" ? "default" : "outline"} onClick={() => onRate("familiar")}>
            익숙함
          </Button>
        </div>
      </div>
      <Button variant="outline" onClick={onReplay}>
        <Volume2 className="size-4" />
        전체 다시 듣기
      </Button>
      <div className="grid grid-cols-2 gap-2">
        {prevId ? (
          <Button asChild variant="outline">
            <Link to="/life-dialect/$id" params={{ id: prevId }}>
              이전 편
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {nextId ? (
          <Button asChild>
            <Link to="/life-dialect/$id" params={{ id: nextId }}>
              다음 편
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link to="/life-dialect">목록으로</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
