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
        body: "Every section lives here. Dashboard, Today, Curriculum, Resources, and more.",
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
        body: "Open Today's plan, run drills, or check in for accountability.",
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
