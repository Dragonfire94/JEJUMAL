import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getItem } from "@/lib/culture";

export const Route = createFileRoute("/culture/$id")({
  loader: ({ params }) => {
    const item = getItem(params.id);
    if (!item) throw notFound();
    return item;
  },
  component: CultureDetailPage,
});

const LINGUISTIC_TYPE_LABEL: Record<string, string> = {
  JEJU_DIALECT_FORM: "제주 방언 표기",
  JEJU_CULTURAL_TERM: "제주 문화어",
  BOTH: "방언·문화어",
};

// 3C-3B §7 정책: hasAudio:false면 재생 버튼 자체를 렌더하지 않는다.
// main의 AudioButton(playWord의 로컬 파일→TTS 폴백 구조)을 여기서
// import하지 않는 것도 그 격리의 일부다 — 옛한글/PUA 표기가 섞인
// 표제어를 generic TTS가 제주어 공식 발음처럼 근사하는 것을 막는다.
function CultureDetailPage() {
  const item = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start gap-3">
        <Button asChild variant="ghost" size="icon" className="-ml-2">
          <Link to="/culture" aria-label="목록으로">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">{LINGUISTIC_TYPE_LABEL[item.linguisticType]}</p>
            <Badge variant="outline">{item.level}</Badge>
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight">{item.jeju}</h1>
        </div>
      </header>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm leading-relaxed">{item.definition}</p>
        {item.otherJejuForms.length > 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">다른 표기: {item.otherJejuForms.join(", ")}</p>
        ) : null}
      </div>

      {/* learnerGloss가 null(pendingGloss)이면 gloss 영역 자체를 숨긴다 —
          내부 검수 상태를 일반 사용자에게 노출하지 않고, 위 definition
          원문으로 내용을 충분히 전달한다(3C-3B §A-9, D-10). */}
      {item.learnerGloss ? (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">한 줄 뜻</p>
          <p className="mt-1 text-sm font-medium">{item.learnerGloss}</p>
        </div>
      ) : null}

      <p className="text-center text-[11px] text-muted-foreground">
        출처 · 제주학연구센터 &lt;제주어 기본어휘&gt;(제주학총서 84)
      </p>
    </div>
  );
}
