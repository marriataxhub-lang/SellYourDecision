"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Toast from "@/components/Toast";

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
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<"success" | "error">("success");

  const submitVote = async (choice: "A" | "B") => {
    if (hasVotedByCookie || isExpired) return;

    setLoading(true);
    setError(null);

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

      setToastTone("success");
      setToast("Vote recorded.");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not submit vote.";
      setError(message);
      setToastTone("error");
      setToast(message);
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
          className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-left text-sm font-semibold text-orange-700 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="block text-xs uppercase tracking-wide text-orange-500">Vote A</span>
          <span className="block text-sm text-slate-900">{optionA}</span>
        </button>
        <button
          disabled={loading || hasVotedByCookie}
          onClick={() => submitVote("B")}
          className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-left text-sm font-semibold text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="block text-xs uppercase tracking-wide text-sky-500">Vote B</span>
          <span className="block text-sm text-slate-900">{optionB}</span>
        </button>
      </div>
      {hasVotedByCookie && <p className="text-sm text-slate-500">You already voted on this browser.</p>}
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <Toast message={toast} tone={toastTone} onClose={() => setToast(null)} />
    </div>
  );
}
