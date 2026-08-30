/// <reference lib="webworker" />
import { SimulationController } from "../core/controller";
import { applyStartupConfig, gradeLab } from "../grading/lab-schema";
import type { FromWorker, ToWorker } from "./protocol";
import { WORKER_PROTOCOL_VERSION } from "./protocol";

const sim = new SimulationController();

function mirror() {
  return sim.getStateMirror();
}

function reply(msg: FromWorker): void {
  self.postMessage(msg);
}

self.onmessage = (ev: MessageEvent<ToWorker>) => {
  const msg = ev.data;
  if (!msg || msg.v !== WORKER_PROTOCOL_VERSION) {
    reply({
      v: 1,
      type: "error",
      message: "Unsupported worker protocol version",
    });
    return;
  }

  try {
    switch (msg.type) {
      case "init":
        sim.reset(msg.seed);
        reply({ v: 1, type: "ready", mirror: mirror() });
        break;
      case "load":
        sim.loadTopology(msg.topology, msg.seed ?? 1);
        reply({ v: 1, type: "ready", mirror: mirror() });
        break;
      case "cmd": {
        const result = sim.executeCommand(msg.deviceId, msg.line);
        reply({
          v: 1,
          type: "cli",
          requestId: msg.requestId,
          result,
          mirror: mirror(),
        });
        break;
      }
      case "ping": {
        const result = sim.ping(msg.deviceId, msg.dest, 1);
        reply({
          v: 1,
          type: "pong",
          requestId: msg.requestId,
          success: result.success,
          output: result.output,
          mirror: mirror(),
        });
        break;
      }
      case "snapshot":
        reply({
          v: 1,
          type: "snapshot",
          requestId: msg.requestId,
          snapshot: sim.snapshot(),
        });
        break;
      case "restore":
        sim.restore(msg.snapshot);
        reply({
          v: 1,
          type: "ready",
          requestId: msg.requestId,
          mirror: mirror(),
        });
        break;
      case "grade": {
        // Ensure lab topology already loaded by UI; grade against live state
        const report = gradeLab(msg.lab, sim);
        reply({
          v: 1,
          type: "grade",
          requestId: msg.requestId,
          report,
          mirror: mirror(),
        });
        break;
      }
      case "addDevice": {
        sim.addDevice(msg.deviceType, msg.name);
        reply({
          v: 1,
          type: "state",
          requestId: msg.requestId,
          mirror: mirror(),
        });
        break;
      }
      case "addLink": {
        const res = sim.addLink(msg.a, msg.b);
        if ("error" in res) {
          reply({
            v: 1,
            type: "error",
            requestId: msg.requestId,
            message: res.error,
          });
          break;
        }
        reply({
          v: 1,
          type: "state",
          requestId: msg.requestId,
          mirror: mirror(),
        });
        break;
      }
      case "applyStartup":
        applyStartupConfig(sim, msg.lab);
        reply({
          v: 1,
          type: "state",
          requestId: msg.requestId,
          mirror: mirror(),
        });
        break;
      case "removeDevice":
        sim.removeDevice(msg.deviceId);
        reply({
          v: 1,
          type: "state",
          requestId: msg.requestId,
          mirror: mirror(),
        });
        break;
      case "removeLink":
        sim.removeLink(msg.linkId);
        reply({
          v: 1,
          type: "state",
          requestId: msg.requestId,
          mirror: mirror(),
        });
        break;
      case "getState":
        reply({
          v: 1,
          type: "state",
          requestId: msg.requestId,
          mirror: mirror(),
        });
        break;
      default:
        reply({ v: 1, type: "error", message: "Unknown message type" });
    }
  } catch (err) {
    reply({
      v: 1,
      type: "error",
      requestId: "requestId" in msg ? msg.requestId : undefined,
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
