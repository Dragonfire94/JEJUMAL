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
}
