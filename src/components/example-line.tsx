import type { Example } from "@/lib/units";

export function ExampleLine({ example }: { example: Example }) {
  return (
    <p className="text-xs leading-5 text-muted-foreground">
      <span className="text-foreground">{example.jeju}</span>
      <span className="mx-1.5">·</span>
      {example.standard}
    </p>
  );
}