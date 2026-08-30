"use client";

import Link from "next/link";
import { useProgress, getOverallProgress } from "@/lib/progress";
import { JOURNEY_MILESTONES, getMilestoneIndex } from "@/lib/journey";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { AcademyPracticeSection } from "@/components/AcademyPracticeSection";

interface JourneyNavigatorProps {
  compact?: boolean;
}

export function JourneyNavigator({ compact = false }: JourneyNavigatorProps) {
  const { progress, loaded, jumpToMilestone } = useProgress();
  const { confirm } = useConfirm();

  if (!loaded) return null;

  const overall = getOverallProgress(progress);
  const currentIdx = getMilestoneIndex(progress.currentModuleId);

  const handleJump = async (moduleId: string, label: string) => {
    if (moduleId === progress.currentModuleId) return;
    const ok = await confirm({
      title: `Jump to ${label}?`,
      message: "Your current week and day position will update to match this milestone.",
      confirmLabel: "Jump",
    });
    if (ok) jumpToMilestone(moduleId);
  };

  if (compact) {
    return (
      <section data-tour="journey" className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-accent">You are here</p>
            <p className="mt-1 text-lg font-medium">{overall.currentMilestone.shortLabel}</p>
            <p className="text-xs text-muted">
              Week {progress.currentWeek} · Day {progress.currentDay} · {overall.curriculum}% through curriculum
            </p>
          </div>
          {overall.nextMilestone && (
            <button
              onClick={() => handleJump(overall.nextMilestone!.moduleId, overall.nextMilestone!.shortLabel)}
              className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-accent hover:bg-accent/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Continue → {overall.nextMilestone.shortLabel}
            </button>
          )}
        </div>
        <JourneyTrack
          currentIdx={currentIdx}
          currentModuleId={progress.currentModuleId}
          completedModules={progress.completedModules}
          onJump={handleJump}
        />
      </section>
    );
  }

  return (
    <section data-tour="journey" className="rounded-xl border border-border bg-surface p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium">Learning Journey</h2>
          <p className="mt-1 text-xs text-muted">
            Tap any topic to jump — Linux, OSPF, Azure, and everything between
          </p>
        </div>
        <Link href="/curriculum" className="text-xs text-accent hover:underline">
          Full curriculum →
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <Stat label="Current" value={overall.currentMilestone.shortLabel} accent />
        <Stat label="Position" value={`W${progress.currentWeek} D${progress.currentDay}`} />
        <Stat label="Modules done" value={`${overall.completedModules}/${overall.totalModules}`} />
        {overall.nextMilestone && (
          <button
            onClick={() => handleJump(overall.nextMilestone!.moduleId, overall.nextMilestone!.shortLabel)}
            className="ml-auto rounded-lg bg-accent px-4 py-1.5 text-xs font-medium text-white hover:bg-accent-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            Continue to {overall.nextMilestone.shortLabel} →
          </button>
        )}
      </div>

      <JourneyTrack
        currentIdx={currentIdx}
        currentModuleId={progress.currentModuleId}
        completedModules={progress.completedModules}
        onJump={handleJump}
      />
      <AcademyPracticeSection variant="journey" />
    </section>
  );
}

function JourneyTrack({
  currentIdx,
  currentModuleId,
  completedModules,
  onJump,
}: {
  currentIdx: number;
  currentModuleId: string;
  completedModules: string[];
  onJump: (moduleId: string, label: string) => void;
}) {
  return (
    <div className="journey-track-wrapper">
      <div className="journey-track">
        {JOURNEY_MILESTONES.map((m, i) => {
          const isCurrent = m.moduleId === currentModuleId;
          const isComplete = completedModules.includes(m.moduleId);
          const isPast = i < currentIdx;

          return (
            <button
              key={m.id}
              onClick={() => onJump(m.moduleId, m.shortLabel)}
              aria-label={`${m.title}, week ${m.week}${isCurrent ? ", current" : ""}`}
              aria-current={isCurrent ? "step" : undefined}
              className={`journey-node group ${isCurrent ? "journey-node-current" : ""} ${
                isComplete ? "journey-node-complete" : ""
              } ${isPast && !isComplete ? "journey-node-past" : ""}`}
            >
              <span className="journey-dot">
                {isComplete ? "✓" : isCurrent ? "●" : i + 1}
              </span>
              <span className="journey-label">{m.shortLabel}</span>
              <span className="journey-tooltip">
                {m.title}
                <br />
                <span className="text-muted">Week {m.week} · tap to jump</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className={`font-medium ${accent ? "text-accent" : ""}`}>{value}</p>
    </div>
  );
}
