import Link from "next/link";
import FeedClient from "@/components/FeedClient";
import { supabase } from "@/lib/supabase/client";
import type { Decision } from "@/lib/types";

async function getDecisions(): Promise<Decision[]> {
  const { data, error } = await supabase
    .from("decisions")
    .select("id, created_at, title, details, option_a, option_b, category, expires_at, vote_count_a, vote_count_b")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Decision[];
}

export default async function HomePage() {
  const decisions = await getDecisions();

  return (
    <div className="space-y-8">
      <section className="panel relative overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="relative">
          <p className="mb-3 inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
            Live public polling
          </p>
          <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl">
            Make better choices with
            <span className="gradient-text"> real-time community votes</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
            Post a decision, set a timer, and get a clear majority outcome. No signup. No friction. Just transparent voting.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href="/create" className="rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2.5 text-sm font-bold text-slate-950 transition hover:brightness-110">
              Create decision
            </Link>
            <p className="text-xs text-slate-400 sm:text-sm">{decisions.length} latest decisions loaded</p>
          </div>
        </div>
      </section>

      <FeedClient decisions={decisions} />
    </div>
  );
}