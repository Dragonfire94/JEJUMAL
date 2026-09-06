import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listPassages } from "@/lib/life-dialect";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/life-dialect/")({
  component: LifeDialectListPage,
});

const RATING_LABEL: Record<string, string> = {
  reviewing: "복습 중",
  familiar: "익숙함",
};

function LifeDialectListPage() {
  const passages = listPassages();
  const progress = useProgress((state) => state.lifeDialectProgress);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start gap-3">
        <Button asChild variant="ghost" size="icon" className="-ml-2">
          <Link to="/" aria-label="뒤로">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <p className="text-xs text-muted-foreground">파일럿 · 실제 회화 10편</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">생활방언</h1>
        </div>
      </header>
      <p className="text-sm text-muted-foreground">
        제주특별자치도가 공개한 생활방언 100편 중 10편입니다. 단어 카드가 아니라 실제 대화
        맥락으로 익힙니다.
      </p>
      <ul className="stagger-list flex flex-col gap-2">
        {passages.map((passage) => {
          const state = progress[passage.id];
          const done = Boolean(state);
          return (
            <li key={passage.id}>
              <Link
                to="/life-dialect/$id"
                params={{ id: passage.id }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-[transform] duration-[var(--motion-quick)] active:scale-[0.98]"
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-xl",
                    done ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="size-5" /> : <Volume2 className="size-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{passage.title}</span>
                    {!passage.requiredInCurriculum ? <Badge variant="outline">선택</Badge> : null}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {passage.category} · 문장 {passage.sentences.length}개
                    {state?.selfRating ? ` · ${RATING_LABEL[state.selfRating]}` : ""}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="text-center text-[11px] text-muted-foreground">
        발음 출처 · 제주특별자치도 생활방언(공공누리 출처표시 조건, 상업이용·변경 허용 여부는
        미확인)
      </p>
    </div>
  );
}
