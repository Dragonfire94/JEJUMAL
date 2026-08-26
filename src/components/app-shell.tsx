import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Notebook } from "lucide-react";
import { useEffect } from "react";
import { hydrateProgress, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const wrongCount = useProgress((state) => Object.keys(state.wrongBySeq).length);

  useEffect(() => {
    hydrateProgress();
  }, []);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col">
        <main className="flex-1 px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
          <div className="mx-auto grid max-w-lg grid-cols-2">
            <TabLink to="/" active={pathname === "/"} icon={<BookOpen className="size-4" />} label="배우기" />
            <TabLink
              to="/review"
              active={pathname.startsWith("/review")}
              icon={<Notebook className="size-4" />}
              label="복습노트"
              count={wrongCount}
            />
          </div>
        </nav>
      </div>
    </div>
  );
}

function TabLink({
  to,
  active,
  icon,
  label,
  count,
}: {
  to: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "relative flex h-14 items-center justify-center gap-2 text-sm font-medium transition-colors duration-[var(--motion-quick)] ease-[var(--ease-out)]",
        active ? "text-foreground" : "text-muted-foreground",
      )}
    >
      {icon}
      {label}
      {count ? (
        <span className="anim-badge min-w-5 rounded-full bg-primary px-1.5 text-center text-[11px] font-semibold tabular-nums text-primary-foreground">
          {count}
        </span>
      ) : null}
      <span
        className={cn(
          "absolute inset-x-10 bottom-1 h-0.5 rounded-full bg-primary transition-opacity duration-[var(--motion-fast)] ease-[var(--ease-out)]",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </Link>
  );
}
