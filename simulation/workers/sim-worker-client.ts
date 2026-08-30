import type { LabSpec, GradeReport } from "../grading/lab-schema";
import type {
  CliResult,
  DeviceType,
  EngineSnapshot,
  NetworkDevice,
  TopologySpec,
} from "../core/types";
import type { EngineMirror, FromWorker, ToWorker } from "./protocol";
import { WORKER_PROTOCOL_VERSION } from "./protocol";

function nextRequestId(): string {
  return crypto.randomUUID();
}

type Pending = {
  resolve: (msg: FromWorker) => void;
  reject: (err: Error) => void;
};

/** Browser-side RPC wrapper for `sim.worker.ts`. */
export class SimWorkerClient {
  private worker: Worker;
  private pending = new Map<string, Pending>();
  private readyWaiters: Pending[] = [];

  constructor() {
    this.worker = new Worker(new URL("./sim.worker.ts", import.meta.url), {
      type: "module",
    });
    this.worker.onmessage = (ev: MessageEvent<FromWorker>) => {
      this.dispatch(ev.data);
    };
    this.worker.onerror = (ev) => {
      const err = new Error(ev.message || "Simulation worker failed");
      for (const [, p] of this.pending) p.reject(err);
      this.pending.clear();
      for (const w of this.readyWaiters) w.reject(err);
      this.readyWaiters = [];
    };
  }

  private dispatch(msg: FromWorker): void {
    if (msg.type === "error") {
      if (msg.requestId && this.pending.has(msg.requestId)) {
        this.pending.get(msg.requestId)!.reject(new Error(msg.message));
        this.pending.delete(msg.requestId);
      }
      return;
    }

    if (msg.type === "ready" && !msg.requestId) {
      const waiter = this.readyWaiters.shift();
      waiter?.resolve(msg);
      return;
    }

    const requestId = "requestId" in msg ? msg.requestId : undefined;
    if (requestId && this.pending.has(requestId)) {
      this.pending.get(requestId)!.resolve(msg);
      this.pending.delete(requestId);
    }
  }

  private post<T extends FromWorker>(msg: ToWorker): Promise<T> {
    return new Promise((resolve, reject) => {
      if ("requestId" in msg && msg.requestId) {
        this.pending.set(msg.requestId, {
          resolve: resolve as (m: FromWorker) => void,
          reject,
        });
      } else if (msg.type === "init" || msg.type === "load") {
        this.readyWaiters.push({
          resolve: resolve as (m: FromWorker) => void,
          reject,
        });
      }
      this.worker.postMessage(msg);
    });
  }

  terminate(): void {
    this.worker.terminate();
    this.pending.clear();
    this.readyWaiters = [];
  }

  private applyMirror(mirror: EngineMirror | undefined): EngineMirror {
    if (!mirror) {
      throw new Error("Worker response missing engine mirror");
    }
    return mirror;
  }

  async loadTopology(topology: TopologySpec, seed = 1): Promise<EngineMirror> {
    const msg = await this.post<Extract<FromWorker, { type: "ready" }>>({
      v: WORKER_PROTOCOL_VERSION,
      type: "load",
      topology,
      seed,
    });
    return this.applyMirror(msg.mirror);
  }

  async executeCommand(deviceId: string, line: string): Promise<{
    result: CliResult;
    mirror: EngineMirror;
  }> {
    const requestId = nextRequestId();
    const msg = await this.post<Extract<FromWorker, { type: "cli" }>>({
      v: WORKER_PROTOCOL_VERSION,
      type: "cmd",
      deviceId,
      line,
      requestId,
    });
    return { result: msg.result, mirror: this.applyMirror(msg.mirror) };
  }

  async grade(lab: LabSpec): Promise<{ report: GradeReport; mirror: EngineMirror }> {
    const requestId = nextRequestId();
    const msg = await this.post<Extract<FromWorker, { type: "grade" }>>({
      v: WORKER_PROTOCOL_VERSION,
      type: "grade",
      lab,
      requestId,
    });
    return { report: msg.report, mirror: this.applyMirror(msg.mirror) };
  }

  async snapshot(): Promise<EngineSnapshot> {
    const requestId = nextRequestId();
    const msg = await this.post<Extract<FromWorker, { type: "snapshot" }>>({
      v: WORKER_PROTOCOL_VERSION,
      type: "snapshot",
      requestId,
    });
    return msg.snapshot;
  }

  async restore(snapshot: EngineSnapshot): Promise<EngineMirror> {
    const requestId = nextRequestId();
    const msg = await this.post<Extract<FromWorker, { type: "ready" }>>({
      v: WORKER_PROTOCOL_VERSION,
      type: "restore",
      snapshot,
      requestId,
    });
    return this.applyMirror(msg.mirror);
  }

  async addDevice(deviceType: DeviceType, name?: string): Promise<{
    mirror: EngineMirror;
  }> {
    const requestId = nextRequestId();
    const msg = await this.post<Extract<FromWorker, { type: "state" }>>({
      v: WORKER_PROTOCOL_VERSION,
      type: "addDevice",
      deviceType,
      name,
      requestId,
    });
    return { mirror: this.applyMirror(msg.mirror) };
  }

  async addLink(
    a: { deviceId: string; interfaceName: string },
    b: { deviceId: string; interfaceName: string },
  ): Promise<{ mirror: EngineMirror }> {
    const requestId = nextRequestId();
    const msg = await this.post<Extract<FromWorker, { type: "state" }>>({
      v: WORKER_PROTOCOL_VERSION,
      type: "addLink",
      a,
      b,
      requestId,
    });
    return { mirror: this.applyMirror(msg.mirror) };
  }

  async applyLabStartup(lab: LabSpec): Promise<EngineMirror> {
    const requestId = nextRequestId();
    const msg = await this.post<Extract<FromWorker, { type: "state" }>>({
      v: WORKER_PROTOCOL_VERSION,
      type: "applyStartup",
      lab,
      requestId,
    });
    return this.applyMirror(msg.mirror);
  }

  /** Best-effort device lookup from the latest mirror (no direct controller access). */
  findDevice(mirror: EngineMirror, deviceId: string): NetworkDevice | undefined {
    return mirror.devices.find((d) => d.id === deviceId);
  }
}

export function createSimWorkerClient(): SimWorkerClient | null {
  if (typeof Worker === "undefined") return null;
  try {
    return new SimWorkerClient();
  } catch {
    return null;
  }
}
