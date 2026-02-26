"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  decisionId: string;
  optionA: string;
  optionB: string;
  hasVotedByCookie: boolean;
  isExpired: boolean;
};

type VoteApiResponse = {
  ok: boolean;
  message: string;
};

export default function VotePanel({ decisionId, optionA, optionB, hasVotedByCookie, isExpired }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(hasVotedByCookie ? "You already voted on this browser." : null);

  const submitVote = async (choice: "A" | "B") => {
    if (hasVotedByCookie || isExpired) return;

    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      const response = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          decisionId,
          choice
        })
      });

      const data = (await response.json()) as VoteApiResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Could not submit vote.");
      }

      setInfo("Thanks for voting. Live results are shown below.");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not submit vote.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (isExpired) {
    return <p className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-300">Voting ended. Final result is shown below.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          disabled={loading || hasVotedByCookie}
          onClick={() => submitVote("A")}
          className="rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-3 text-left text-sm font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="block text-xs uppercase tracking-wide text-cyan-300">Vote A</span>
          <span className="block text-sm">{optionA}</span>
        </button>
        <button
          disabled={loading || hasVotedByCookie}
          onClick={() => submitVote("B")}
          className="rounded-xl border border-emerald-300/25 bg-emerald-300/10 px-4 py-3 text-left text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="block text-xs uppercase tracking-wide text-emerald-300">Vote B</span>
          <span className="block text-sm">{optionB}</span>
        </button>
      </div>
      {error && <p className="text-sm text-rose-300">{error}</p>}
      {info && <p className="text-sm text-emerald-300">{info}</p>}
    </div>
  );
}