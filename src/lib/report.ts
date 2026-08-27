const GITHUB_ISSUE = "https://github.com/Dragonfire94/JEJUMAL/issues/new";

export function reportError(error: unknown, context: Record<string, string> = {}) {
  console.error("[jeju-mal]", error, context);
}

export function githubIssueUrl(title: string, body: string): string {
  const params = new URLSearchParams({ title, body });
  return `${GITHUB_ISSUE}?${params.toString()}`;
}
