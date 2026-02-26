"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type SortMode = "hot" | "new" | "top";
type TimeWindow = "24h" | "7d" | "30d" | "all";
type StatusFilter = "all" | "active" | "ended";
type ViewMode = "card" | "compact";

type Props = {
  sort: SortMode;
  topWindow: TimeWindow;
  status: StatusFilter;
  view: ViewMode;
};

export default function FeedSort({ sort, topWindow, status, view }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    if (key !== "q") next.set("page", "1");
    router.replace(`${pathname}?${next.toString()}`);
  };

  const tabs = useMemo(
    () => [
      { key: "hot", label: "Hot" },
      { key: "new", label: "New" },
      { key: "top", label: "Top" }
    ] satisfies { key: SortMode; label: string }[],
    []
  );

  return (
    <section className="panel flex flex-col gap-3 p-3 sm:p-4">
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setParam("sort", tab.key)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              sort === tab.key ? "bg-orange-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <select
          value={topWindow}
          onChange={(e) => setParam("topWindow", e.target.value)}
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-orange-500"
          aria-label="Top time window"
        >
          <option value="24h">Top 24h</option>
          <option value="7d">Top 7d</option>
          <option value="30d">Top 30d</option>
          <option value="all">Top All</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          onChange={(e) => setParam("status", e.target.value)}
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-orange-500"
          aria-label="Status filter"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
        </select>
        <div className="ml-auto inline-flex rounded-full border border-slate-300 bg-white p-0.5">
          <button
            onClick={() => setParam("view", "card")}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${view === "card" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            Card
          </button>
          <button
            onClick={() => setParam("view", "compact")}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              view === "compact" ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Compact
          </button>
        </div>
      </div>
    </section>
  );
}
