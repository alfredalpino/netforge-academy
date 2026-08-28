"use client";

import type { FocusStudyContent, StudySection } from "@/lib/focus-content";

interface StudyMaterialProps {
  content: FocusStudyContent;
  activeBlockId: string;
  onBlockChange: (blockId: string) => void;
  checklist: Record<string, boolean>;
  checklistKey: (blockId: string, idx: number) => string;
  onToggleCheck: (blockId: string, idx: number) => void;
  isBlockComplete: (blockId: string) => boolean;
  onMarkBlockComplete: (blockId: string) => void;
}

export function StudyMaterial({
  content,
  activeBlockId,
  onBlockChange,
  checklist,
  checklistKey,
  onToggleCheck,
  isBlockComplete,
  onMarkBlockComplete,
}: StudyMaterialProps) {
  const active = content.sections.find((s) => s.blockId === activeBlockId);

  return (
    <div className="space-y-6">
      <header className="border-b border-border/50 pb-6">
        <p className="text-xs uppercase tracking-widest text-accent">
          {content.phase} · {content.module}
        </p>
        <h1 className="mt-2 text-2xl font-semibold leading-tight">{content.dayTitle}</h1>
        {!content.hasDayPlan && (
          <p className="mt-2 text-sm text-warning">
            No day-by-day plan for this week — showing curriculum module content.
          </p>
        )}
      </header>

      {/* Block tabs */}
      <div data-tour="focus-blocks" className="flex flex-wrap gap-2" role="tablist" aria-label="Study blocks">
        {content.sections.map((section) => (
          <button
            key={section.blockId}
            role="tab"
            aria-selected={activeBlockId === section.blockId}
            onClick={() => onBlockChange(section.blockId)}
            className={`rounded-lg px-3 py-1.5 text-xs transition ${
              activeBlockId === section.blockId
                ? "bg-accent text-white"
                : isBlockComplete(section.blockId)
                  ? "bg-success/15 text-success"
                  : "border border-border text-muted hover:text-foreground"
            }`}
          >
            {section.time} {section.title}
            {isBlockComplete(section.blockId) && " ✓"}
          </button>
        ))}
      </div>

      {/* Active section — primary study view */}
      {active && (
        <ActiveSection
          section={active}
          checklist={checklist}
          checklistKey={checklistKey}
          onToggleCheck={onToggleCheck}
          isComplete={isBlockComplete(active.blockId)}
          onMarkComplete={() => onMarkBlockComplete(active.blockId)}
        />
      )}

      {/* Other sections collapsed */}
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted">All sections today</p>
        {content.sections
          .filter((s) => s.blockId !== activeBlockId)
          .map((section) => (
            <button
              key={section.blockId}
              onClick={() => onBlockChange(section.blockId)}
              className="flex w-full items-center justify-between rounded-lg border border-border/40 bg-surface/30 px-4 py-3 text-left transition hover:bg-surface hover:border-border"
            >
              <div>
                <p className="text-sm font-medium">{section.title}</p>
                <p className="text-xs text-muted">{section.focus}</p>
              </div>
              <span className="text-xs text-muted">{section.items.length} items</span>
            </button>
          ))}
      </div>
    </div>
  );
}

function ActiveSection({
  section,
  checklist,
  checklistKey,
  onToggleCheck,
  isComplete,
  onMarkComplete,
}: {
  section: StudySection;
  checklist: Record<string, boolean>;
  checklistKey: (blockId: string, idx: number) => string;
  onToggleCheck: (blockId: string, idx: number) => void;
  isComplete: boolean;
  onMarkComplete: () => void;
}) {
  const allChecked = section.items.every(
    (_, i) => checklist[checklistKey(section.blockId, i)]
  );

  return (
    <section
      data-tour="focus-study"
      className={`rounded-xl border p-6 ${
        isComplete ? "border-success/30 bg-success/5" : "border-accent/30 bg-surface"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted">{section.time}</p>
          <h2 className="mt-1 text-xl font-medium">{section.title}</h2>
          <p className="mt-1 text-sm text-muted">{section.focus}</p>
        </div>
        {isComplete && (
          <span className="rounded-full bg-success/15 px-3 py-1 text-xs text-success">
            Complete
          </span>
        )}
      </div>

      <ul className="mt-6 space-y-2">
        {section.items.map((item, i) => (
          <li key={i}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/40 bg-background/50 px-4 py-3 transition hover:bg-background">
              <input
                type="checkbox"
                checked={!!checklist[checklistKey(section.blockId, i)]}
                onChange={() => onToggleCheck(section.blockId, i)}
                className="mt-1 accent-accent"
              />
              <span className="text-sm leading-relaxed">{item}</span>
            </label>
          </li>
        ))}
      </ul>

      {allChecked && section.items.length > 0 && !isComplete && (
        <div className="mt-6">
          <button
            onClick={onMarkComplete}
            className="rounded-lg bg-success px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Mark {section.title} Complete
          </button>
        </div>
      )}
    </section>
  );
}
