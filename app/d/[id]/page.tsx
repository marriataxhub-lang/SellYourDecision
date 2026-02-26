import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Countdown from "@/components/Countdown";
import VotePanel from "@/components/VotePanel";
import LeftNav from "@/components/LeftNav";
import RightSidebar from "@/components/RightSidebar";
import ResultBar from "@/components/ResultBar";
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

async function getSidebarData() {
  const { data } = await supabase
    .from("decisions")
    .select("id, title, category, created_at, expires_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = data ?? [];
  const now = Date.now();
  const cutoff = now - 24 * 60 * 60 * 1000;

  const trendMap = rows.reduce<Record<string, number>>((acc, item) => {
    if (new Date(item.created_at).getTime() >= cutoff) {
      acc[item.category] = (acc[item.category] ?? 0) + 1;
    }
    return acc;
  }, {});

  const trending = Object.entries(trendMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentEnded = rows
    .filter((item) => isExpired(item.expires_at))
    .sort((a, b) => new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime())
    .slice(0, 5)
    .map((item) => ({ id: item.id, title: item.title }));

  return { trending, recentEnded };
}

export default async function DecisionPage({ params }: Props) {
  const decision = await getDecision(params.id);
  const sidebarData = await getSidebarData();

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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
      <aside className="hidden lg:block">
        <LeftNav />
      </aside>

      <section className="space-y-3">
        <article className="panel p-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-semibold text-slate-900">{decision.title}</h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{decision.category}</span>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{decision.details}</p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            {ended ? <span className="text-sm font-medium text-slate-600">Voting ended</span> : <Countdown expiresAt={decision.expires_at} />}
            <span className="text-sm text-slate-600">{totalVotes} total votes</span>
          </div>
        </article>

        <section id="vote" className="panel space-y-3 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Vote</h2>
          <VotePanel
            decisionId={decision.id}
            optionA={decision.option_a}
            optionB={decision.option_b}
            hasVotedByCookie={hasVotedByCookie}
            isExpired={ended}
          />
        </section>

        <section id="results" className="panel space-y-3 p-4">
          <h2 className="text-sm font-semibold text-slate-900">Live results</h2>
          <ResultBar label={`A: ${decision.option_a}`} value={decision.vote_count_a} percentage={pctA} tone="a" />
          <ResultBar label={`B: ${decision.option_b}`} value={decision.vote_count_b} percentage={pctB} tone="b" />
          {ended && winner && (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">Winner: {winner}</p>
          )}
        </section>

        <section id="comments" className="panel p-4">
          <h2 className="text-sm font-semibold text-slate-900">Comments</h2>
          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <textarea
              disabled
              rows={3}
              placeholder="Comments coming soon"
              className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-500 disabled:cursor-not-allowed"
            />
            <button disabled className="mt-2 rounded-full bg-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600">
              Post comment
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-500">Comments coming soon.</p>
        </section>
      </section>

      <aside>
        <RightSidebar trending={sidebarData.trending} recentEnded={sidebarData.recentEnded} />
      </aside>
    </div>
  );
}
