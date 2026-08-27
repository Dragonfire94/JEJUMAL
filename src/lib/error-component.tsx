import { useEffect } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { reportError } from "@/lib/report";

export function AppErrorComponent({ error }: ErrorComponentProps) {
  useEffect(() => {
    reportError(error, { where: "AppErrorComponent" });
  }, [error]);

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-background px-6 text-center text-foreground">
      <span className="text-danger" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="font-display text-lg font-semibold">잠시 멈췄습니다</h1>
      <p className="max-w-md text-sm break-words text-muted-foreground">
        {error.message || "알 수 없는 오류입니다. 다시 열어 보세요."}
      </p>
      <button
        type="button"
        className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        onClick={() => window.location.reload()}
      >
        다시 열기
      </button>
    </main>
  );
}
