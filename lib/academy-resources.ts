import { getTopicsForModule, type TopicVideo } from "./topic-videos";

export interface SimulatorLabLink {
  id: string;
  title: string;
  summary: string;
  /** Curriculum modules this lab reinforces */
  moduleIds: string[];
}

/** Browser simulator labs — deep-link via /simulator?lab=<id> */
export const SIMULATOR_LABS: SimulatorLabLink[] = [
  {
    id: "arp-icmp",
    title: "ARP & ICMP (Host-to-Host)",
    summary:
      "Two hosts on one subnet — configure IPs and ping; trace ARP resolution and ICMP in the Packets tab.",
    moduleIds: ["m2-ethernet", "m4-tcpip"],
  },
  {
    id: "vlan-segment",
    title: "VLAN Segmentation",
    summary: "Access VLANs, trunk ports, and isolation across a switched topology.",
    moduleIds: ["m5-vlan"],
  },
  {
    id: "trunk-vlan",
    title: "802.1Q Trunk Between Switches",
    summary:
      "Extend VLAN 10 across an 802.1Q trunk so hosts on different switches reach each other.",
    moduleIds: ["m5-vlan"],
  },
  {
    id: "static-route",
    title: "Static Inter-Network Routing",
    summary:
      "Two routers, two LANs — static routes on both sides for end-to-end connectivity across subnets.",
    moduleIds: ["m7-routing"],
  },
  {
    id: "ospf-basic",
    title: "OSPF Single-Area Routing",
    summary:
      "Two routers, two LANs — OSPF area 0 adjacency replaces static routes for inter-network reachability.",
    moduleIds: ["m8-ospf", "m7-routing"],
  },
  {
    id: "dhcp-basic",
    title: "DHCP Address Assignment",
    summary:
      "Router DHCP pool on a switched LAN — host uses `ip address dhcp` and traces DORA in Capture.",
    moduleIds: ["m10-services", "m4-tcpip"],
  },
  {
    id: "inter-vlan-svi",
    title: "Inter-VLAN Routing (SVI)",
    summary:
      "Multilayer switch SVIs — default gateway per VLAN with `ip routing`, no external router.",
    moduleIds: ["m5-vlan", "m7-routing"],
  },
  {
    id: "acl-tcp",
    title: "Extended ACL TCP Port Filter",
    summary:
      "Deny TCP destination port 80 while permitting HTTPS (443) and ICMP — extended ACL with eq port matching.",
    moduleIds: ["m14-network-security"],
  },
  {
    id: "nat-basic",
    title: "NAT PAT Overload",
    summary:
      "Inside/outside interfaces + ACL — PAT overload lets private hosts reach the public side via router outside IP.",
    moduleIds: ["m10-services", "m14-network-security"],
  },
  {
    id: "acl-extended",
    title: "Extended ACL (ICMP Filter)",
    summary:
      "Extended ACL 100 — deny ICMP between two subnets while permitting other IP traffic.",
    moduleIds: ["m14-network-security"],
  },
  {
    id: "inter-vlan-routing",
    title: "Inter-VLAN Routing (Router-on-a-Stick)",
    summary:
      "802.1Q subinterfaces on a router — route between VLAN 10 and VLAN 20 via a trunk to the switch.",
    moduleIds: ["m5-vlan", "m7-routing"],
  },
  {
    id: "acl-standard",
    title: "Standard ACL Traffic Filter",
    summary:
      "Block one subnet from reaching another — create numbered ACL and apply outbound near the destination.",
    moduleIds: ["m14-network-security"],
  },
  {
    id: "stp-loop",
    title: "Spanning Tree Loop Prevention",
    summary:
      "Switch triangle with a redundant link — STP blocks one port; verify with `show spanning-tree` and PC ping.",
    moduleIds: ["m6-stp"],
  },
  {
    id: "basic-lan",
    title: "Basic LAN Connectivity",
    summary: "Address a router and host through a switch, then grade a live ping.",
    moduleIds: [
      "m0-foundation",
      "m1-architecture",
      "m2-ethernet",
      "m3-subnetting",
      "m4-tcpip",
    ],
  },
];

export interface ModuleAcademyResources {
  moduleId: string;
  /** Featured topic video for this module, if any */
  topic: TopicVideo | undefined;
  /** All topic videos tied to this module */
  topics: TopicVideo[];
  /** Best-matched simulator lab, if any */
  simulatorLab: SimulatorLabLink | undefined;
}

export function getSimulatorLabForModule(moduleId: string): SimulatorLabLink | undefined {
  return SIMULATOR_LABS.find((lab) => lab.moduleIds.includes(moduleId));
}

export function getSimulatorLabHref(labId: string): string {
  return `/simulator?lab=${labId}`;
}

export function getModuleAcademyResources(moduleId: string): ModuleAcademyResources {
  const topics = getTopicsForModule(moduleId);
  return {
    moduleId,
    topic: topics[0],
    topics,
    simulatorLab: getSimulatorLabForModule(moduleId),
  };
}
