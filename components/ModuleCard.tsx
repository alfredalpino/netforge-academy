"use client";

import type { Module } from "@/lib/types";
import { useProgress } from "@/lib/progress";

interface ModuleCardProps {
  module: Module;
}

export function ModuleCard({ module }: ModuleCardProps) {
  const { isModuleComplete, completeModule, loaded } = useProgress();
  const complete = loaded && isModuleComplete(module.id);

  return (
    <article
      className={`rounded-xl border bg-surface p-6 transition ${
        complete ? "border-success/40" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-medium">{module.title}</h2>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-accent/10 px-3 py-0.5 text-xs font-mono text-accent">
            {module.depth}
          </span>
          <button
            onClick={() => completeModule(module.id)}
            className={`rounded-lg px-3 py-1 text-xs transition ${
              complete
                ? "bg-success/15 text-success hover:bg-success/25"
                : "border border-border text-muted hover:bg-surface-hover"
            }`}
          >
            {complete ? "✓ Complete" : "Mark Complete"}
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">{module.competency}</p>

      <div className="mt-4">
        <h3 className="text-xs uppercase tracking-widest text-muted">Topics</h3>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {module.topics.map((t) => (
            <li key={t} className="text-sm">
              · {t}
            </li>
          ))}
        </ul>
      </div>

      {module.commands && (
        <div className="mt-4">
          <h3 className="text-xs uppercase tracking-widest text-muted">Commands</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {module.commands.map((c) => (
              <code
                key={c}
                className="rounded bg-background px-2 py-0.5 font-mono text-xs text-accent"
              >
                {c}
              </code>
            ))}
          </div>
        </div>
      )}

      {module.labObjective && (
        <div className="mt-4 rounded-lg bg-background p-4">
          <h3 className="text-xs uppercase tracking-widest text-muted">Lab</h3>
          <p className="mt-1 text-sm">{module.labObjective}</p>
        </div>
      )}

      {module.breakScenarios && (
        <div className="mt-4">
          <h3 className="text-xs uppercase tracking-widest text-warning">Break Scenarios</h3>
          <ul className="mt-2 space-y-1">
            {module.breakScenarios.map((s) => (
              <li key={s} className="text-sm text-muted">
                ⚡ {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {module.exitCriteria && (
        <div className="mt-4 border-t border-border pt-4">
          <h3 className="text-xs uppercase tracking-widest text-success">Exit Criteria</h3>
          <ul className="mt-2 space-y-1">
            {module.exitCriteria.map((e) => (
              <li key={e} className="text-sm">
                ✓ {e}
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
