"use client";

import { useCallback, useState } from "react";
import { SimulationController } from "@/simulation/core/controller";
import type {
  CliResult,
  EngineSnapshot,
  PacketTrace,
  SimulationEvent,
  TopologySpec,
} from "@/simulation/core/types";

/**
 * P0 bridge: main-thread SimulationController.
 * Worker entry lives at simulation/workers/sim.worker.ts for the next slice.
 */
export function useSimulationEngine() {
  const [sim] = useState(() => new SimulationController());
  const [events, setEvents] = useState<SimulationEvent[]>([]);
  const [traces, setTraces] = useState<PacketTrace[]>([]);
  const [, bump] = useState(0);

  const refresh = useCallback(() => {
    setEvents(sim.getRecentEvents().slice(-80));
    setTraces(sim.getTraces().slice(-80));
    bump((n) => n + 1);
  }, [sim]);

  const loadTopology = useCallback(
    (spec: TopologySpec, seed = 1) => {
      sim.loadTopology(spec, seed);
      refresh();
    },
    [refresh, sim],
  );

  const executeCommand = useCallback(
    (deviceId: string, line: string): CliResult => {
      const result = sim.executeCommand(deviceId, line);
      refresh();
      return result;
    },
    [refresh, sim],
  );

  const ping = useCallback(
    (deviceId: string, dest: string) => {
      const result = sim.ping(deviceId, dest, 1);
      refresh();
      return result;
    },
    [refresh, sim],
  );

  const snapshot = useCallback((): EngineSnapshot => sim.snapshot(), [sim]);

  const restore = useCallback(
    (s: EngineSnapshot) => {
      sim.restore(s);
      refresh();
    },
    [refresh, sim],
  );

  const getController = useCallback(() => sim, [sim]);

  return {
    ready: true,
    loadTopology,
    executeCommand,
    ping,
    snapshot,
    restore,
    getController,
    events,
    traces,
    refresh,
  };
}
