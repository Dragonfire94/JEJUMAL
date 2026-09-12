import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listItems } from "@/lib/culture";

export const Route = createFileRoute("/culture/")({
  component: CultureListPage,
});

const LINGUISTIC_TYPE_LABEL: Record<string, string> = {
  JEJU_DIALECT_FORM: "제주 방언 표기",
  JEJU_CULTURAL_TERM: "제주 문화어",
  BOTH: "방언·문화어",
};

function CultureListPage() {
  const items = listItems();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start gap-3">
        <Button asChild variant="ghost" size="icon" className="-ml-2">
          <Link to="/" aria-label="뒤로">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div>
          <p className="text-xs text-muted-foreground">2025 제주학연구센터 기본어휘</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">제주 문화어</h1>
        </div>
      </header>
      <p className="text-sm text-muted-foreground">
        생활에서 자주 쓰는 말이라기보다, 제주를 이해하는 데 중요한 문화어·방언 표기 {items.length}개입니다.
        단어 카드 학습이나 퀴즈에는 들어가지 않고, 여기서 뜻만 찾아볼 수 있습니다.
      </p>
      <ul className="stagger-list flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <Link
              to="/culture/$id"
              params={{ id: item.id }}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-[transform] duration-[var(--motion-quick)] active:scale-[0.98]"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <BookOpen className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium">{item.jeju}</span>
                  <Badge variant="outline">{item.level}</Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {LINGUISTIC_TYPE_LABEL[item.linguisticType]} · {item.definition}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-center text-[11px] text-muted-foreground">
        출처 · 제주학연구센터 &lt;제주어 기본어휘&gt;(제주학총서 84), 비매품/무료 공공 자료
      </p>
    </div>
  );
}
