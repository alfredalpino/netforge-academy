import type { GradeReport } from "@/simulation/grading/lab-schema";
import type { PacketTrace } from "@/simulation/core/types";

export type TutorHint = {
  id: string;
  severity: "info" | "warning" | "success";
  title: string;
  body: string;
  source: "grade" | "packet" | "general" | "lab";
  /** Links grade-sourced hints back to Score tab rows */
  relatedCheckId?: string;
};

function hintFromFailedCheck(check: GradeReport["checks"][number]): TutorHint | null {
  const base = { source: "grade" as const };

  if (check.type === "interface_up") {
    const match = check.label.match(/^(\S+)\s+(\S+)\s+up$/);
    const device = match?.[1] ?? "device";
    const iface = match?.[2] ?? "interface";
    return {
      ...base,
      id: `grade-${check.id}`,
      relatedCheckId: check.id,
      severity: "warning",
      title: "Interface is down",
      body: `Bring ${device} ${iface} up: select the device, open Terminal, then run \`configure terminal\`, \`interface ${iface}\`, \`no shutdown\`, \`end\`. Verify with \`show ip interface brief\`.`,
    };
  }

  if (check.type === "interface_ip") {
    const match = check.label.match(/^(\S+)\s+(\S+)\s+=\s+(.+)$/);
    const device = match?.[1] ?? "device";
    const iface = match?.[2] ?? "interface";
    const expected = match?.[3] ?? "expected address";
    return {
      ...base,
      id: `grade-${check.id}`,
      relatedCheckId: check.id,
      severity: "warning",
      title: "Wrong or missing IP address",
      body: `On ${device}, assign the lab address on ${iface}: \`configure terminal\` → \`interface ${iface}\` → \`ip address ${expected} 255.255.255.0\` → \`no shutdown\` → \`end\`. ${check.detail}`,
    };
  }

  if (check.type === "ping") {
    const pingMatch = check.label.match(/^Ping\s+(\S+)\s+→\s+(.+)$/);
    const from = pingMatch?.[1] ?? "source";
    const to = pingMatch?.[2] ?? "destination";
    const pingSucceeded = check.detail.includes("1/1 success");

    if (!check.pass && pingSucceeded) {
      return {
        ...base,
        id: `grade-${check.id}`,
        relatedCheckId: check.id,
        severity: "warning",
        title: "Hosts should be isolated",
        body: `Ping ${from} → ${to} succeeded when the lab expects failure. Separate broadcast domains: put PCs on different access VLANs and do not route between them unless the lab requires it.`,
      };
    }

    if (!check.pass) {
      return {
        ...base,
        id: `grade-${check.id}`,
        relatedCheckId: check.id,
        severity: "warning",
        title: "Ping should succeed but failed",
        body: `From ${from}, ping ${to} failed. Check: (1) both hosts share a subnet or have a valid default gateway, (2) interfaces are up with correct IPs, (3) switch access VLANs and router trunk allow the VLAN, (4) ARP resolves — watch the Packets/Capture tabs for ARP before ICMP. ${check.detail}`,
      };
    }
  }

  return null;
}

function hopText(trace: PacketTrace): string {
  return trace.hops.map((h) => h.action).join(" ").toLowerCase();
}

function hintFromPacket(trace: PacketTrace): TutorHint[] {
  const hints: TutorHint[] = [];
  const hops = hopText(trace);

  if (trace.outcome === "dropped") {
    if (hops.includes("drop vlan") || hops.includes("vlan")) {
      hints.push({
        id: `pkt-${trace.packetId}-vlan`,
        severity: "warning",
        source: "packet",
        title: "VLAN mismatch on path",
        body: "A switch dropped or could not forward this frame. Match access VLANs on host ports to the subnet VLAN, and on trunk ports allow those VLANs (\`switchport mode trunk\`, \`switchport trunk allowed vlan add 10,20\`). Tagged frames on access ports are dropped.",
      });
    }

    if (trace.protocol === "ICMP" && !hops.includes("arp")) {
      hints.push({
        id: `pkt-${trace.packetId}-arp`,
        severity: "warning",
        source: "packet",
        title: "No ARP resolution seen",
        body: "ICMP never left L3 — usually missing ARP. Confirm the destination is on-link or set a default gateway (\`ip default-gateway A.B.C.D\` on hosts). Verify both ends are in the same subnet mask.",
      });
    }

    if (hops.includes("no route") || trace.summary.toLowerCase().includes("no route")) {
      hints.push({
        id: `pkt-${trace.packetId}-route`,
        severity: "warning",
        source: "packet",
        title: "No route to destination",
        body: "The router has no matching connected network for this destination. Add the correct interface IP on the router or configure a default route / gateway on the host.",
      });
    }

    if (hops.includes("interface down") || hops.includes("ingress down")) {
      hints.push({
        id: `pkt-${trace.packetId}-ifdown`,
        severity: "warning",
        source: "packet",
        title: "Dropped on down interface",
        body: "Traffic hit an administratively or operationally down port. Run \`no shutdown\` on the interface and confirm the link is cabled in the topology.",
      });
    }

    if (hops.includes("no link")) {
      hints.push({
        id: `pkt-${trace.packetId}-nolink`,
        severity: "warning",
        source: "packet",
        title: "No physical link",
        body: "The egress interface has no connected peer. Connect devices on the canvas (drag between interface handles) before expecting traffic.",
      });
    }

    if (hints.length === 0) {
      hints.push({
        id: `pkt-${trace.packetId}-generic`,
        severity: "warning",
        source: "packet",
        title: "Packet dropped",
        body: `Outcome: dropped. Last hops: ${trace.hops.slice(-3).map((h) => `${h.deviceId}: ${h.action}`).join(" → ") || "none"}. Open the Packets tab for the full hop list.`,
      });
    }
  }

  if (trace.outcome === "delivered" && trace.protocol === "ICMP") {
    hints.push({
      id: `pkt-${trace.packetId}-ok`,
      severity: "success",
      source: "packet",
      title: "End-to-end delivery confirmed",
      body: "This ICMP flow completed. Compare hop order with your expected L2/L3 path (host → switch → router → destination).",
    });
  }

  return hints;
}

const LAB_PLAYBOOKS: Record<
  string,
  { title: string; body: string }[]
> = {
  "basic-lan": [
    {
      title: "Basic LAN playbook",
      body: "Address R1 Gi0/0 and PC1, `no shutdown` both sides, then ping the router IP from PC1. Watch ARP in Capture before ICMP.",
    },
  ],
  "arp-icmp": [
    {
      title: "ARP & ICMP playbook",
      body: "Same subnet on PC1 and PC2 — no gateway needed. First ping triggers ARP; second ping should show ICMP only in Capture.",
    },
  ],
  "vlan-segment": [
    {
      title: "VLAN isolation playbook",
      body: "PC1→R1 should pass (same VLAN 10). PC1→PC2 must fail — different VLANs with no L3 path. Use `show vlan brief` to verify access VLANs.",
    },
  ],
  "trunk-vlan": [
    {
      title: "Trunk playbook",
      body: "Access VLAN 10 on host ports; Gi0/2 trunk on both switches with `switchport trunk allowed vlan add 10`. Cross-switch ping uses tagged frames on the trunk.",
    },
  ],
  "static-route": [
    {
      title: "Static route playbook",
      body: "On each router: LAN interface IP + `no shutdown`. On each PC: `ip default-gateway` pointing at its router. Reciprocal `ip route` statements on R1 and R2 for the remote LAN. Verify with `show ip route`.",
    },
  ],
  "ospf-basic": [
    {
      title: "OSPF area 0 playbook",
      body: "Address all interfaces and `no shutdown`. On each router: `router ospf 1`, `router-id`, and `network … area 0` for each LAN and the /30 link (wildcard 0.0.0.255 for /24, 0.0.0.3 for /30). Check `show ip ospf neighbor` for FULL before pinging.",
    },
  ],
  "dhcp-basic": [
    {
      title: "DHCP pool playbook",
      body: "On R1: interface IP + `no shutdown`, then `ip dhcp pool`, `network`, and `default-router`. On PC: `no shutdown` then `ip address dhcp`. Open Capture tab to see DISCOVER/OFFER/REQUEST/ACK traces.",
    },
  ],
  "stp-loop": [
    {
      title: "STP triangle playbook",
      body: "STP runs automatically — lowest switch ID (SW1) becomes root. Run `show spanning-tree` on SW2/SW3 to find the BLK port. Address both PCs on 192.168.1.0/24; ping proves traffic uses the loop-free tree.",
    },
  ],
  "acl-standard": [
    {
      title: "Standard ACL playbook",
      body: "Standard ACLs filter by source IP only — place near destination. Deny the source subnet, then `ip access-group 10 out` on Gi0/1 toward PC2. PC1→PC2 should fail; PC1→192.168.1.1 should still work. Use `show access-lists` to see hit counts.",
    },
  ],
  "inter-vlan-routing": [
    {
      title: "Router-on-a-stick playbook",
      body: "SW1: access VLANs on host ports, trunk to R1 allowing 10,20. R1: `interface Gi0/0.10` + `encapsulation dot1Q 10` + IP/no shut; repeat for .20. PCs need default gateway = matching subinterface .1. Ping across subnets proves L3 routing.",
    },
  ],
  "acl-extended": [
    {
      title: "Extended ACL playbook",
      body: "Extended ACLs match protocol + src + dst. Deny ICMP between subnets first, then `permit ip any any`. Apply on Gi0/1 outbound. PC1→PC2 ping fails (ICMP denied); PC1→192.168.1.1 still works. Check `show access-lists` for hit counts.",
    },
  ],
  "inter-vlan-svi": [
    {
      title: "SVI playbook",
      body: "Access VLANs on host ports. Create `interface Vlan10` / `Vlan20` with IP + no shut. Run `ip routing` once. PC default gateways = SVI .1 addresses. Ping across VLANs — traffic hairpins through the switch CPU, not an external router.",
    },
  ],
  "nat-basic": [
    {
      title: "NAT PAT playbook",
      body: "Gi0/0 = inside LAN, Gi0/1 = outside /30 link. `access-list 1 permit 192.168.1.0 0.0.0.255`, then `ip nat inside source list 1 interface Gi0/1 overload`. PC needs default gateway. Ping outside server — `show ip nat translations` shows the dynamic entry.",
    },
  ],
  "acl-tcp": [
    {
      title: "TCP port ACL playbook",
      body: "Extended ACL with `eq` port: deny tcp from PC1 subnet to PC2 host eq 80, then `permit ip any any`. Apply outbound on Gi0/1. TCP probe to :80 fails, :443 succeeds; ping (ICMP) still works.",
    },
  ],
};

function hintsForLab(labId: string | undefined): TutorHint[] {
  if (!labId) return [];
  const steps = LAB_PLAYBOOKS[labId];
  if (!steps) return [];
  return steps.map((s, i) => ({
    id: `lab-${labId}-${i}`,
    severity: "info" as const,
    source: "lab" as const,
    title: s.title,
    body: s.body,
  }));
}

export function deriveTutorHints(opts: {
  grade: GradeReport | null;
  selectedTrace: PacketTrace | null;
  traces: PacketTrace[];
  labTitle?: string;
  labId?: string | null;
}): TutorHint[] {
  const hints: TutorHint[] = [];
  const seen = new Set<string>();

  const push = (h: TutorHint) => {
    if (seen.has(h.id)) return;
    seen.add(h.id);
    hints.push(h);
  };

  for (const h of hintsForLab(opts.labId ?? undefined)) push(h);

  if (opts.grade) {
    for (const check of opts.grade.checks) {
      if (check.pass) continue;
      const h = hintFromFailedCheck(check);
      if (h) push(h);
    }

    if (opts.grade.passed) {
      push({
        id: "grade-passed",
        severity: "success",
        source: "grade",
        title: "Lab requirements met",
        body: `Score ${opts.grade.score}% — all checks passed. Try varying VLANs or adding a second subnet to reinforce the path.`,
      });
    } else if (opts.grade.checks.some((c) => !c.pass)) {
      push({
        id: "grade-submit-more",
        severity: "info",
        source: "grade",
        title: "Fix failing checks first",
        body: "Work through each FAIL item in the Score tab, then re-submit. Use “View hint” on a failed check or open Tutor for step-by-step tips.",
      });
    }
  }

  if (opts.selectedTrace) {
    for (const h of hintFromPacket(opts.selectedTrace)) push(h);
  } else {
    const lastDrop = [...opts.traces].reverse().find((t) => t.outcome === "dropped");
    if (lastDrop) {
      for (const h of hintFromPacket(lastDrop)) push(h);
    }
  }

  if (hints.length === 0) {
    push({
      id: "general-start",
      severity: "info",
      source: "general",
      title: opts.labTitle ? `Working on: ${opts.labTitle}` : "Getting started",
      body: "Run ping or traceroute from the Terminal, inspect hops in Packets/Capture, then Submit lab for graded hints. Select a dropped packet for root-cause tips.",
    });
  }

  return hints;
}
