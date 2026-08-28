import { CERTIFICATION_GATES, PHASES } from "@/lib/curriculum";

export default function GatesPage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Certification Gates</h1>
        <p className="mt-1 text-muted">
          Pass competency gates before exam prep — we manufacture a network engineer who
          happens to hold certifications
        </p>
      </header>

      <div className="space-y-6">
        {CERTIFICATION_GATES.map((gate) => (
          <article
            key={gate.id}
            className="rounded-xl border border-border bg-surface p-6"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 font-mono text-lg font-semibold text-accent">
                {gate.order}
              </span>
              <div>
                <h2 className="text-xl font-medium">{gate.name}</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted">Prerequisites</h3>
                <ul className="mt-2 space-y-1">
                  {gate.prerequisites.map((p) => (
                    <li key={p} className="text-sm text-muted">· {p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-success">
                  Required Competencies
                </h3>
                <ul className="mt-2 space-y-1">
                  {gate.competencies.map((c) => (
                    <li key={c} className="text-sm">✓ {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-12 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-medium">L3 Competency Model</h2>
        <div className="mt-4 space-y-3 font-mono text-sm">
          <p><span className="text-muted">L1:</span> What is a router?</p>
          <p><span className="text-muted">L2:</span> Configure a router.</p>
          <p><span className="text-muted">L3:</span> Troubleshoot why the router isn&apos;t forwarding.</p>
          <p><span className="text-muted">L3+:</span> Control-plane vs data-plane vs policy vs physical.</p>
          <p><span className="text-muted">L3 Design:</span> Design so failure cannot happen or auto-recovers.</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-medium text-muted">Phase → Certification Map</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {PHASES.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-border/50 px-4 py-3 text-sm"
            >
              <span className="text-accent">P{p.number}</span> {p.title}
              <span className="text-muted"> — {p.weeks}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
