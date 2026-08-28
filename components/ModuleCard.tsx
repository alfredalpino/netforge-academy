"use client";

import type { Module } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { useToast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ModuleCardProps {
  module: Module;
  index?: number;
}

export function ModuleCard({ module, index }: ModuleCardProps) {
  const { isModuleComplete, completeModule, loaded } = useProgress();
  const { showToast } = useToast();
  const complete = loaded && isModuleComplete(module.id);

  const handleToggle = () => {
    completeModule(module.id);
    showToast(complete ? "Module marked incomplete" : "Module marked complete");
  };

  return (
    <article
      className={`rounded-xl border bg-surface p-6 transition hover:border-border/80 ${
        complete ? "border-success/40 bg-success/[0.02]" : "border-border"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {index !== undefined && (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background font-mono text-xs text-muted">
              {index}
            </span>
          )}
          <div>
            <h2 className="text-lg font-medium">{module.title}</h2>
            <p className="mt-1 text-sm text-muted">{module.competency}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="accent">{module.depth}</Badge>
          <Button
            variant={complete ? "success" : "secondary"}
            className="px-3 py-1 text-xs"
            onClick={handleToggle}
          >
            {complete ? "✓ Complete" : "Mark Complete"}
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="text-xs uppercase tracking-widest text-muted">Topics</h3>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {module.topics.map((t) => (
            <li key={t} className="text-sm text-foreground/90">
              · {t}
            </li>
          ))}
        </ul>
      </div>

      {module.commands && (
        <div className="mt-5">
          <h3 className="text-xs uppercase tracking-widest text-muted">Commands</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {module.commands.map((c) => (
              <code
                key={c}
                className="rounded-md bg-background px-2 py-0.5 font-mono text-xs text-accent"
              >
                {c}
              </code>
            ))}
          </div>
        </div>
      )}

      {module.labObjective && (
        <div className="mt-5 rounded-lg border border-border/50 bg-background p-4">
          <h3 className="text-xs uppercase tracking-widest text-muted">Lab</h3>
          <p className="mt-1 text-sm leading-relaxed">{module.labObjective}</p>
        </div>
      )}

      {module.breakScenarios && (
        <div className="mt-5">
          <h3 className="text-xs uppercase tracking-widest text-warning">Break Scenarios</h3>
          <ul className="mt-2 space-y-1.5">
            {module.breakScenarios.map((s) => (
              <li key={s} className="text-sm text-muted">
                ⚡ {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {module.exitCriteria && (
        <div className="mt-5 border-t border-border pt-5">
          <h3 className="text-xs uppercase tracking-widest text-success">Exit Criteria</h3>
          <ul className="mt-2 space-y-1.5">
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
