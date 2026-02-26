import Link from "next/link";
import Countdown from "@/components/Countdown";
import type { Decision } from "@/lib/types";
import { isExpired } from "@/lib/utils/time";

type Props = {
  decision: Decision;
};

export default function DecisionCard({ decision }: Props) {
  const totalVotes = decision.vote_count_a + decision.vote_count_b;
  const pctA = totalVotes === 0 ? 0 : Math.round((decision.vote_count_a / totalVotes) * 100);
  const pctB = totalVotes === 0 ? 0 : 100 - pctA;
  const ended = isExpired(decision.expires_at);

  return (
    <article className="group panel p-5 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-300/35">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-white">{decision.title}</h3>
        {ended ? (
          <span className="rounded-full border border-white/20 bg-slate-800/70 px-3 py-1 text-xs font-semibold text-slate-300">Ended</span>
        ) : (
          <span className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-200">Active</span>
        )}
      </div>
      <p className="mt-2 text-sm text-slate-300">{decision.category}</p>
      <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-400" style={{ width: `${pctA}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{decision.option_a}: {pctA}%</span>
        <span>{decision.option_b}: {pctB}%</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-300">{totalVotes} votes</span>
        <Countdown expiresAt={decision.expires_at} />
      </div>
      <Link
        href={`/d/${decision.id}`}
        className="mt-4 inline-flex rounded-xl border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
      >
        View decision
      </Link>
    </article>
  );
}