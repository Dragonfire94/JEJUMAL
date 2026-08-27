import { useEffect } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { lastErrorIssueUrl, readLastError, reportError } from "@/lib/report";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  useEffect(() => {
    reportError(error, { where: "AppErrorComponent" });
  }, [error]);

  function report() {
    const stored = readLastError();
    if (stored) {
      window.open(lastErrorIssueUrl(stored), "_blank", "noopener");
      return;
    }
    window.location.reload();
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center text-foreground">
      <span className="text-danger" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="font-display text-lg font-semibold">잠시 멈췄습니다</h1>
      <p className="max-w-md text-sm text-muted-foreground">다시 열어 보세요. 계속되면 알려 주세요.</p>
      <div className="mt-2 flex flex-col gap-2">
        <button
          type="button"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          onClick={() => window.location.reload()}
        >
          다시 열기
        </button>
        <button
          type="button"
          className="rounded-xl px-4 py-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={report}
        >
          문제 알리기
        </button>
      </div>
    </main>
  );
}
