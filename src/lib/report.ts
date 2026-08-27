const GITHUB_ISSUE = "https://github.com/Dragonfire94/JEJUMAL/issues/new";

export function reportError(error: unknown, context: Record<string, string> = {}) {
  console.error("[jeju-mal]", error, context);
}

export function contentReportUrl(word: {
  seq: string;
  jeju: string;
  standard: string;
  unitId?: string;
}): string {
  const title = `[콘텐츠] ${word.jeju} (${word.seq})`;
  const body = [
    `seq: ${word.seq}`,
    `제주어: ${word.jeju}`,
    `표준어: ${word.standard}`,
    word.unitId ? `유닛: ${word.unitId}` : "",
  ]
    .filter(Boolean)
    .join("\n");
  const params = new URLSearchParams({ title, body });
  return `${GITHUB_ISSUE}?${params.toString()}`;
}
