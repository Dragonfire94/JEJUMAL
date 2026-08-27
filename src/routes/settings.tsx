import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/lib/progress";
import { githubIssueUrl } from "@/lib/report";
import { isSfxOn, setSfxOn } from "@/lib/sfx";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const resetProgress = useProgress((state) => state.resetProgress);
  const [sfx, setSfx] = useState(() => isSfxOn());
  const [jeju, setJeju] = useState("");
  const [standard, setStandard] = useState("");
  const [contentNote, setContentNote] = useState("");
  const [bugNote, setBugNote] = useState("");

  function sendContent() {
    const body = [`제주어: ${jeju || "(없음)"}`, `표준어: ${standard || "(없음)"}`, "", contentNote || "(설명 없음)"].join("\n");
    window.open(githubIssueUrl(`[콘텐츠] ${jeju || "제보"}`, body), "_blank", "noopener");
  }

  function sendBug() {
    window.open(githubIssueUrl("[버그] 앱 오류", bugNote || "(설명 없음)"), "_blank", "noopener");
  }

  function clearAll() {
    if (!window.confirm("학습 기록, 복습노트, 통계를 모두 지울까요? 되돌릴 수 없습니다.")) return;
    resetProgress();
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="anim-rise pt-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">설정</h1>
        <p className="mt-1 text-xs text-muted-foreground">소리, 제보, 이 기기의 기록</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">소리</h2>
        <label className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm">
          <span>퀴즈 효과음</span>
          <input
            type="checkbox"
            checked={sfx}
            onChange={(event) => {
              setSfx(event.target.checked);
              setSfxOn(event.target.checked);
            }}
            className="size-4 accent-primary"
          />
        </label>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">콘텐츠 제보</h2>
        <p className="text-xs text-muted-foreground">번역이 이상하거나 안 맞는 말이 있으면 알려 주세요.</p>
        <input
          value={jeju}
          onChange={(event) => setJeju(event.target.value)}
          placeholder="제주말"
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <input
          value={standard}
          onChange={(event) => setStandard(event.target.value)}
          placeholder="적혀 있는 표준어"
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <textarea
          value={contentNote}
          onChange={(event) => setContentNote(event.target.value)}
          placeholder="뭐가 이상한지"
          rows={3}
          className="resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <Button type="button" variant="outline" onClick={sendContent}>
          콘텐츠 제보하기
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">앱 오류</h2>
        <textarea
          value={bugNote}
          onChange={(event) => setBugNote(event.target.value)}
          placeholder="어디서, 무슨 일이 있었는지"
          rows={3}
          className="resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        <Button type="button" variant="outline" onClick={sendBug}>
          오류 제보하기
        </Button>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">이 기기</h2>
        <Button type="button" variant="outline" className="text-danger" onClick={clearAll}>
          학습 기록 모두 지우기
        </Button>
      </section>

      <section className="flex flex-col gap-2 text-xs text-muted-foreground">
        <h2 className="text-sm font-medium text-foreground">정보</h2>
        <p>발음 출처 · 제주특별자치도 제주어 사전</p>
        <a className="text-primary underline-offset-4 hover:underline" href="https://github.com/Dragonfire94/JEJUMAL" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </section>
    </div>
  );
}
