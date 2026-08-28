import Link from "next/link";
import { JourneyNavigator } from "@/components/JourneyNavigator";
import { PHASES, getTotalModules, LEARNING_LOOP } from "@/lib/curriculum";
import { TOTAL_WEEKS, TOTAL_HOURS, HOURS_PER_DAY } from "@/lib/schedule";

export default function CurriculumPage() {
  const totalModules = getTotalModules();

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Curriculum</h1>
        <p className="mt-1 text-muted">
          {TOTAL_WEEKS} weeks · {HOURS_PER_DAY} hrs/day · ~{TOTAL_HOURS} study hours ·{" "}
          {totalModules} modules across 8 phases
        </p>
      </header>

      <section className="mb-10 rounded-xl border border-border bg-surface p-6">
        <h2 className="text-sm font-medium">One Engineering Curriculum — Not Exam Silos</h2>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Packets → protocols → switching → routing → services → security → enterprise design →
          automation → cloud → Azure networking → L3 troubleshooting. Certifications (CCNA,
          Security+, NSE 4, AZ-104, AZ-700) sit on top of this foundation.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {LEARNING_LOOP.map((s) => (
            <span key={s.step} className="rounded-md bg-accent/10 px-2 py-1 text-xs text-accent">
              {s.label}
            </span>
          ))}
        </div>
      </section>

      <div className="mb-10">
        <JourneyNavigator />
      </div>

      <div className="space-y-4">
        {PHASES.map((phase) => (
          <Link
            key={phase.id}
            href={`/curriculum/${phase.id}`}
            className="block rounded-xl border border-border bg-surface p-6 transition hover:border-accent/40"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="font-mono text-xs text-accent">Phase {phase.number}</span>
                <h2 className="mt-1 text-lg font-medium">{phase.title}</h2>
                <p className="mt-1 text-sm text-muted">{phase.weeks}</p>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                {phase.modules.length} module{phase.modules.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="mt-3 text-sm text-muted">{phase.objective}</p>
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
    </div>
  );
}
