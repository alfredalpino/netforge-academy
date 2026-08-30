"use client";

import { useCallback, useEffect, useState } from "react";
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
  NetworkDevice,
  TopologySpec,
} from "@/simulation/core/types";
import { useSimulatorStore } from "@/features/simulator/store/simulatorStore";
import {
  createSimWorkerClient,
  type SimWorkerClient,
} from "@/simulation/workers/sim-worker-client";

type SimRuntime = "worker" | "main";

type SimBackend =
  | { runtime: "worker"; worker: SimWorkerClient; main: null }
  | { runtime: "main"; worker: null; main: SimulationController };

function createBackend(): SimBackend {
  const worker = createSimWorkerClient();
  if (worker) return { runtime: "worker", worker, main: null };
  return { runtime: "main", worker: null, main: new SimulationController() };
}

/** Web Worker when available; falls back to main-thread controller in SSR/tests. */
export function useSimulationEngine() {
  const applyMirror = useSimulatorStore((s) => s.applyMirror);
  const [backend] = useState(createBackend);

  useEffect(() => {
    return () => backend.worker?.terminate();
  }, [backend]);

  const syncMain = useCallback(() => {
    if (backend.main) applyMirror(backend.main.getStateMirror());
  }, [applyMirror, backend.main]);

  const syncMirror = useCallback(
    (mirror: Parameters<typeof applyMirror>[0]) => {
      applyMirror(mirror);
    },
    [applyMirror],
  );

  const loadTopology = useCallback(
    async (spec: TopologySpec, seed = 1) => {
      if (backend.worker) {
        syncMirror(await backend.worker.loadTopology(spec, seed));
        return;
      }
      backend.main!.loadTopology(spec, seed);
      syncMain();
    },
    [backend, syncMain, syncMirror],
  );

  const executeCommand = useCallback(
    async (deviceId: string, line: string): Promise<CliResult> => {
      if (backend.worker) {
        const { result, mirror } = await backend.worker.executeCommand(deviceId, line);
        syncMirror(mirror);
        return result;
      }
      const result = backend.main!.executeCommand(deviceId, line);
      syncMain();
      return result;
    },
    [backend, syncMain, syncMirror],
  );

  const grade = useCallback(
    async (lab: LabSpec): Promise<GradeReport> => {
      if (backend.worker) {
        const { report, mirror } = await backend.worker.grade(lab);
        syncMirror(mirror);
        return report;
      }
      const report = gradeLab(lab, backend.main!);
      syncMain();
      return report;
    },
    [backend, syncMain, syncMirror],
  );

  const snapshot = useCallback(async (): Promise<EngineSnapshot> => {
    if (backend.worker) return backend.worker.snapshot();
    return backend.main!.snapshot();
  }, [backend]);

  const restore = useCallback(
    async (snap: EngineSnapshot) => {
      if (backend.worker) {
        syncMirror(await backend.worker.restore(snap));
        return;
      }
      backend.main!.restore(snap);
      syncMain();
    },
    [backend, syncMain, syncMirror],
  );

  const addDevice = useCallback(
    async (deviceType: DeviceType, name?: string): Promise<NetworkDevice> => {
      if (backend.worker) {
        const { mirror } = await backend.worker.addDevice(deviceType, name);
        syncMirror(mirror);
        const device = mirror.devices.at(-1);
        if (!device) throw new Error("Worker did not return new device");
        return device;
      }
      const device = backend.main!.addDevice(deviceType, name);
      syncMain();
      return device;
    },
    [backend, syncMain, syncMirror],
  );

  const addLink = useCallback(
    async (
      a: { deviceId: string; interfaceName: string },
      b: { deviceId: string; interfaceName: string },
    ) => {
      if (backend.worker) {
        const { mirror } = await backend.worker.addLink(a, b);
        syncMirror(mirror);
        const link = mirror.links.at(-1);
        if (!link) throw new Error("Worker did not return new link");
        return { link };
      }
      const res = backend.main!.addLink(a, b);
      syncMain();
      if ("error" in res) throw new Error(res.error);
      return res;
    },
    [backend, syncMain, syncMirror],
  );

  const applyLabStartup = useCallback(
    async (lab: LabSpec) => {
      if (backend.worker) {
        syncMirror(await backend.worker.applyLabStartup(lab));
        return;
      }
      applyStartupConfig(backend.main!, lab);
      syncMain();
    },
    [backend, syncMain, syncMirror],
  );

  const getController = useCallback(
    () => backend.main,
    [backend.main],
  );

  return {
    ready: true,
    runtime: backend.runtime satisfies SimRuntime,
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
