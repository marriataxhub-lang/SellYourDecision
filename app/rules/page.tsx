export default function RulesPage() {
  return (
    <section className="panel mx-auto max-w-3xl space-y-6 p-6 sm:p-8">
      <h1 className="text-3xl font-black text-white">Platform rules</h1>

      <div className="space-y-3 text-sm leading-6 text-slate-200">
        <p>Allowed: everyday decisions about work, relationships, lifestyle, and safe money choices.</p>
        <p>Not allowed: self-harm, suicide, violence, criminal planning, threats, or illegal activities.</p>
        <p>Content may be removed if it violates safety expectations.</p>
      </div>

      <div className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm text-amber-100">
        Disclaimer: This platform is for general community opinion only and is not medical, legal, financial, or mental health advice.
      </div>
    </section>
  );
}