import Link from "next/link";

type TrendingItem = {
  category: string;
  count: number;
};

type EndedItem = {
  id: string;
  title: string;
};

type Props = {
  trending?: TrendingItem[];
  recentEnded?: EndedItem[];
};

export default function RightSidebar({ trending = [], recentEnded = [] }: Props) {
  return (
    <aside className="sticky top-[72px] space-y-3">
      <section className="panel p-4">
        <h3 className="text-sm font-semibold text-slate-900">About this experiment</h3>
        <p className="mt-2 text-sm text-slate-600">Ask a real choice, collect anonymous votes, and follow majority outcomes after expiry.</p>
      </section>

      <section className="panel p-4">
        <h3 className="text-sm font-semibold text-slate-900">Rules / Safety</h3>
        <p className="mt-2 text-sm text-slate-600">No self-harm, illegal planning, threats, or abuse. Use the platform for safe daily decisions.</p>
        <Link href="/rules" className="mt-3 inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700">Read full rules</Link>
      </section>

      <section className="panel p-4">
        <h3 className="text-sm font-semibold text-slate-900">How voting works</h3>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          <li>One vote per decision per browser fingerprint.</li>
          <li>Results update live after each vote.</li>
          <li>Expired decisions lock automatically.</li>
        </ul>
      </section>

      <section className="panel p-4">
        <h3 className="text-sm font-semibold text-slate-900">Trending categories (24h)</h3>
        {trending.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No category trends yet.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {trending.map((item) => (
              <li key={item.category} className="flex items-center justify-between">
                <span>{item.category}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{item.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel p-4">
        <h3 className="text-sm font-semibold text-slate-900">Recent ended decisions</h3>
        {recentEnded.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No ended decisions yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {recentEnded.map((item) => (
              <li key={item.id}>
                <Link href={`/d/${item.id}`} className="line-clamp-2 text-slate-700 hover:text-orange-600">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  );
}
