import Link from "next/link";
import LeftNav from "@/components/LeftNav";
import RightSidebar from "@/components/RightSidebar";
import FeedSort from "@/components/FeedSort";
import PostCard from "@/components/PostCard";
import { supabase } from "@/lib/supabase/client";
import type { Decision } from "@/lib/types";
import { isExpired } from "@/lib/utils/time";

async function getDecisions(): Promise<Decision[]> {
  const { data, error } = await supabase
    .from("decisions")
    .select("id, created_at, title, details, option_a, option_b, category, expires_at, vote_count_a, vote_count_b")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Decision[];
}

type SearchParams = {
  sort?: string;
  topWindow?: string;
  status?: string;
  view?: string;
  q?: string;
  category?: string;
  page?: string;
};

const PAGE_SIZE = 20;

function getTopCutoff(window: "24h" | "7d" | "30d" | "all"): number {
  if (window === "all") return 0;
  const now = Date.now();
  const hours = window === "24h" ? 24 : window === "7d" ? 24 * 7 : 24 * 30;
  return now - hours * 60 * 60 * 1000;
}

export default async function HomePage({ searchParams }: { searchParams: SearchParams }) {
  const decisions = await getDecisions();
  const sort = searchParams.sort === "new" || searchParams.sort === "top" ? searchParams.sort : "hot";
  const topWindow =
    searchParams.topWindow === "7d" || searchParams.topWindow === "30d" || searchParams.topWindow === "all" ? searchParams.topWindow : "24h";
  const status = searchParams.status === "active" || searchParams.status === "ended" ? searchParams.status : "all";
  const view = searchParams.view === "compact" ? "compact" : "card";
  const query = (searchParams.q ?? "").trim().toLowerCase();
  const category = (searchParams.category ?? "").trim();
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const now = Date.now();

  const filtered = decisions.filter((decision) => {
    const expired = isExpired(decision.expires_at);
    const matchStatus = status === "all" || (status === "active" ? !expired : expired);
    const haystack = `${decision.title} ${decision.details}`.toLowerCase();
    const matchSearch = !query || haystack.includes(query);
    const matchCategory = !category || decision.category === category;
    return matchStatus && matchSearch && matchCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVotes = a.vote_count_a + a.vote_count_b;
    const bVotes = b.vote_count_a + b.vote_count_b;

    if (sort === "new") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();

    if (sort === "top") {
      const cutoff = getTopCutoff(topWindow);
      const aInWindow = new Date(a.created_at).getTime() >= cutoff;
      const bInWindow = new Date(b.created_at).getTime() >= cutoff;
      if (aInWindow !== bInWindow) return aInWindow ? -1 : 1;
      if (bVotes !== aVotes) return bVotes - aVotes;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }

    const ageA = Math.max((now - new Date(a.created_at).getTime()) / (1000 * 60 * 60), 0);
    const ageB = Math.max((now - new Date(b.created_at).getTime()) / (1000 * 60 * 60), 0);
    const scoreA = aVotes / Math.pow(ageA + 2, 1.5);
    const scoreB = bVotes / Math.pow(ageB + 2, 1.5);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const start = (page - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(start, start + PAGE_SIZE);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));

  const recent24hCutoff = now - 24 * 60 * 60 * 1000;
  const trendingMap = decisions.reduce<Record<string, number>>((acc, decision) => {
    if (new Date(decision.created_at).getTime() >= recent24hCutoff) {
      acc[decision.category] = (acc[decision.category] ?? 0) + 1;
    }
    return acc;
  }, {});
  const trending = Object.entries(trendingMap)
    .map(([cat, count]) => ({ category: cat, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const recentEnded = decisions
    .filter((item) => isExpired(item.expires_at))
    .sort((a, b) => new Date(b.expires_at).getTime() - new Date(a.expires_at).getTime())
    .slice(0, 5)
    .map((item) => ({ id: item.id, title: item.title }));

  const buildPageHref = (nextPage: number) => {
    const next = new URLSearchParams();
    if (sort !== "hot") next.set("sort", sort);
    if (topWindow !== "24h") next.set("topWindow", topWindow);
    if (status !== "all") next.set("status", status);
    if (view !== "card") next.set("view", view);
    if (query) next.set("q", query);
    if (category) next.set("category", category);
    if (nextPage > 1) next.set("page", String(nextPage));
    const qs = next.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
      <aside className="hidden lg:block">
        <LeftNav />
      </aside>

      <section className="space-y-3">
        <header className="panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-lg font-semibold text-slate-900">Decision Feed</h1>
            <Link href="/create" className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600">
              Create decision
            </Link>
          </div>
          <p className="mt-2 text-sm text-slate-600">{sorted.length} decisions found</p>
        </header>

        <FeedSort sort={sort} topWindow={topWindow} status={status} view={view} />

        {pageItems.length === 0 ? (
          <div className="panel p-8 text-center text-sm text-slate-600">
            {status === "active" ? "No active posts right now." : status === "ended" ? "No ended posts yet." : "No results for your filters."}
          </div>
        ) : (
          <div className="space-y-3">
            {pageItems.map((decision) => (
              <PostCard key={decision.id} decision={decision} view={view} />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Link
            href={buildPageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`rounded-full border px-3 py-1.5 text-sm ${page <= 1 ? "pointer-events-none border-slate-200 text-slate-400" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}
          >
            Previous
          </Link>
          <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
          <Link
            href={buildPageHref(Math.min(totalPages, page + 1))}
            aria-disabled={page >= totalPages}
            className={`rounded-full border px-3 py-1.5 text-sm ${
              page >= totalPages ? "pointer-events-none border-slate-200 text-slate-400" : "border-slate-300 text-slate-700 hover:bg-slate-50"
            }`}
          >
            Next
          </Link>
        </div>
      </section>

      <aside className="space-y-3">
        <RightSidebar trending={trending} recentEnded={recentEnded} />
      </aside>
    </div>
  );
}
