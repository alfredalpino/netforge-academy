import { describe, expect, it } from "vitest";
import { aclMatch, evaluateStandardAcl, evaluateExtendedAcl, IP_PROTO_TCP } from "./acl";
import type { StandardAccessList } from "./types";
import { SimulationController } from "./controller";

describe("ACL matching", () => {
  it("matches host with zero wildcard", () => {
    expect(aclMatch("192.168.1.10", "192.168.1.10", "0.0.0.0")).toBe(true);
    expect(aclMatch("192.168.1.11", "192.168.1.10", "0.0.0.0")).toBe(false);
  });

  it("matches subnet with wildcard", () => {
    expect(aclMatch("192.168.1.50", "192.168.1.0", "0.0.0.255")).toBe(true);
    expect(aclMatch("192.168.2.1", "192.168.1.0", "0.0.0.255")).toBe(false);
  });

  it("evaluates first match and implicit deny", () => {
    const list: StandardAccessList = {
      kind: "standard",
      number: 10,
      entries: [
        { seq: 10, action: "deny", source: "192.168.1.0", wildcard: "0.0.0.255", hits: 0 },
        { seq: 20, action: "permit", source: "0.0.0.0", wildcard: "255.255.255.255", hits: 0 },
      ],
    };
    expect(evaluateStandardAcl(list, "192.168.1.10")).toBe("deny");
    expect(evaluateStandardAcl(list, "192.168.2.10")).toBe("permit");
    expect(evaluateStandardAcl({ kind: "standard", number: 99, entries: [] }, "1.1.1.1")).toBe("deny");
  });
});

describe("ACL forwarding", () => {
  it("blocks PC1→PC2 when standard ACL applied outbound on destination interface", () => {
    const sim = new SimulationController();
    sim.loadTopology(
      {
        nodes: [
          { id: "R1", name: "R1", type: "router", interfaces: [{ name: "Gi0/0" }, { name: "Gi0/1" }] },
          { id: "PC1", name: "PC1", type: "host", interfaces: [{ name: "eth0" }] },
          { id: "PC2", name: "PC2", type: "host", interfaces: [{ name: "eth0" }] },
        ],
        links: [
          { id: "L1", a: { deviceId: "PC1", interfaceName: "eth0" }, b: { deviceId: "R1", interfaceName: "Gi0/0" } },
          { id: "L2", a: { deviceId: "PC2", interfaceName: "eth0" }, b: { deviceId: "R1", interfaceName: "Gi0/1" } },
        ],
      },
      1,
    );

    const steps: Array<[string, string[]]> = [
      [
        "R1",
        [
          "interface Gi0/0",
          "ip address 192.168.1.1 255.255.255.0",
          "no shutdown",
          "exit",
          "interface Gi0/1",
          "ip address 192.168.2.1 255.255.255.0",
          "no shutdown",
          "exit",
          "access-list 10 deny 192.168.1.0 0.0.0.255",
          "interface Gi0/1",
          "ip access-group 10 out",
          "end",
        ],
      ],
      [
        "PC1",
        [
          "interface eth0",
          "ip address 192.168.1.10 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.1.1",
          "end",
        ],
      ],
      [
        "PC2",
        [
          "interface eth0",
          "ip address 192.168.2.10 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.2.1",
          "end",
        ],
      ],
    ];

    for (const [dev, lines] of steps) {
      sim.executeCommand(dev, "enable");
      sim.executeCommand(dev, "configure terminal");
      for (const line of lines) {
        const res = sim.executeCommand(dev, line);
        expect(res.error).toBeUndefined();
      }
    }

    const blocked = sim.ping("PC1", "192.168.2.10", 1);
    sim.runUntilIdle();
    expect(blocked.success).toBe(false);

    const gateway = sim.ping("PC1", "192.168.1.1", 1);
    sim.runUntilIdle();
    expect(gateway.success).toBe(true);
  });
});

describe("extended ACL forwarding", () => {
  it("denies icmp between subnets while permitting other traffic", () => {
    const sim = new SimulationController();
    sim.loadTopology(
      {
        nodes: [
          { id: "R1", name: "R1", type: "router", interfaces: [{ name: "Gi0/0" }, { name: "Gi0/1" }] },
          { id: "PC1", name: "PC1", type: "host", interfaces: [{ name: "eth0" }] },
          { id: "PC2", name: "PC2", type: "host", interfaces: [{ name: "eth0" }] },
        ],
        links: [
          { id: "L1", a: { deviceId: "PC1", interfaceName: "eth0" }, b: { deviceId: "R1", interfaceName: "Gi0/0" } },
          { id: "L2", a: { deviceId: "PC2", interfaceName: "eth0" }, b: { deviceId: "R1", interfaceName: "Gi0/1" } },
        ],
      },
      1,
    );

    const steps: Array<[string, string[]]> = [
      [
        "R1",
        [
          "interface Gi0/0",
          "ip address 192.168.1.1 255.255.255.0",
          "no shutdown",
          "exit",
          "interface Gi0/1",
          "ip address 192.168.2.1 255.255.255.0",
          "no shutdown",
          "exit",
          "access-list 100 deny icmp 192.168.1.0 0.0.0.255 192.168.2.0 0.0.0.255",
          "access-list 100 permit ip any any",
          "interface Gi0/1",
          "ip access-group 100 out",
          "end",
        ],
      ],
      [
        "PC1",
        [
          "interface eth0",
          "ip address 192.168.1.10 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.1.1",
          "end",
        ],
      ],
      [
        "PC2",
        [
          "interface eth0",
          "ip address 192.168.2.10 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.2.1",
          "end",
        ],
      ],
    ];

    for (const [dev, lines] of steps) {
      sim.executeCommand(dev, "enable");
      sim.executeCommand(dev, "configure terminal");
      for (const line of lines) {
        const res = sim.executeCommand(dev, line);
        expect(res.error).toBeUndefined();
      }
    }

    const blocked = sim.ping("PC1", "192.168.2.10", 1);
    sim.runUntilIdle();
    expect(blocked.success).toBe(false);

    const gateway = sim.ping("PC1", "192.168.1.1", 1);
    sim.runUntilIdle();
    expect(gateway.success).toBe(true);
  });
});

describe("extended ACL TCP port matching", () => {
  it("matches eq port on tcp entries", () => {
    const list: import("./types").ExtendedAccessList = {
      kind: "extended",
      number: 101,
      entries: [
        {
          seq: 10,
          action: "deny",
          protocol: "tcp",
          source: "192.168.1.0",
          sourceWildcard: "0.0.0.255",
          dest: "192.168.2.10",
          destWildcard: "0.0.0.0",
          destPortEq: 80,
          hits: 0,
        },
        {
          seq: 20,
          action: "permit",
          protocol: "ip",
          source: "0.0.0.0",
          sourceWildcard: "255.255.255.255",
          dest: "0.0.0.0",
          destWildcard: "255.255.255.255",
          hits: 0,
        },
      ],
    };
    expect(
      evaluateExtendedAcl(list, {
        srcIp: "192.168.1.10",
        dstIp: "192.168.2.10",
        protocol: IP_PROTO_TCP,
        dstPort: 80,
      }),
    ).toBe("deny");
    expect(
      evaluateExtendedAcl(list, {
        srcIp: "192.168.1.10",
        dstIp: "192.168.2.10",
        protocol: IP_PROTO_TCP,
        dstPort: 443,
      }),
    ).toBe("permit");
  });

  it("blocks tcp/80 but permits tcp/443 and icmp", () => {
    const sim = new SimulationController();
    sim.loadTopology(
      {
        nodes: [
          { id: "R1", name: "R1", type: "router", interfaces: [{ name: "Gi0/0" }, { name: "Gi0/1" }] },
          { id: "PC1", name: "PC1", type: "host", interfaces: [{ name: "eth0" }] },
          { id: "PC2", name: "PC2", type: "host", interfaces: [{ name: "eth0" }] },
        ],
        links: [
          { id: "L1", a: { deviceId: "PC1", interfaceName: "eth0" }, b: { deviceId: "R1", interfaceName: "Gi0/0" } },
          { id: "L2", a: { deviceId: "PC2", interfaceName: "eth0" }, b: { deviceId: "R1", interfaceName: "Gi0/1" } },
        ],
      },
      1,
    );

    const steps: Array<[string, string[]]> = [
      [
        "R1",
        [
          "interface Gi0/0",
          "ip address 192.168.1.1 255.255.255.0",
          "no shutdown",
          "exit",
          "interface Gi0/1",
          "ip address 192.168.2.1 255.255.255.0",
          "no shutdown",
          "exit",
          "access-list 101 deny tcp 192.168.1.0 0.0.0.255 host 192.168.2.10 eq 80",
          "access-list 101 permit ip any any",
          "interface Gi0/1",
          "ip access-group 101 out",
          "end",
        ],
      ],
      [
        "PC1",
        [
          "interface eth0",
          "ip address 192.168.1.10 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.1.1",
          "end",
        ],
      ],
      [
        "PC2",
        [
          "interface eth0",
          "ip address 192.168.2.10 255.255.255.0",
          "no shutdown",
          "exit",
          "ip default-gateway 192.168.2.1",
          "end",
        ],
      ],
    ];

    for (const [dev, lines] of steps) {
      sim.executeCommand(dev, "enable");
      sim.executeCommand(dev, "configure terminal");
      for (const line of lines) {
        const res = sim.executeCommand(dev, line);
        expect(res.error).toBeUndefined();
      }
    }

    const http = sim.probe("PC1", "192.168.2.10", { protocol: "tcp", dstPort: 80 });
    expect(http.success).toBe(false);

    const https = sim.probe("PC1", "192.168.2.10", { protocol: "tcp", dstPort: 443 });
    expect(https.success).toBe(true);

    const ping = sim.ping("PC1", "192.168.2.10", 1);
    sim.runUntilIdle();
    expect(ping.success).toBe(true);
  });
});
