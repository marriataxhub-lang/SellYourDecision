"use client";

import { useMemo, useState } from "react";
import DecisionCard from "@/components/DecisionCard";
import type { Decision } from "@/lib/types";
import { isExpired } from "@/lib/utils/time";

type Props = {
  decisions: Decision[];
};

export default function FeedClient({ decisions }: Props) {
  const [tab, setTab] = useState<"active" | "ended">("active");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return decisions.filter((d) => {
      const ended = isExpired(d.expires_at);
      const matchTab = tab === "active" ? !ended : ended;
      const matchSearch = normalized.length === 0 || d.title.toLowerCase().includes(normalized);
      return matchTab && matchSearch;
    });
  }, [decisions, search, tab]);

  return (
    <section className="space-y-5">
      <div className="panel flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-white/15 bg-slate-900/60 p-1">
          <button
            onClick={() => setTab("active")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "active" ? "bg-cyan-400 text-slate-950" : "text-slate-300 hover:bg-white/10"}`}
          >
            Active
          </button>
          <button
            onClick={() => setTab("ended")}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === "ended" ? "bg-cyan-400 text-slate-950" : "text-slate-300 hover:bg-white/10"}`}
          >
            Ended
          </button>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title"
          className="field w-full sm:w-80"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="panel border-dashed p-10 text-center text-sm text-slate-300">No decisions found for this view.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((decision) => (
            <DecisionCard key={decision.id} decision={decision} />
          ))}
        </div>
      )}
    </section>
  );
}