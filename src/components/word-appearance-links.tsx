import { Link } from "@tanstack/react-router";
import { appearancesForSeq } from "@/lib/life-dialect";

/**
 * 단어 카드 하단에 "이 말이 나오는 생활방언" 후보를 보여준다(P2-2).
 * wordLinks는 문자열 일치 후보(candidate)일 뿐 사람이 승인한 게 아니므로
 * 절대 정답처럼 보이면 안 된다 — 항상 "자동 후보 · 검수 전"이라고 밝힌다.
 */
export function WordAppearanceLinks({ seq, limit = 3 }: { seq: string; limit?: number }) {
  const appearances = appearancesForSeq(seq, limit);
  if (appearances.length === 0) return null;
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
      <span className="text-[11px] text-muted-foreground">자동 후보·검수 전:</span>
      {appearances.map((appearance, i) => (
        <Link
          key={`${appearance.passageId}-${appearance.sentenceIndex}`}
          to="/life-dialect/$id"
          params={{ id: appearance.passageId }}
          className="text-[11px] text-primary underline decoration-dotted underline-offset-2"
        >
          {appearance.passageTitle}
          {i < appearances.length - 1 ? "," : ""}
        </Link>
      ))}
    </div>
  );
}
