import Link from "next/link";
import { JourneyNavigator } from "@/components/JourneyNavigator";
import { PHASES, getTotalModules, LEARNING_LOOP } from "@/lib/curriculum";
import { TOTAL_WEEKS, TOTAL_HOURS, HOURS_PER_DAY } from "@/lib/schedule";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function CurriculumPage() {
  const totalModules = getTotalModules();

  return (
    <PageShell>
      <PageHeader
        eyebrow="28-Week Path"
        title="Curriculum"
        description={`${TOTAL_WEEKS} weeks · ${HOURS_PER_DAY} hrs/day · ~${TOTAL_HOURS} study hours · ${totalModules} modules across 8 phases`}
      />

      <Card className="mb-10">
        <h2 className="text-sm font-medium">One Engineering Curriculum — Not Exam Silos</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Packets → protocols → switching → routing → services → security → enterprise design →
          automation → cloud → Azure networking → L3 troubleshooting. Certifications sit on top
          of this foundation.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {LEARNING_LOOP.map((s) => (
            <Badge key={s.step} tone="accent">
              {s.label}
            </Badge>
          ))}
        </div>
      </Card>

      <div className="mb-10">
        <JourneyNavigator />
      </div>

      <div className="space-y-4">
        {PHASES.map((phase) => (
          <Link
            key={phase.id}
            href={`/curriculum/${phase.id}`}
            className="group block rounded-xl border border-border bg-surface p-6 transition hover:border-accent/40 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-accent">Phase {phase.number}</span>
                <h2 className="mt-1 text-lg font-medium transition-colors group-hover:text-accent">
                  {phase.title}
                </h2>
                <p className="mt-1 text-sm text-muted">{phase.weeks}</p>
              </div>
              <Badge>
                {phase.modules.length} module{phase.modules.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{phase.objective}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {phase.modules.map((m) => (
                <li
                  key={m.id}
                  className="rounded-md bg-background px-2 py-1 text-xs text-foreground/80"
                >
                  {m.title}
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
