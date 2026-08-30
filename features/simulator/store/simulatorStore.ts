"use client";

import { create } from "zustand";
import type { DockTabId } from "@/features/simulator/dock/BottomDock";
import type { GradeReport } from "@/simulation/grading/lab-schema";
import type {
  NetworkDevice,
  NetworkLink,
  PacketTrace,
  SimulationEvent,
} from "@/simulation/core/types";

export type CanvasLayout = { x: number; y: number; width?: number; height?: number };
/** @deprecated Use CanvasLayout */
export type CanvasPosition = CanvasLayout;

type SimulatorStore = {
  labId: string | null;
  labTitle: string;
  status: string;
  selectedId: string | null;
  dockTab: DockTabId;
  positions: Record<string, CanvasLayout>;
  devices: NetworkDevice[];
  links: NetworkLink[];
  traces: PacketTrace[];
  events: SimulationEvent[];
  selectedPacketId: string | null;
  grade: GradeReport | null;
  /** Score check id highlighted when jumping Tutor ↔ Score */
  highlightedCheckId: string | null;
  termLines: string[];
  termPromptByDevice: Record<string, string>;
  connectFrom: { deviceId: string; interfaceName: string } | null;
  setLabMeta: (id: string | null, title: string) => void;
  setStatus: (s: string) => void;
  setSelectedId: (id: string | null) => void;
  setDockTab: (t: DockTabId) => void;
  setPositions: (p: Record<string, CanvasLayout>) => void;
  patchPosition: (id: string, pos: CanvasLayout) => void;
  patchNodeLayout: (id: string, patch: Partial<CanvasLayout>) => void;
  applyMirror: (m: {
    devices: NetworkDevice[];
    links: NetworkLink[];
    traces: PacketTrace[];
    events: SimulationEvent[];
  }) => void;
  setGrade: (g: GradeReport | null) => void;
  setHighlightedCheckId: (id: string | null) => void;
  setSelectedPacketId: (id: string | null) => void;
  appendTerm: (line: string) => void;
  setTermLines: (lines: string[]) => void;
  setTermPrompt: (deviceId: string, prompt: string) => void;
  setConnectFrom: (
    ep: { deviceId: string; interfaceName: string } | null,
  ) => void;
};

export const useSimulatorStore = create<SimulatorStore>((set) => ({
  labId: null,
  labTitle: "Untitled lab",
  status: "Ready",
  selectedId: null,
  dockTab: "terminal",
  positions: {},
  devices: [],
  links: [],
  traces: [],
  events: [],
  selectedPacketId: null,
  grade: null,
  highlightedCheckId: null,
  termLines: [],
  termPromptByDevice: {},
  connectFrom: null,
  setLabMeta: (labId, labTitle) => set({ labId, labTitle }),
  setSelectedId: (selectedId) =>
    set((s) => (s.selectedId === selectedId ? s : { selectedId })),
  setDockTab: (dockTab) =>
    set((s) => (s.dockTab === dockTab ? s : { dockTab })),
  setStatus: (status) =>
    set((s) => (s.status === status ? s : { status })),
  setPositions: (positions) => set({ positions }),
  patchPosition: (id, pos) =>
    set((s) => ({ positions: { ...s.positions, [id]: pos } })),
  patchNodeLayout: (id, patch) =>
    set((s) => ({
      positions: {
        ...s.positions,
        [id]: { ...s.positions[id], ...patch },
      },
    })),
  applyMirror: (m) =>
    set({
      devices: m.devices,
      links: m.links,
      traces: m.traces,
      events: m.events,
    }),
  setGrade: (grade) => set({ grade, highlightedCheckId: null }),
  setHighlightedCheckId: (highlightedCheckId) => set({ highlightedCheckId }),
  setSelectedPacketId: (selectedPacketId) => set({ selectedPacketId }),
  appendTerm: (line) =>
    set((s) => ({ termLines: [...s.termLines, line] })),
  setTermLines: (termLines) => set({ termLines }),
  setTermPrompt: (deviceId, prompt) =>
    set((s) => ({
      termPromptByDevice: { ...s.termPromptByDevice, [deviceId]: prompt },
    })),
  setConnectFrom: (connectFrom) => set({ connectFrom }),
}));
