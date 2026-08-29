import { z } from "zod";
import type { SimulationController } from "../core/controller";
import type { TopologySpec } from "../core/types";

export const labCheckSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("interface_up"),
    device: z.string(),
    interface: z.string(),
  }),
  z.object({
    type: z.literal("interface_ip"),
    device: z.string(),
    interface: z.string(),
    address: z.string(),
  }),
  z.object({
    type: z.literal("ping"),
    from: z.string(),
    to: z.string(),
    expect: z.enum(["success", "fail"]).default("success"),
  }),
]);

export const labSpecSchema = z.object({
  schemaVersion: z.literal(1).default(1),
  id: z.string(),
  title: z.string(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  estimatedMinutes: z.number().default(15),
  objectives: z.array(z.string()).default([]),
  topology: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        type: z.enum(["router", "switch", "host", "server"]),
        interfaces: z
          .array(z.object({ name: z.string(), mac: z.string().optional() }))
          .optional(),
        position: z.object({ x: z.number(), y: z.number() }).optional(),
      }),
    ),
    links: z.array(
      z.object({
        id: z.string(),
        a: z.object({ deviceId: z.string(), interfaceName: z.string() }),
        b: z.object({ deviceId: z.string(), interfaceName: z.string() }),
        latencyMs: z.number().optional(),
      }),
    ),
  }),
  startupConfig: z.record(z.string(), z.string()).default({}),
  checks: z.array(labCheckSchema),
  grading: z
    .object({
      passScore: z.number().default(80),
    })
    .default({ passScore: 80 }),
});

export type LabSpec = z.infer<typeof labSpecSchema>;
export type LabCheck = z.infer<typeof labCheckSchema>;

export interface CheckResult {
  id: string;
  type: string;
  label: string;
  pass: boolean;
  detail: string;
}

export interface GradeReport {
  labId: string;
  score: number;
  passScore: number;
  passed: boolean;
  checks: CheckResult[];
}

export function topologyFromLab(lab: LabSpec): TopologySpec {
  return {
    nodes: lab.topology.nodes.map((n) => ({
      id: n.id,
      name: n.name,
      type: n.type,
      interfaces: n.interfaces,
    })),
    links: lab.topology.links,
    positions: Object.fromEntries(
      lab.topology.nodes
        .filter((n) => n.position)
        .map((n) => [n.id, n.position!]),
    ),
  };
}

export function applyStartupConfig(sim: SimulationController, lab: LabSpec): void {
  for (const [deviceId, config] of Object.entries(lab.startupConfig)) {
    const lines = config.split("\n").map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      sim.executeCommand(deviceId, line);
    }
  }
}

export function gradeLab(lab: LabSpec, sim: SimulationController): GradeReport {
  const checks: CheckResult[] = lab.checks.map((check, index) => {
    const id = `c${index}`;
    if (check.type === "interface_up") {
      const device = sim.getDevice(check.device);
      const iface = device?.interfaces.find((i) => i.name === check.interface);
      const pass =
        !!iface &&
        iface.adminStatus === "up" &&
        iface.operationalStatus === "up";
      return {
        id,
        type: check.type,
        label: `${check.device} ${check.interface} up`,
        pass,
        detail: pass
          ? "Interface is administratively and operationally up"
          : `Interface state: admin=${iface?.adminStatus ?? "missing"} oper=${iface?.operationalStatus ?? "missing"}`,
      };
    }
    if (check.type === "interface_ip") {
      const device = sim.getDevice(check.device);
      const iface = device?.interfaces.find((i) => i.name === check.interface);
      const pass = !!iface?.ipv4.some((a) => a.address === check.address);
      return {
        id,
        type: check.type,
        label: `${check.device} ${check.interface} = ${check.address}`,
        pass,
        detail: pass
          ? "Address matches"
          : `Found: ${iface?.ipv4.map((a) => a.address).join(", ") || "none"}`,
      };
    }
    // ping
    const ping = sim.ping(check.from, check.to, 1);
    const expectSuccess = check.expect === "success";
    const pass = expectSuccess ? ping.success : !ping.success;
    return {
      id,
      type: check.type,
      label: `Ping ${check.from} → ${check.to}`,
      pass,
      detail: ping.output,
    };
  });

  const score =
    checks.length === 0
      ? 0
      : Math.round((checks.filter((c) => c.pass).length / checks.length) * 100);
  const passScore = lab.grading.passScore;
  return {
    labId: lab.id,
    score,
    passScore,
    passed: score >= passScore,
    checks,
  };
}
