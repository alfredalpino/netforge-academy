import { getDayPlan } from "./daily-plans";
import { getModule } from "./curriculum";
import { DAILY_BLOCKS } from "./schedule";
import type { DailyBlock } from "./types";

export interface StudySection {
  id: string;
  blockId: string;
  title: string;
  focus: string;
  items: string[];
  time: string;
}

export interface FocusStudyContent {
  dayTitle: string;
  module: string;
  phase: string;
  sections: StudySection[];
  hasDayPlan: boolean;
}

function blockSection(block: DailyBlock, items: string[]): StudySection {
  return {
    id: block.id,
    blockId: block.id,
    title: block.title,
    focus: block.focus,
    items: items.length > 0 ? items : block.activities,
    time: `${block.start}–${block.end}`,
  };
}

export function getFocusStudyContent(
  week: number,
  day: number,
  moduleId: string,
  activeBlockId?: string
): FocusStudyContent {
  const plan = getDayPlan(week, day);
  const modInfo = getModule(moduleId);

  if (plan) {
    const sections: StudySection[] = [
      blockSection(DAILY_BLOCKS[0], plan.theory),
      blockSection(DAILY_BLOCKS[1], plan.config),
      blockSection(DAILY_BLOCKS[2], plan.lab ? [plan.lab] : []),
      blockSection(DAILY_BLOCKS[3], plan.breakFix),
      blockSection(DAILY_BLOCKS[4], plan.recall),
      blockSection(DAILY_BLOCKS[5], DAILY_BLOCKS[5].activities),
    ].filter((s) => s.items.length > 0 && s.items[0] !== "");

    return {
      dayTitle: plan.title,
      module: plan.module,
      phase: plan.phase,
      sections,
      hasDayPlan: true,
    };
  }

  const mod = modInfo?.module;
  const sections: StudySection[] = DAILY_BLOCKS.map((block, i) => {
    let items: string[] = block.activities;
    if (mod) {
      if (i === 0) items = mod.topics;
      else if (i === 1) items = mod.commands ?? block.activities;
      else if (i === 2) items = mod.labObjective ? [mod.labObjective] : block.activities;
      else if (i === 3) items = mod.breakScenarios ?? block.activities;
      else if (i === 4) items = mod.exitCriteria ?? block.activities;
    }
    return blockSection(block, items);
  });

  return {
    dayTitle: mod?.title ?? `Week ${week} · Day ${day}`,
    module: mod?.title ?? "Curriculum Module",
    phase: modInfo?.phase.title ?? "",
    sections,
    hasDayPlan: false,
  };
}

export function getActiveSection(
  content: FocusStudyContent,
  activeBlockId: string
): StudySection | undefined {
  return content.sections.find((s) => s.blockId === activeBlockId);
}
