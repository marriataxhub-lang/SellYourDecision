import Link from "next/link";
import type { Decision } from "@/lib/types";
import { getTimeRemainingLabel, isExpired } from "@/lib/utils/time";
import ResultBar from "@/components/ResultBar";

type Props = {
  decision: Decision;
  view: "card" | "compact";
};

export default function PostCard({ decision, view }: Props) {
  const totalVotes = decision.vote_count_a + decision.vote_count_b;
  const pctA = totalVotes > 0 ? Math.round((decision.vote_count_a / totalVotes) * 100) : 0;
  const pctB = totalVotes > 0 ? 100 - pctA : 0;
  const ended = isExpired(decision.expires_at);

  if (view === "compact") {
    return (
      <article className="panel p-3 transition hover:border-slate-300">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={`/d/${decision.id}`} className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-orange-600">
              {decision.title}
            </Link>
            <p className="mt-1 text-xs text-slate-500">{decision.category} | {totalVotes} votes</p>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ended ? "bg-slate-100 text-slate-600" : "bg-emerald-100 text-emerald-700"}`}>
            {ended ? "Ended" : "Active"}
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="panel p-4 transition hover:border-slate-300">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/d/${decision.id}`} className="line-clamp-2 text-lg font-semibold leading-6 text-slate-900 hover:text-orange-600">
          {decision.title}
        </Link>
        <span className="whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{decision.category}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>{ended ? "Voting ended" : getTimeRemainingLabel(decision.expires_at)}</span>
        <span>|</span>
        <span>{totalVotes} total votes</span>
      </div>

      <p className="fade-preview mt-3 line-clamp-2 text-sm text-slate-600">{decision.details}</p>

      <div className="mt-3 space-y-2">
        <ResultBar label={`A: ${decision.option_a}`} value={decision.vote_count_a} percentage={pctA} tone="a" />
        <ResultBar label={`B: ${decision.option_b}`} value={decision.vote_count_b} percentage={pctB} tone="b" />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={`/d/${decision.id}#vote`} className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600">
          Vote
        </Link>
        <Link href={`/d/${decision.id}#results`} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          View results
        </Link>
        <Link href={`/d/${decision.id}#comments`} className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
          Comments
        </Link>
      </div>
    </article>
  );
}
