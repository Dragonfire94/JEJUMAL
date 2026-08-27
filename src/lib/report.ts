const GITHUB_ISSUE = "https://github.com/Dragonfire94/JEJUMAL/issues/new";
const LAST_ERROR_KEY = "jeju-mal:last-error";
const LAST_WORD_KEY = "jeju-mal:last-word";
const NOISE = /ResizeObserver|Script error\.|chrome-extension:|moz-extension:/i;

export type LastError = {
  at: number;
  message: string;
  context: Record<string, string>;
};

export type LastWord = {
  seq: string;
  jeju: string;
  standard: string;
  unitId?: string;
};

export function reportError(error: unknown, context: Record<string, string> = {}) {
  console.error("[jeju-mal]", error, context);
  const message = error instanceof Error ? error.message : String(error);
  if (NOISE.test(message)) return;
  const stored: LastError = { at: Date.now(), message: message.slice(0, 500), context };
  try {
    localStorage.setItem(LAST_ERROR_KEY, JSON.stringify(stored));
  } catch {
    /* ignore */
  }
}

export function readLastError(): LastError | null {
  try {
    const raw = localStorage.getItem(LAST_ERROR_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastError;
    if (!parsed?.message) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearLastError() {
  try {
    localStorage.removeItem(LAST_ERROR_KEY);
  } catch {
    /* ignore */
  }
}

export function rememberLastWord(word: LastWord) {
  if (!word.seq || !word.jeju) return;
  try {
    localStorage.setItem(LAST_WORD_KEY, JSON.stringify(word));
  } catch {
    /* ignore */
  }
}

export function readLastWord(): LastWord | null {
  try {
    const raw = localStorage.getItem(LAST_WORD_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastWord;
    if (!parsed?.jeju) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function githubIssueUrl(title: string, body: string): string {
  const params = new URLSearchParams({ title, body });
  return `${GITHUB_ISSUE}?${params.toString()}`;
}

export function lastErrorIssueUrl(error: LastError): string {
  const when = new Date(error.at).toISOString();
  const extra = Object.entries(error.context)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
  return githubIssueUrl("[버그] 앱 오류", [`시간: ${when}`, `메시지: ${error.message}`, extra].filter(Boolean).join("\n"));
}
