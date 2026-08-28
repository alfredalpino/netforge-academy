export interface TourStep {
  id: string;
  target?: string;
  title: string;
  body: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
}

export interface TourDefinition {
  id: string;
  name: string;
  steps: TourStep[];
}

export const TOURS: TourDefinition[] = [
  {
    id: "welcome",
    name: "Welcome Tour",
    steps: [
      {
        id: "welcome-intro",
        title: "Welcome to NetForge",
        body: "Your 28-week path from NOC Analyst to Network Engineer. This quick tour shows you around — the app stays fully usable.",
        placement: "center",
      },
      {
        id: "welcome-sidebar",
        target: "[data-tour='sidebar']",
        title: "Navigation",
        body: "Every section lives here. Dashboard, Today, Focus Mode, Curriculum, Resources, and more.",
        placement: "right",
      },
      {
        id: "welcome-journey",
        target: "[data-tour='journey']",
        title: "Your Learning Path",
        body: "See exactly where you are — Linux, OSPF, Azure, etc. Tap any milestone to jump there instantly.",
        placement: "bottom",
      },
      {
        id: "welcome-progress",
        target: "[data-tour='progress']",
        title: "Progress Tracker",
        body: "Real progress from modules, days, blocks, labs, and your position in the curriculum — all calculated together.",
        placement: "bottom",
      },
      {
        id: "welcome-actions",
        target: "[data-tour='quick-actions']",
        title: "Daily Workflow",
        body: "Start Focus Mode for distraction-free study, open Today's plan, or check in for accountability.",
        placement: "top",
      },
      {
        id: "welcome-guide",
        target: "[data-tour='guide-link']",
        title: "How to Use",
        body: "Short guide with every detail you need. Replay this tour anytime from the ? button.",
        placement: "right",
      },
    ],
  },
  {
    id: "focus",
    name: "Focus Mode Tour",
    steps: [
      {
        id: "focus-setup",
        target: "[data-tour='focus-timer']",
        title: "Start Your Session",
        body: "Pick a Pomodoro preset (25/5, 50/10, or custom), then hit Start. Timer moves to a draggable bubble and your tab title.",
        placement: "bottom",
      },
      {
        id: "focus-study",
        target: "[data-tour='focus-study']",
        title: "Study Material",
        body: "Today's theory, config, lab, and recall — everything you need to learn is right here. Check items off as you go.",
        placement: "top",
      },
      {
        id: "focus-blocks",
        target: "[data-tour='focus-blocks']",
        title: "Study Blocks",
        body: "Switch between Deep Theory, Configuration, Lab, Break/Fix, and Recall. Mark each block complete when done.",
        placement: "bottom",
      },
    ],
  },
  {
    id: "today",
    name: "Today Page Tour",
    steps: [
      {
        id: "today-nav",
        target: "[data-tour='today-nav']",
        title: "Day Navigator",
        body: "Move between days in the week. Green = completed. Jump to any day freely.",
        placement: "bottom",
      },
      {
        id: "today-plan",
        target: "[data-tour='today-plan']",
        title: "Daily Plan",
        body: "Theory, configuration, lab, break/fix, and recall — everything for today in one view.",
        placement: "bottom",
      },
    ],
  },
];

export function getTour(id: string): TourDefinition | undefined {
  return TOURS.find((t) => t.id === id);
}
