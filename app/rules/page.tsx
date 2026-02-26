export default function RulesPage() {
  return (
    <section className="mx-auto max-w-3xl space-y-3">
      <div className="panel p-5">
        <h1 className="text-xl font-semibold text-slate-900">Platform rules</h1>
        <p className="mt-2 text-sm text-slate-600">Keep decisions safe, respectful, and appropriate for public voting.</p>
      </div>

      <div className="panel p-5">
        <ul className="space-y-2 text-sm leading-6 text-slate-700">
          <li>Allowed: everyday choices about work, relationships, lifestyle, and safe money topics.</li>
          <li>Not allowed: self-harm, suicide, violence, criminal planning, threats, or illegal activities.</li>
          <li>Spam, abuse, or harassment may be removed to protect participants.</li>
        </ul>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Disclaimer: Community votes are opinions, not medical, legal, financial, or mental health advice.
      </div>
    </section>
  );
}
