import type { LabSpec, GradeReport } from "../grading/lab-schema";
import type {
  CliResult,
  EngineSnapshot,
  NetworkDevice,
  NetworkLink,
  PacketTrace,
  SimulationEvent,
  TopologySpec,
  DeviceType,
} from "../core/types";

export const WORKER_PROTOCOL_VERSION = 1 as const;

export type ToWorker =
  | { v: 1; type: "init"; seed: number }
  | { v: 1; type: "load"; topology: TopologySpec; seed?: number }
  | {
      v: 1;
      type: "cmd";
      deviceId: string;
      line: string;
      requestId: string;
    }
  | {
      v: 1;
      type: "ping";
      deviceId: string;
      dest: string;
      requestId: string;
    }
  | { v: 1; type: "snapshot"; requestId: string }
  | { v: 1; type: "restore"; snapshot: EngineSnapshot; requestId: string }
  | { v: 1; type: "grade"; lab: LabSpec; requestId: string }
  | {
      v: 1;
      type: "addDevice";
      deviceType: DeviceType;
      name?: string;
      requestId: string;
    }
  | {
      v: 1;
      type: "addLink";
      a: { deviceId: string; interfaceName: string };
      b: { deviceId: string; interfaceName: string };
      requestId: string;
    }
  | { v: 1; type: "applyStartup"; lab: LabSpec; requestId: string }
  | { v: 1; type: "removeDevice"; deviceId: string; requestId: string }
  | { v: 1; type: "removeLink"; linkId: string; requestId: string }
  | { v: 1; type: "getState"; requestId: string };

export type EngineMirror = {
  devices: NetworkDevice[];
  links: NetworkLink[];
  traces: PacketTrace[];
  events: SimulationEvent[];
};

export type FromWorker =
  | { v: 1; type: "ready"; requestId?: string; mirror?: EngineMirror }
  | {
      v: 1;
      type: "cli";
      requestId: string;
      result: CliResult;
      mirror: EngineMirror;
    }
  | {
      v: 1;
      type: "pong";
      requestId: string;
      success: boolean;
      output: string;
      mirror: EngineMirror;
    }
  | {
      v: 1;
      type: "snapshot";
      requestId: string;
      snapshot: EngineSnapshot;
    }
  | {
      v: 1;
      type: "grade";
      requestId: string;
      report: GradeReport;
      mirror: EngineMirror;
    }
  | {
      v: 1;
      type: "state";
      requestId: string;
      mirror: EngineMirror;
    }
  | { v: 1; type: "error"; requestId?: string; message: string };
