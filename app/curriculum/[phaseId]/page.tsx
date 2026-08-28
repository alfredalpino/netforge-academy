import Link from "next/link";
import { notFound } from "next/navigation";
import { getPhase, PHASES } from "@/lib/curriculum";
import { ModuleCard } from "@/components/ModuleCard";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export function generateStaticParams() {
  return PHASES.map((phase) => ({ phaseId: phase.id }));
}

export default async function PhasePage({
  params,
}: {
  params: Promise<{ phaseId: string }>;
}) {
  const { phaseId } = await params;
  const phase = getPhase(phaseId);
  if (!phase) notFound();

  return (
    <PageShell>
      <Breadcrumb href="/curriculum" label="Curriculum" />

      <header className="mt-4 mb-8 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="font-mono text-xs text-accent">Phase {phase.number}</span>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{phase.title}</h1>
            <p className="mt-2 text-sm text-muted">{phase.weeks}</p>
          </div>
          <Badge tone="accent">{phase.modules.length} modules</Badge>
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{phase.objective}</p>
      </header>

      <div className="space-y-6">
        {phase.modules.map((mod, index) => (
          <ModuleCard key={mod.id} module={mod} index={index + 1} />
        ))}
      </div>

      <Card className="mt-10 border-border/60 bg-surface/50">
        <p className="text-sm text-muted">
          Mark modules complete when you meet all exit criteria. Toggle again to undo.
        </p>
        <Link href="/today" className="mt-3 inline-block text-sm text-accent hover:underline">
          Go to today&apos;s plan →
        </Link>
      </Card>
    </PageShell>
  );
}
