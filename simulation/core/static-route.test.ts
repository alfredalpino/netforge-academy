import { describe, expect, it } from "vitest";
import { SimulationController } from "./controller";
import { STATIC_ROUTE_LAB } from "@/content/labs/static-route";
import { applyStartupConfig, topologyFromLab } from "@/simulation/grading/lab-schema";

function run(sim: SimulationController, deviceId: string, lines: string[]): void {
  for (const line of lines) sim.executeCommand(deviceId, line);
}

function configureStaticRouteLab(sim: SimulationController): void {
  sim.loadTopology(topologyFromLab(STATIC_ROUTE_LAB), 99);
  applyStartupConfig(sim, STATIC_ROUTE_LAB);

  run(sim, "R1", [
    "enable",
    "configure terminal",
    "interface Gi0/0",
    "ip address 192.168.1.1 255.255.255.0",
    "no shutdown",
    "exit",
    "interface Gi0/1",
    "ip address 10.0.0.1 255.255.255.252",
    "no shutdown",
    "exit",
    "ip route 192.168.2.0 255.255.255.0 10.0.0.2",
    "end",
  ]);

  run(sim, "R2", [
    "enable",
    "configure terminal",
    "interface Gi0/0",
    "ip address 10.0.0.2 255.255.255.252",
    "no shutdown",
    "exit",
    "interface Gi0/1",
    "ip address 192.168.2.1 255.255.255.0",
    "no shutdown",
    "exit",
    "ip route 192.168.1.0 255.255.255.0 10.0.0.1",
    "end",
  ]);

  run(sim, "PC1", [
    "enable",
    "configure terminal",
    "interface eth0",
    "ip address 192.168.1.10 255.255.255.0",
    "no shutdown",
    "exit",
    "ip default-gateway 192.168.1.1",
    "end",
  ]);

  run(sim, "PC2", [
    "enable",
    "configure terminal",
    "interface eth0",
    "ip address 192.168.2.10 255.255.255.0",
    "no shutdown",
    "exit",
    "ip default-gateway 192.168.2.1",
    "end",
  ]);
}

describe("Static routes and default gateway", () => {
  it("PC1 pings PC2 across two routers with static routes", () => {
    const sim = new SimulationController();
    configureStaticRouteLab(sim);

    const r1Routes = sim.executeCommand("R1", "show ip route");
    expect(r1Routes.output).toContain("192.168.2.0/24");
    expect(r1Routes.output).toContain("10.0.0.2");

    const pc1Routes = sim.getDevice("PC1");
    expect(
      pc1Routes?.runtime.routingTable.some(
        (r) => r.network === "0.0.0.0" && r.nextHop === "192.168.1.1",
      ),
    ).toBe(true);

    const ping = sim.ping("PC1", "192.168.2.10", 1);
    expect(ping.success).toBe(true);
    expect(ping.output).toMatch(/1\/1 success/);

    const hops = sim
      .getTraces()
      .flatMap((t) => t.hops.map((h) => h.deviceId));
    expect(hops).toContain("R1");
    expect(hops).toContain("R2");
  });

  it("off-subnet ping fails without default gateway", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(STATIC_ROUTE_LAB), 99);
    applyStartupConfig(sim, STATIC_ROUTE_LAB);

    run(sim, "R1", [
      "enable",
      "configure terminal",
      "interface Gi0/0",
      "ip address 192.168.1.1 255.255.255.0",
      "no shutdown",
      "exit",
      "interface Gi0/1",
      "ip address 10.0.0.1 255.255.255.252",
      "no shutdown",
      "exit",
      "ip route 192.168.2.0 255.255.255.0 10.0.0.2",
      "end",
    ]);
    run(sim, "R2", [
      "enable",
      "configure terminal",
      "interface Gi0/0",
      "ip address 10.0.0.2 255.255.255.252",
      "no shutdown",
      "exit",
      "interface Gi0/1",
      "ip address 192.168.2.1 255.255.255.0",
      "no shutdown",
      "exit",
      "ip route 192.168.1.0 255.255.255.0 10.0.0.1",
      "end",
    ]);
    run(sim, "PC1", [
      "enable",
      "configure terminal",
      "interface eth0",
      "ip address 192.168.1.10 255.255.255.0",
      "no shutdown",
      "end",
    ]);

    const ping = sim.ping("PC1", "192.168.2.10", 1);
    expect(ping.success).toBe(false);
    expect(ping.output).toMatch(/No route|0\/1 success/);
  });

  it("rejects static route when next-hop is unreachable", () => {
    const sim = new SimulationController();
    sim.loadTopology(topologyFromLab(STATIC_ROUTE_LAB), 1);
    sim.executeCommand("R1", "enable");
    sim.executeCommand("R1", "configure terminal");
    const result = sim.executeCommand(
      "R1",
      "ip route 192.168.2.0 255.255.255.0 10.0.0.2",
    );
    expect(result.error).toContain("No route to next-hop");
  });
});
