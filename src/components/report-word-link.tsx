import { contentReportUrl } from "@/lib/report";

export function ReportWordLink({
  seq,
  jeju,
  standard,
  unitId,
}: {
  seq: string;
  jeju: string;
  standard: string;
  unitId?: string;
}) {
  return (
    <a
      href={contentReportUrl({ seq, jeju, standard, unitId })}
      target="_blank"
      rel="noreferrer"
      className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      이 말 이상해요
    </a>
  );
}
