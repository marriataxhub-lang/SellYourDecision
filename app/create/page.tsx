"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { FORBIDDEN_MESSAGE, hasForbiddenContent } from "@/lib/utils/moderation";

const categories = ["Career", "Relationships", "Lifestyle", "Money (safe)", "Other"] as const;

type CreateResponse = {
  ok: boolean;
  id?: string;
  message?: string;
};

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);

    const title = String(formData.get("title") ?? "").trim();
    const details = String(formData.get("details") ?? "").trim();
    const optionA = String(formData.get("optionA") ?? "").trim();
    const optionB = String(formData.get("optionB") ?? "").trim();
    const durationHours = Number(formData.get("duration") ?? "24");
    const category = String(formData.get("category") ?? "Other");
    const promise = formData.get("promise");

    if (!title || !details || !optionA || !optionB) {
      setError("Please complete all required fields.");
      return;
    }

    if (!promise) {
      setError("You must confirm the majority promise before publishing.");
      return;
    }

    if (hasForbiddenContent(`${title} ${details}`)) {
      setError(FORBIDDEN_MESSAGE);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, details, optionA, optionB, durationHours, category })
      });

      const data = (await response.json()) as CreateResponse;

      if (!response.ok || !data.ok || !data.id) {
        throw new Error(data.message || "Could not create decision.");
      }

      router.push(`/d/${data.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create decision.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel mx-auto max-w-3xl overflow-hidden p-6 sm:p-8">
      <h1 className="text-3xl font-black text-white">Create a decision</h1>
      <p className="mt-2 text-sm text-slate-300">Add clear context so voters can pick a confident majority outcome.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-200">Title *</label>
          <input name="title" maxLength={90} required className="field" />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-200">Details / Context *</label>
          <textarea name="details" maxLength={800} required rows={5} className="field" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-200">Option A *</label>
            <input name="optionA" maxLength={40} required className="field" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-200">Option B *</label>
            <input name="optionB" maxLength={40} required className="field" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-200">Duration *</label>
            <select name="duration" className="field">
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="72">72 hours</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-200">Category *</label>
            <select name="category" className="field">
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
          <input type="checkbox" name="promise" className="mt-1" />
          I promise to follow the majority result.
        </label>

        {error && <p className="text-sm text-rose-300">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 px-5 py-2.5 text-sm font-black text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish decision"}
        </button>
      </form>
    </section>
  );
}