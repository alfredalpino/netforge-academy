/**
 * Dedicated Worker entry (P0 scaffolding).
 * UI currently uses main-thread SimulationController via useSimulationEngine;
 * swap the hook to this worker when bundler/CSP path is verified in-app.
 */
import { SimulationController } from "../core/controller";
import type { EngineSnapshot, TopologySpec } from "../core/types";

const sim = new SimulationController();

export type WorkerRequest =
  | { type: "init"; seed: number }
  | { type: "load"; topology: TopologySpec; seed?: number }
  | { type: "cmd"; deviceId: string; line: string; requestId: string }
  | { type: "ping"; deviceId: string; dest: string; requestId: string }
  | { type: "snapshot"; requestId: string }
  | { type: "restore"; snapshot: EngineSnapshot; requestId: string };

self.onmessage = (ev: MessageEvent<WorkerRequest>) => {
  const msg = ev.data;
  try {
    switch (msg.type) {
      case "init":
        sim.reset(msg.seed);
        self.postMessage({ type: "ready" });
        break;
      case "load":
        sim.loadTopology(msg.topology, msg.seed ?? 1);
        self.postMessage({ type: "ready" });
        break;
      case "cmd": {
        const result = sim.executeCommand(msg.deviceId, msg.line);
        self.postMessage({
          type: "cli",
          requestId: msg.requestId,
          result,
          traces: sim.getTraces(),
          events: sim.getRecentEvents(),
        });
        break;
      }
      case "ping": {
        const result = sim.ping(msg.deviceId, msg.dest, 1);
        self.postMessage({
          type: "events",
          requestId: msg.requestId,
          events: result.events,
          traces: result.traces,
          ping: { success: result.success, output: result.output },
        });
        break;
      }
      case "snapshot":
        self.postMessage({
          type: "snapshot",
          requestId: msg.requestId,
          snapshot: sim.snapshot(),
        });
        break;
      case "restore":
        sim.restore(msg.snapshot);
        self.postMessage({ type: "ready", requestId: msg.requestId });
        break;
      default:
        break;
    }
  } catch (err) {
    self.postMessage({
      type: "error",
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
