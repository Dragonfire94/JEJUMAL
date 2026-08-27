import { isLiveHost } from "@/lib/live";

export type TrackEvent =
  | "unit_start"
  | "unit_pass"
  | "unit_fail"
  | "retry_start"
  | "notebook_add"
  | "review_done"
  | "rank_open";

export type TrackProps = Record<string, string | number | boolean | undefined>;

export function track(event: TrackEvent, props: TrackProps = {}) {
  console.info("[jeju-mal:track]", event, props);
  if (!isLiveHost()) return;
  emitAnalytics(event, props);
}

function emitAnalytics(_event: TrackEvent, _props: TrackProps) {
  // Fill LIVE_HOSTS and VITE_POSTHOG_KEY, then load posthog-js here.
  // Init with autocapture: false, disable_session_recording: true, anonymous id only.
}
