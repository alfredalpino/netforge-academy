"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { getGateProgress } from "@/lib/gates";
import { PHASES } from "@/lib/curriculum";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { PageSkeleton } from "@/components/ui/Skeleton";

export default function GatesPage() {
  const { progress, loaded } = useProgress();

  if (!loaded) return <PageSkeleton />;

  const gateProgress = getGateProgress(progress);
  const readyCount = gateProgress.filter((g) => g.ready).length;

  return (
    <PageShell testId="gates-page">
      <PageHeader
        eyebrow="Certification Path"
        title="Certification Gates"
        description="Pass competency gates before exam prep — readiness is tracked from modules, drills, and labs."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={readyCount > 0 ? "success" : "default"}>
              {readyCount}/{gateProgress.length} ready
            </Badge>
            <Link href="/today">
              <Button variant="secondary" size="sm">
                Continue today
              </Button>
            </Link>
          </div>
        }
      />

      <div className="space-y-6">
        {gateProgress.map(({ gate, criteria, percent, ready }) => (
          <Card key={gate.id} className={ready ? "border-success/30" : undefined}>
            <div className="flex flex-wrap items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 font-mono text-lg font-semibold text-accent">
                {gate.order}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-medium">{gate.name}</h2>
                  <Badge tone={ready ? "success" : "default"}>
                    {ready ? "Ready for exam prep" : `${percent}% ready`}
                  </Badge>
                </div>
                <div className="mt-4 max-w-lg">
                  <ProgressBar value={percent} label="Gate readiness" />
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-muted">Prerequisites</h3>
                <ul className="mt-3 space-y-3">
                  {criteria.map((c) => (
                    <li key={c.id} className="text-sm">
                      <span className={c.met ? "text-success" : "text-foreground/80"}>
                        {c.met ? "✓" : "○"} {c.label}
                      </span>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">{c.detail}</p>
                      {!c.met && c.cta && (
                        <Link href={c.cta.href} className="mt-2 inline-block">
                          <Button variant="secondary" className="text-xs">
                            {c.cta.label}
                          </Button>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs uppercase tracking-widest text-success">
                  Required Competencies
                </h3>
                <ul className="mt-3 space-y-1.5">
                  {gate.competencies.map((c) => (
                    <li key={c} className="text-sm text-muted">
                      ✓ {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-10">
        <h2 className="text-sm font-medium">L3 Competency Model</h2>
        <div className="mt-4 space-y-2 font-mono text-sm">
          <p><span className="text-muted">L1:</span> What is a router?</p>
          <p><span className="text-muted">L2:</span> Configure a router.</p>
          <p><span className="text-muted">L3:</span> Troubleshoot why the router isn&apos;t forwarding.</p>
          <p><span className="text-muted">L3+:</span> Control-plane vs data-plane vs policy vs physical.</p>
          <p><span className="text-muted">L3 Design:</span> Design so failure cannot happen or auto-recovers.</p>
        </div>
      </Card>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-medium text-muted">Phase → Certification Map</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {PHASES.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-border/50 bg-surface px-4 py-3 text-sm"
            >
              <span className="text-accent">P{p.number}</span> {p.title}
              <span className="text-muted"> — {p.weeks}</span>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
