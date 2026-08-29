"use client";

import { useCallback, useState } from "react";
import { SimulationController } from "@/simulation/core/controller";
import {
  applyStartupConfig,
  gradeLab,
  topologyFromLab,
  type GradeReport,
  type LabSpec,
} from "@/simulation/grading/lab-schema";
import type {
  CliResult,
  DeviceType,
  EngineSnapshot,
  TopologySpec,
} from "@/simulation/core/types";
import { useSimulatorStore } from "@/features/simulator/store/simulatorStore";

/**
 * Reliable P1 bridge: main-thread controller + Zustand mirror.
 * Worker module (`sim.worker.ts`) stays protocol-compatible for cutover once
 * Next/Turbopack worker bundling is confirmed in-app; UI already speaks async.
 */
export function useSimulationEngine() {
  const [sim] = useState(() => new SimulationController());
  const applyMirror = useSimulatorStore((s) => s.applyMirror);

  const sync = useCallback(() => {
    applyMirror(sim.getStateMirror());
  }, [applyMirror, sim]);

  const loadTopology = useCallback(
    async (spec: TopologySpec, seed = 1) => {
      sim.loadTopology(spec, seed);
      sync();
    },
    [sim, sync],
  );

  const executeCommand = useCallback(
    async (deviceId: string, line: string): Promise<CliResult> => {
      const result = sim.executeCommand(deviceId, line);
      sync();
      return result;
    },
    [sim, sync],
  );

  const grade = useCallback(
    async (lab: LabSpec): Promise<GradeReport> => {
      const report = gradeLab(lab, sim);
      sync();
      return report;
    },
    [sim, sync],
  );

  const snapshot = useCallback(async (): Promise<EngineSnapshot> => {
    return sim.snapshot();
  }, [sim]);

  const restore = useCallback(
    async (snap: EngineSnapshot) => {
      sim.restore(snap);
      sync();
    },
    [sim, sync],
  );

  const addDevice = useCallback(
    async (deviceType: DeviceType, name?: string) => {
      const device = sim.addDevice(deviceType, name);
      sync();
      return device;
    },
    [sim, sync],
  );

  const addLink = useCallback(
    async (
      a: { deviceId: string; interfaceName: string },
      b: { deviceId: string; interfaceName: string },
    ) => {
      const res = sim.addLink(a, b);
      sync();
      if ("error" in res) throw new Error(res.error);
      return res;
    },
    [sim, sync],
  );

  const applyLabStartup = useCallback(
    (lab: LabSpec) => {
      applyStartupConfig(sim, lab);
      sync();
    },
    [sim, sync],
  );

  const getController = useCallback(() => sim, [sim]);

  return {
    ready: true,
    runtime: "main" as const,
    loadTopology,
    executeCommand,
    grade,
    snapshot,
    restore,
    addDevice,
    addLink,
    applyLabStartup,
    getController,
    topologyFromLab,
  };
}
