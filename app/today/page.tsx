"use client";

import Link from "next/link";
import { useProgress, getDayProgressPercent } from "@/lib/progress";
import { getDayPlan, getWeekPlans, dayKey } from "@/lib/daily-plans";
import { DAILY_BLOCKS, WEEKLY_RHYTHM, getWeekPhase, getDayOfWeek } from "@/lib/schedule";

export default function TodayPage() {
  const {
    progress,
    completeDay,
    setCurrentPosition,
    isDayComplete,
    isBlockComplete,
    loaded,
  } = useProgress();

  const plan = getDayPlan(progress.currentWeek, progress.currentDay);
  const weekPlans = getWeekPlans(progress.currentWeek);
  const phase = getWeekPhase(progress.currentWeek);
  const dayName = getDayOfWeek(progress.currentWeek, progress.currentDay);
  const weeklyFocus = WEEKLY_RHYTHM.find((d) => d.day === dayName);
  const dayProgress = getDayProgressPercent(
    progress.currentWeek,
    progress.currentDay,
    progress.completedBlocks
  );

  if (!loaded) return <div className="p-8 text-muted">Loading...</div>;

  return (
    <div className="p-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-widest text-accent">Daily Plan</p>
        <h1 className="mt-1 text-2xl font-semibold">
          Week {progress.currentWeek} · Day {progress.currentDay} — {dayName}
        </h1>
        <p className="mt-1 text-sm text-muted">{phase}</p>
        <div className="mt-4 max-w-md">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Today&apos;s block progress</span>
            <span className="font-mono text-accent">{dayProgress}%</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all duration-500"
              style={{ width: `${dayProgress}%` }}
            />
          </div>
        </div>
      </header>

      {/* Week navigator */}
      <div className="mb-8 flex flex-wrap items-center gap-2">
        <button
          onClick={() =>
            setCurrentPosition(
              progress.currentDay === 1 ? Math.max(1, progress.currentWeek - 1) : progress.currentWeek,
              progress.currentDay === 1 ? 7 : progress.currentDay - 1
            )
          }
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:bg-surface-hover"
        >
          ← Prev
        </button>
        {weekPlans.map((d) => (
          <button
            key={dayKey(d.week, d.day)}
            onClick={() => setCurrentPosition(d.week, d.day)}
            className={`rounded-lg px-3 py-1.5 text-xs ${
              d.day === progress.currentDay
                ? "bg-accent text-white"
                : isDayComplete(d.week, d.day)
                  ? "bg-success/15 text-success"
                  : "border border-border text-muted hover:bg-surface-hover"
            }`}
          >
            D{d.day}
          </button>
        ))}
        <button
          onClick={() =>
            setCurrentPosition(
              progress.currentDay === 7 ? progress.currentWeek + 1 : progress.currentWeek,
              progress.currentDay === 7 ? 1 : progress.currentDay + 1
            )
          }
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted hover:bg-surface-hover"
        >
          Next →
        </button>
      </div>

      {weeklyFocus && (
        <section className="mb-6 rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">{dayName} focus</p>
          <p className="font-medium">{weeklyFocus.focus}</p>
          <ul className="mt-2 list-inside list-disc text-sm text-muted">
            {weeklyFocus.emphasis.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </section>
      )}

      {plan ? (
        <>
          <section className="mb-8 rounded-xl border border-accent/30 bg-surface p-6">
            <h2 className="text-lg font-medium">{plan.title}</h2>
            <p className="mt-1 text-sm text-muted">
              {plan.phase} · {plan.module}
            </p>
            {plan.gate && (
              <p className="mt-3 rounded-lg bg-warning/10 px-3 py-2 text-sm text-warning">
                Gate: {plan.gate}
              </p>
            )}
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            {[
              { title: "Theory", items: plan.theory, block: "block-1" },
              { title: "Configuration", items: plan.config, block: "block-2" },
              { title: "Lab", items: [plan.lab], block: "block-3" },
              { title: "Break / Fix", items: plan.breakFix, block: "block-4" },
              { title: "Recall", items: plan.recall, block: "block-5" },
            ].map((section) =>
              section.items.length > 0 && section.items[0] !== "" ? (
                <section
                  key={section.title}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">{section.title}</h3>
                    {isBlockComplete(progress.currentWeek, progress.currentDay, section.block) && (
                      <span className="text-xs text-success">✓ Done</span>
                    )}
                  </div>
                  <ul className="mt-3 space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-sm text-muted leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/focus"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent-dim"
            >
              Open in Focus Mode
            </Link>
            {!isDayComplete(progress.currentWeek, progress.currentDay) && (
              <button
                onClick={() => completeDay(progress.currentWeek, progress.currentDay)}
                className="rounded-lg border border-success/50 px-5 py-2.5 text-sm text-success hover:bg-success/10"
              >
                Mark Day Complete
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="text-muted">
          No detailed plan for this day yet. Weeks 1–4 are fully mapped. Continue with the
          curriculum module for this phase.
        </p>
      )}

      {/* Daily blocks reference */}
      <section className="mt-12">
        <h3 className="mb-4 text-sm font-medium text-muted">Daily Schedule Template</h3>
        <div className="space-y-2">
          {DAILY_BLOCKS.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-4 rounded-lg border border-border/50 px-4 py-3 text-sm"
            >
              <span className="w-24 shrink-0 font-mono text-xs text-muted">
                {b.start}–{b.end}
              </span>
              <span className="font-medium">{b.title}</span>
              <span className="hidden text-muted sm:inline">— {b.focus}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
