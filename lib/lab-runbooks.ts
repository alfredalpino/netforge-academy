export interface LabRunbook {
  week: number;
  day: number;
  title: string;
  topology: string;
  steps: string[];
  verify: string[];
}

const LAB_RUNBOOKS: LabRunbook[] = [
  // WEEK 5 — VLANs
  {
    week: 5,
    day: 1,
    title: "VLAN Access Ports — Sales & Engineering",
    topology: "1x 2960 switch, 4 PCs (PC-A/B on VLAN 10, PC-C/D on VLAN 20)",
    steps: [
      "Add 2960 switch and 4 PCs in Packet Tracer",
      "Create VLAN 10 (name Sales) and VLAN 20 (name Engineering): vlan 10 / name Sales, vlan 20 / name Engineering",
      "Assign Fa0/1–Fa0/2 to VLAN 10: switchport mode access / switchport access vlan 10",
      "Assign Fa0/3–Fa0/4 to VLAN 20 on Fa0/3–Fa0/4",
      "Configure PC IPs: 192.168.10.10/24, .11/24 and 192.168.20.10/24, .11/24",
      "Ping PC-A → PC-B (same VLAN) and PC-A → PC-C (cross VLAN)",
    ],
    verify: [
      "show vlan brief — ports in correct VLANs",
      "Same-VLAN ping succeeds",
      "Cross-VLAN ping fails (no router yet)",
    ],
  },
  {
    week: 5,
    day: 2,
    title: "802.1Q Trunk Between Two Switches",
    topology: "2x 2960 switches, 2 PCs per switch (VLAN 10 + VLAN 20), trunk Gi0/1 ↔ Gi0/1",
    steps: [
      "Build two-switch topology with PCs on VLAN 10 and 20 on each switch",
      "Configure access ports on both switches for local VLANs",
      "On both switches: interface Gi0/1 → switchport trunk encapsulation dot1q → switchport mode trunk",
      "Set native VLAN 99 on both sides: switchport trunk native vlan 99",
      "Allow VLANs 10,20: switchport trunk allowed vlan 10,20",
      "Assign PC IPs in 192.168.10.0/24 and 192.168.20.0/24 subnets",
    ],
    verify: [
      "show interfaces trunk — operational trunk on both switches",
      "PC on SW1 VLAN 10 pings PC on SW2 VLAN 10",
      "Cross-VLAN still fails without L3 gateway",
    ],
  },
  {
    week: 5,
    day: 3,
    title: "Inter-VLAN Routing with SVIs",
    topology: "1x 3560 multilayer switch, VLAN 10 (192.168.10.0/24) + VLAN 20 (192.168.20.0/24), 2 PCs per VLAN",
    steps: [
      "Configure VLANs 10 and 20 with access ports for 4 PCs",
      "Create SVI: interface vlan 10 → ip address 192.168.10.1 255.255.255.0 → no shut",
      "Create SVI: interface vlan 20 → ip address 192.168.20.1 255.255.255.0 → no shut",
      "Enable L3 routing: ip routing",
      "Set PC gateways to respective SVI IPs (.1)",
      "Ping across VLANs: PC in VLAN 10 → PC in VLAN 20",
    ],
    verify: [
      "show ip interface brief — SVIs up/up with correct IPs",
      "show ip route — C routes for 192.168.10.0/24 and 192.168.20.0/24",
      "Full inter-VLAN connectivity from all PCs",
    ],
  },
  {
    week: 5,
    day: 4,
    title: "Router-on-a-Stick",
    topology: "1x 2960 L2 switch, 1x 2911 router, VLAN 10 + VLAN 20, trunk Gi0/0 on router",
    steps: [
      "Configure VLANs 10/20 and access ports on L2 switch",
      "Trunk switch Gi0/1 to router Gi0/0: switchport mode trunk on switch side",
      "Router subinterface: interface g0/0.10 → encapsulation dot1Q 10 → ip address 192.168.10.1 255.255.255.0",
      "Router subinterface: interface g0/0.20 → encapsulation dot1Q 20 → ip address 192.168.20.1 255.255.255.0",
      "Configure PC IPs and gateways pointing to router subinterface IPs",
      "Test inter-VLAN ping through router",
    ],
    verify: [
      "show ip interface brief on router — subinterfaces up",
      "show interfaces trunk on switch — Gi0/1 trunking",
      "traceroute across VLANs shows router as hop",
    ],
  },
  {
    week: 5,
    day: 5,
    title: "Integrated Multi-Switch VLAN Design",
    topology: "2x 2960 + 1x 3560 (or router), VLANs 10/20/99 (mgmt), 6 PCs, dual-switch trunk",
    steps: [
      "Design VLAN table: 10=Users, 20=Servers, 99=Management — document before configuring",
      "Configure access ports and trunks between both L2 switches",
      "Configure inter-VLAN routing via SVI on L3 switch OR ROAS on router",
      "Place management VLAN 99 on switch management interfaces",
      "Assign all PC IPs, gateways, and verify full mesh connectivity",
      "Run show vlan brief, show interfaces trunk, show ip route — screenshot all three",
    ],
    verify: [
      "All PCs reach gateway and cross-VLAN targets",
      "Trunk carries all required VLANs",
      "VLAN table in lab report matches running config",
    ],
  },

  // WEEK 6 — STP
  {
    week: 6,
    day: 1,
    title: "STP Triangle — Observe Blocked Port",
    topology: "3x 2960 switches in triangle (SW1–SW2–SW3–SW1), 1 PC per switch on access port",
    steps: [
      "Connect three switches in full triangle with Gi0/1, Gi0/2 links",
      "Leave STP at defaults — do not disable",
      "On each switch: show spanning-tree",
      "Identify root bridge, root ports, designated ports, and blocked port",
      "Assign PCs to VLAN 1 with IPs 10.0.0.10/24, .20/24, .30/24",
      "Ping all PCs — verify connectivity through active STP paths",
    ],
    verify: [
      "Exactly one blocked port in triangle",
      "All PCs ping despite redundant links",
      "Root bridge identified with lowest bridge ID",
    ],
  },
  {
    week: 6,
    day: 2,
    title: "Root Bridge Manipulation",
    topology: "Same 3-switch triangle from Day 1",
    steps: [
      "Record current root bridge and blocked port locations",
      "Set SW1 as root: spanning-tree vlan 1 root primary (or priority 4096)",
      "Re-run show spanning-tree on all three switches",
      "Document how blocked port moved after root change",
      "Set SW3 as root with priority 0 — observe election again",
      "Verify all PCs still reach each other after each change",
    ],
    verify: [
      "Root bridge matches configured switch",
      "Blocked port relocated predictably",
      "No connectivity loss after STP reconvergence",
    ],
  },
  {
    week: 6,
    day: 3,
    title: "RSTP Convergence Test",
    topology: "3-switch triangle, rapid-PVST enabled",
    steps: [
      "Enable RSTP on all switches: spanning-tree mode rapid-pvst",
      "Clear spanning-tree counters: clear spanning-tree detected-protocol interface all",
      "Verify port roles with show spanning-tree vlan 1",
      "Unplug the non-blocked link between SW1 and SW2",
      "Time reconvergence — alternate port should forward quickly",
      "Reconnect link and observe sync/proposal behavior in show spanning-tree detail",
    ],
    verify: [
      "show spanning-tree — RSTP (IEEE 802.1w) mode on all switches",
      "Reconvergence under 6 seconds (typically ~3 sec in PT)",
      "Blocked port transitions to forwarding after failure",
    ],
  },
  {
    week: 6,
    day: 4,
    title: "PortFast & BPDU Guard",
    topology: "1x 2960 switch, 1 PC on Fa0/1, spare switch or hub for BPDU test",
    steps: [
      "Connect PC to Fa0/1 — configure access port",
      "Enable PortFast: spanning-tree portfast on Fa0/1",
      "Verify port goes directly to forwarding: show spanning-tree interface Fa0/1 detail",
      "Enable BPDU Guard globally: spanning-tree portfast bpduguard default",
      "Connect a second switch to Fa0/1 (simulating rogue switch)",
      "Observe err-disabled state: show interfaces status",
    ],
    verify: [
      "PortFast port skips listening/learning on initial connect",
      "BPDU Guard err-disables port when switch connected",
      "Recovery: remove rogue switch, shut/no shut port",
    ],
  },
  {
    week: 6,
    day: 5,
    title: "LACP EtherChannel",
    topology: "2x 2960 switches, dual links Gi0/1 + Gi0/2 between them, PCs on each switch",
    steps: [
      "Connect two parallel links between SW1 Gi0/1–SW2 Gi0/1 and Gi0/2–Gi0/2",
      "Match speed/duplex on all member ports",
      "SW1: interface range gi0/1-2 → channel-group 1 mode active",
      "SW2: interface range gi0/1-2 → channel-group 1 mode passive",
      "Configure Port-channel 1 as trunk: switchport mode trunk",
      "Verify STP sees Po1 as single logical link: show spanning-tree",
      "Disconnect one member cable — ping should continue",
    ],
    verify: [
      "show etherchannel summary — Po1 in use (SU) with 2 active ports",
      "show spanning-tree — one logical interface, not two blocked links",
      "Connectivity survives single link failure",
    ],
  },
];

export function getLabRunbook(week: number, day: number): LabRunbook | undefined {
  return LAB_RUNBOOKS.find((r) => r.week === week && r.day === day);
}

export function getWeekLabRunbooks(week: number): LabRunbook[] {
  return LAB_RUNBOOKS.filter((r) => r.week === week);
}
