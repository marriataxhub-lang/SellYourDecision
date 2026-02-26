import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Countdown from "@/components/Countdown";
import VotePanel from "@/components/VotePanel";
import { supabase } from "@/lib/supabase/client";
import type { Decision } from "@/lib/types";
import { isExpired } from "@/lib/utils/time";

type Props = {
  params: {
    id: string;
  };
};

async function getDecision(id: string): Promise<Decision | null> {
  const { data, error } = await supabase
    .from("decisions")
    .select("id, created_at, title, details, option_a, option_b, category, expires_at, vote_count_a, vote_count_b")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data as Decision;
}

export default async function DecisionPage({ params }: Props) {
  const decision = await getDecision(params.id);

  if (!decision) {
    notFound();
  }

  const ended = isExpired(decision.expires_at);
  const cookieStore = cookies();
  const voteCookie = cookieStore.get(`voted_${decision.id}`)?.value;
  const hasVotedByCookie = voteCookie === "A" || voteCookie === "B";

  const totalVotes = decision.vote_count_a + decision.vote_count_b;
  const pctA = totalVotes === 0 ? 0 : Math.round((decision.vote_count_a / totalVotes) * 100);
  const pctB = totalVotes === 0 ? 0 : 100 - pctA;
  const winner = !ended
    ? null
    : decision.vote_count_a === decision.vote_count_b
      ? "Tie"
      : decision.vote_count_a > decision.vote_count_b
        ? `A (${decision.option_a})`
        : `B (${decision.option_b})`;

  return (
    <section className="panel space-y-6 p-6 sm:p-8">
      <div>
        <h1 className="text-3xl font-black text-white">{decision.title}</h1>
        <p className="mt-2 inline-flex rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-300">{decision.category}</p>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-200">{decision.details}</p>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
        {ended ? <span className="text-sm font-semibold text-slate-300">Voting ended</span> : <Countdown expiresAt={decision.expires_at} />}
        <span className="text-sm text-slate-300">{totalVotes} total votes</span>
      </div>

      <VotePanel
        decisionId={decision.id}
        optionA={decision.option_a}
        optionB={decision.option_b}
        hasVotedByCookie={hasVotedByCookie}
        isExpired={ended}
      />

      <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-lg font-bold text-white">Results</h2>
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm text-slate-200">
              <span>A: {decision.option_a}</span>
              <span>{decision.vote_count_a} ({pctA}%)</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-400" style={{ width: `${pctA}%` }} />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between text-sm text-slate-200">
              <span>B: {decision.option_b}</span>
              <span>{decision.vote_count_b} ({pctB}%)</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-lime-300" style={{ width: `${pctB}%` }} />
            </div>
          </div>
        </div>

        {ended && winner && (
          <p className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-200">Final result: {winner}</p>
        )}
      </div>
    </section>
  );
}