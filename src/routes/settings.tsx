import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { isNotifyOn, notificationsSupported, setNotifyOn } from "@/lib/notify";
import { useProgress } from "@/lib/progress";
import { githubIssueUrl, clearLastError, lastErrorIssueUrl, readLastError, readLastWord } from "@/lib/report";
import { isSfxOn, setSfxOn } from "@/lib/sfx";
import { applyTheme, readTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const resetProgress = useProgress((state) => state.resetProgress);
  const [sfx, setSfx] = useState(() => isSfxOn());
  const [theme, setTheme] = useState<Theme>(() => readTheme());
  const [notify, setNotify] = useState(() => isNotifyOn());
  const [notifyHint, setNotifyHint] = useState("");
  const lastWord = readLastWord();
  const [lastError, setLastError] = useState(() => readLastError());
  const [attachError, setAttachError] = useState(() => Boolean(readLastError()));
  const [jeju, setJeju] = useState(() => lastWord?.jeju ?? "");
  const [standard, setStandard] = useState(() => lastWord?.standard ?? "");
  const [contentNote, setContentNote] = useState("");
  const [bugNote, setBugNote] = useState("");

  function sendContent() {
    const body = [
      lastWord?.seq ? `seq: ${lastWord.seq}` : "",
      `제주어: ${jeju || "(없음)"}`,
      `표준어: ${standard || "(없음)"}`,
      lastWord?.unitId ? `유닛: ${lastWord.unitId}` : "",
      "",
      contentNote || "(설명 없음)",
    ]
      .filter((line, index, all) => line !== "" || all[index + 1] === "")
      .join("\n");
    window.open(githubIssueUrl(`[콘텐츠] ${jeju || "제보"}`, body), "_blank", "noopener");
  }

  function sendBug() {
    if (attachError && lastError) {
      window.open(lastErrorIssueUrl(lastError, bugNote), "_blank", "noopener");
      clearLastError();
      setLastError(null);
      setAttachError(false);
      return;
    }
    window.open(githubIssueUrl("[버그] 앱 오류", bugNote || "(설명 없음)"), "_blank", "noopener");
  }

  function clearAll() {
    if (!window.confirm("학습 기록, 복습노트, 통계를 모두 지울까요? 되돌릴 수 없습니다.")) return;
    resetProgress();
  }

  function pickTheme(next: Theme) {
    setTheme(next);
    applyTheme(next);
  }

  async function toggleNotify(on: boolean) {
    if (!on) {
      await setNotifyOn(false);
      setNotify(false);
      setNotifyHint("");
      return;
    }
    if (!notificationsSupported()) {
      setNotifyHint("이 브라우저는 알림을 지원하지 않습니다.");
      return;
    }
    const granted = await setNotifyOn(true);
    setNotify(granted);
    setNotifyHint(granted ? "오늘 볼 카드가 있으면 알려 드립니다. 앱을 연 상태에서만 갑니다." : "알림 권한이 꺼져 있습니다. 브라우저 설정에서 허용해 주세요.");
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="anim-rise pt-1">
        <h1 className="font-display text-2xl font-semibold tracking-tight">설정</h1>
        <p className="mt-1 text-xs text-muted-foreground">화면, 소리, 제보, 이 기기의 기록</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">화면</h2>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              ["light", "밝게"],
              ["dark", "어둡게"],
              ["system", "시스템"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => pickTheme(value)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm",
                theme === value ? "border-foreground bg-card font-medium" : "border-border bg-card text-muted-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">소리 · 알림</h2>
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
        <label className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm">
          <span>복습 알림</span>
          <input
            type="checkbox"
            checked={notify}
            onChange={(event) => void toggleNotify(event.target.checked)}
            className="size-4 accent-primary"
          />
        </label>
        {notifyHint ? <p className="text-xs text-muted-foreground">{notifyHint}</p> : null}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium">콘텐츠 제보</h2>
        <p className="text-xs text-muted-foreground">
          {lastWord?.jeju ? `방금 본 말(${lastWord.jeju})을 채워 두었습니다. 고쳐 쓰셔도 됩니다.` : "번역이 이상하거나 안 맞는 말이 있으면 알려 주세요."}
        </p>
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
        <h2 className="font-medium">앱이 이상할 때</h2>
        <p className="text-xs text-muted-foreground">멈췄거나 버튼이 안 먹으면 알려 주세요.</p>
        <textarea
          value={bugNote}
          onChange={(event) => setBugNote(event.target.value)}
          placeholder="어디서, 무슨 일이 있었는지"
          rows={3}
          className="resize-none rounded-xl border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground"
        />
        {lastError ? (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={attachError}
              onChange={(event) => setAttachError(event.target.checked)}
              className="size-4 accent-primary"
            />
            방금 멈춘 기록도 같이 보내기
          </label>
        ) : null}
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
        <p>예문 출처 · AI-HUB 한국어 방언 발화(제주도)에서 짧은 말만 골랐습니다</p>
        <a className="text-primary underline-offset-4 hover:underline" href="https://github.com/Dragonfire94/JEJUMAL" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </section>
    </div>
  );
}
