import type { CertificationGate, Phase } from "./types";

export const LEARNING_LOOP = [
  { step: "theory", label: "Theory", description: "Architecture, protocols, packet behavior" },
  { step: "packet-flow", label: "Packet Flow", description: "Trace PDUs through the stack" },
  { step: "configuration", label: "Configuration", description: "CLI on Cisco, Linux, FortiOS, Azure" },
  { step: "lab", label: "Lab", description: "Build — not watch" },
  { step: "break-it", label: "Break It", description: "Introduce intentional failures" },
  { step: "troubleshoot", label: "Troubleshoot", description: "Systematic diagnosis" },
  { step: "design", label: "Design", description: "Architecture decisions" },
  { step: "explain", label: "Explain", description: "Teach it from memory" },
] as const;

export const PRIORITY_CONCEPTS = [
  "Ethernet",
  "MAC",
  "ARP",
  "IPv4",
  "Subnetting",
  "TCP/UDP",
  "VLAN",
  "Trunk",
  "STP",
  "Routing",
  "OSPF",
];

export const PHASES: Phase[] = [
  {
    id: "phase-0",
    number: 0,
    title: "Engineering Foundation",
    weeks: "Week 1",
    objective: "Linux/CLI/lab environment mastery",
    modules: [
      {
        id: "m0-foundation",
        title: "Engineering Foundations",
        phaseId: "phase-0",
        depth: "L2",
        competency: "Operate the environment where networking happens",
        topics: [
          "Linux fundamentals",
          "Windows networking",
          "CLI navigation",
          "SSH & virtual machines",
          "Virtual NICs, bridges, TAP/TUN",
          "Basic Bash, PowerShell, Python",
        ],
        commands: [
          "ip addr", "ip route", "ip neigh", "ping", "traceroute", "ss", "dig", "curl", "tcpdump", "arp", "nmap",
          "ipconfig", "route", "tracert", "Test-NetConnection",
        ],
        labObjective: "Build Ubuntu VM + Windows/Linux VM on virtual network. Investigate IP, routing, ARP, DNS, TCP.",
        exitCriteria: [
          "Explain every line of ip addr, ip route, ip neigh, ss -tulpn",
          "Capture and identify Ethernet → ARP → IPv4 → TCP → TLS → HTTP in Wireshark",
        ],
      },
    ],
  },
  {
    id: "phase-1",
    number: 1,
    title: "Network Fundamentals",
    weeks: "Weeks 2–4",
    objective: "OSI, Ethernet, TCP/IP, subnetting",
    modules: [
      {
        id: "m1-architecture",
        title: "Network Architecture",
        phaseId: "phase-1",
        depth: "L4",
        competency: "Explain encapsulation and the three planes",
        topics: [
          "OSI & TCP/IP models", "Encapsulation/decapsulation", "PDU terminology",
          "Control/data/management planes", "Broadcast/multicast/unicast",
          "Collision & broadcast domains",
        ],
        exitCriteria: ["Explain layer behavior without OSI mnemonics"],
      },
      {
        id: "m2-ethernet",
        title: "Ethernet & Switching Basics",
        phaseId: "phase-1",
        depth: "L4",
        competency: "Understand what a switch actually does",
        topics: [
          "Ethernet frame", "MAC addresses", "EtherType", "MTU", "Duplex/speed",
          "Frame learn → lookup → forward/filter/flood",
        ],
        labObjective: "Two-switch LAN + Wireshark capture of Ethernet, ARP, ICMP, TCP",
      },
      {
        id: "m3-subnetting",
        title: "IP Addressing & Subnetting",
        phaseId: "phase-1",
        depth: "L4",
        competency: "Instant subnet math without calculator",
        topics: [
          "IPv4 binary/decimal", "CIDR, VLSM, FLSM", "Route summarization",
          "IPv6 structure, SLAAC, NDP, DHCPv6",
        ],
        exitCriteria: ["Given 10.27.84.193/21 — network, broadcast, host range instantly"],
      },
      {
        id: "m4-tcpip",
        title: "Core TCP/IP Protocols",
        phaseId: "phase-1",
        depth: "L4",
        competency: "Trace protocol behavior end-to-end",
        topics: [
          "ARP, ICMP, TCP, UDP", "Three-way handshake, flags, windows",
          "DNS, DHCP, HTTP/HTTPS, SSH",
        ],
        labObjective: "Run ping, curl, dig, ssh while capturing in Wireshark",
      },
    ],
  },
  {
    id: "phase-2",
    number: 2,
    title: "Layer 2 / Switching",
    weeks: "Weeks 5–7",
    objective: "VLAN, trunk, STP, EtherChannel",
    modules: [
      {
        id: "m5-vlan",
        title: "VLANs",
        phaseId: "phase-2",
        depth: "L4",
        competency: "Design and troubleshoot VLAN segmentation",
        topics: [
          "Access/trunk ports", "802.1Q", "Native VLAN", "Inter-VLAN routing",
          "Router-on-a-stick", "SVIs",
        ],
        labObjective: "Core/L3 switch with VLAN 10 & 20, PCs on each",
        breakScenarios: ["VLAN mismatch", "trunk mismatch", "wrong native VLAN", "missing SVI"],
      },
      {
        id: "m6-stp",
        title: "STP & Layer-2 Resiliency",
        phaseId: "phase-2",
        depth: "L4",
        competency: "Understand why loops are dangerous",
        topics: [
          "STP/RSTP", "Root bridge/port", "BPDU", "PortFast, BPDU Guard",
          "Root Guard, Loop Guard", "EtherChannel, LACP",
        ],
        labObjective: "Triangle topology — create loop, observe STP, break and fix",
      },
    ],
  },
  {
    id: "phase-3",
    number: 3,
    title: "Layer 3 / Routing",
    weeks: "Weeks 8–11",
    objective: "Static routing, OSPF, advanced routing",
    modules: [
      {
        id: "m7-routing",
        title: "Routing Fundamentals",
        phaseId: "phase-3",
        depth: "L4",
        competency: "Longest prefix match & control vs data plane",
        topics: [
          "Routing table", "Static/default routes", "Admin distance, metric",
          "Recursive lookup", "Control plane vs data plane",
        ],
      },
      {
        id: "m8-ospf",
        title: "OSPF",
        phaseId: "phase-3",
        depth: "L4",
        competency: "Neighbor → adjacency → LSDB → SPF → forwarding",
        topics: [
          "Link-state routing", "LSAs, LSDB, SPF", "Areas, DR/BDR",
          "Network types, authentication, summarization",
        ],
        breakScenarios: ["Area mismatch", "auth mismatch", "passive interface", "MTU mismatch"],
      },
      {
        id: "m9-advanced-routing",
        title: "Advanced Routing",
        phaseId: "phase-3",
        depth: "L3-L4",
        competency: "Route redistribution and BGP fundamentals",
        topics: [
          "Route redistribution", "Route filtering", "PBR",
          "Floating static", "ECMP", "BGP fundamentals",
        ],
      },
    ],
  },
  {
    id: "phase-4",
    number: 4,
    title: "Network Services + Enterprise",
    weeks: "Weeks 12–14",
    objective: "DNS, DHCP, NAT, WAN, wireless, QoS",
    modules: [
      {
        id: "m10-services",
        title: "Network Services",
        phaseId: "phase-4",
        depth: "L3",
        competency: "Deploy and troubleshoot core services",
        topics: ["DNS", "DHCP", "NTP", "SNMP", "Syslog", "AAA"],
      },
      {
        id: "m11-wan",
        title: "WAN & Internet",
        phaseId: "phase-4",
        depth: "L3",
        competency: "NAT and WAN connectivity",
        topics: ["NAT/PAT", "WAN technologies", "MPLS concepts", "SD-WAN"],
      },
      {
        id: "m12-wireless-qos",
        title: "Wireless & QoS",
        phaseId: "phase-4",
        depth: "L3",
        competency: "802.11 and traffic engineering basics",
        topics: ["802.11, RF, WLAN auth", "Classification, marking, queuing, shaping"],
      },
    ],
  },
  {
    id: "phase-5",
    number: 5,
    title: "Network Security + Fortinet",
    weeks: "Weeks 15–18",
    objective: "Security+, ACLs, firewall, VPN",
    modules: [
      {
        id: "m13-security-fundamentals",
        title: "Security Fundamentals",
        phaseId: "phase-5",
        depth: "L3",
        competency: "CIA, threats, cryptography, PKI",
        topics: ["Threats & vulnerabilities", "IAM", "Cryptography", "PKI", "Incident response"],
      },
      {
        id: "m14-network-security",
        title: "Network Security",
        phaseId: "phase-5",
        depth: "L4",
        competency: "ACLs, segmentation, NAC, L2 security",
        topics: ["ACLs", "Network segmentation", "NAC", "L2 security features"],
      },
      {
        id: "m15-firewall-vpn",
        title: "Firewalls & VPN",
        phaseId: "phase-5",
        depth: "L4",
        competency: "Stateful inspection and secure connectivity",
        topics: ["NGFW policies", "UTM", "IPsec", "TLS VPN", "Site-to-site & remote access"],
      },
      {
        id: "m16-fortinet",
        title: "Fortinet NSE 4",
        phaseId: "phase-5",
        depth: "L4",
        competency: "FortiGate end-to-end administration",
        topics: [
          "Interfaces → routing → policies → NAT → security profiles",
          "Logging → VPN → HA",
        ],
      },
    ],
  },
  {
    id: "phase-6",
    number: 6,
    title: "Enterprise Architecture + Automation",
    weeks: "Weeks 20–23",
    objective: "Architecture, HA, monitoring, automation, SDN",
    modules: [
      {
        id: "m17-enterprise",
        title: "Enterprise Networking",
        phaseId: "phase-6",
        depth: "L4",
        competency: "Redundancy, HA, load balancing design",
        topics: ["Enterprise architecture", "Redundancy", "HA", "Load balancing"],
      },
      {
        id: "m18-monitoring",
        title: "Monitoring & Troubleshooting",
        phaseId: "phase-6",
        depth: "L4",
        competency: "Telemetry and systematic methodology",
        topics: ["SNMP, NetFlow, telemetry", "Packet analysis", "Troubleshooting methodology"],
      },
      {
        id: "m19-automation",
        title: "Automation & SDN",
        phaseId: "phase-6",
        depth: "L3",
        competency: "APIs, Python, Ansible, IaC",
        topics: ["REST APIs", "JSON", "Python", "Ansible", "VXLAN/overlay concepts"],
      },
    ],
  },
  {
    id: "phase-7",
    number: 7,
    title: "Cloud + Azure Administration",
    weeks: "Weeks 24–25",
    objective: "Azure administration (AZ-104)",
    modules: [
      {
        id: "m20-cloud",
        title: "Cloud Fundamentals",
        phaseId: "phase-7",
        depth: "L3",
        competency: "Cloud models and cloud networking concepts",
        topics: ["IaaS/PaaS/SaaS", "Virtualization", "Cloud networking basics"],
      },
      {
        id: "m21-azure-admin",
        title: "Azure Administration",
        phaseId: "phase-7",
        depth: "L3",
        competency: "Deploy and manage Azure resources",
        topics: [
          "Resources, IAM, VMs, storage", "VNets basics", "Monitoring, governance",
          "Azure CLI, PowerShell, Bicep",
        ],
      },
    ],
  },
  {
    id: "phase-8",
    number: 8,
    title: "Azure Networking + L3 Engineering",
    weeks: "Weeks 26–28",
    objective: "AZ-700 and hybrid architecture",
    modules: [
      {
        id: "m22-azure-networking",
        title: "Azure Networking",
        phaseId: "phase-8",
        depth: "L4",
        competency: "VNets, routing, NSGs, DNS, peering",
        topics: ["VNet design", "Route tables", "NSGs", "Azure DNS", "VNet peering"],
      },
      {
        id: "m23-azure-connectivity",
        title: "Azure Connectivity & Security",
        phaseId: "phase-8",
        depth: "L4",
        competency: "Hybrid connectivity and private access",
        topics: ["VPN Gateway", "ExpressRoute", "Azure Firewall", "Private Link"],
      },
      {
        id: "m24-azure-delivery",
        title: "Application Delivery & Capstone",
        phaseId: "phase-8",
        depth: "L4",
        competency: "LB, App Gateway, Front Door, hybrid troubleshooting",
        topics: [
          "Load Balancer", "Application Gateway", "Front Door", "Traffic Manager", "WAF",
          "Full hybrid capstone with intentional failures",
        ],
      },
    ],
  },
];

export const CERTIFICATION_GATES: CertificationGate[] = [
  {
    id: "ccna",
    name: "CCNA",
    order: 1,
    prerequisites: ["Phase 0–3 complete", "Subnetting at speed", "Wireshark proficiency"],
    competencies: [
      "Subnet quickly", "Configure VLANs, trunks, STP, EtherChannel",
      "Static routing & OSPF", "ACLs, DHCP, NAT", "IPv6 basics",
      "Wireshark analysis", "Systematic troubleshooting",
    ],
  },
  {
    id: "security-plus",
    name: "Security+",
    order: 2,
    prerequisites: ["Phase 5 security fundamentals"],
    competencies: [
      "Threats, vulnerabilities, cryptography", "IAM, PKI", "Network security",
      "Secure architecture", "Incident response", "Risk management",
    ],
  },
  {
    id: "nse4",
    name: "NSE 4 (FortiOS 7.6)",
    order: 3,
    prerequisites: ["Phase 5 Fortinet module"],
    competencies: [
      "FortiGate interfaces & routing", "Firewall policies & NAT",
      "Security profiles & logging", "IPsec VPN", "High availability",
    ],
  },
  {
    id: "az104",
    name: "AZ-104",
    order: 4,
    prerequisites: ["Phase 7 complete"],
    competencies: [
      "Azure resources, identities, VMs, storage", "VNets, monitoring, governance",
      "Azure CLI, PowerShell, Bicep",
    ],
  },
  {
    id: "az700",
    name: "AZ-700",
    order: 5,
    prerequisites: ["AZ-104 + strong networking foundation"],
    competencies: [
      "VNet, subnets, routing, DNS, NSG design", "VPN, ExpressRoute, Firewall",
      "Peering, Private Link", "LB, App Gateway, Front Door, WAF", "Hybrid architecture",
    ],
  },
];

export const LAB_STACK = [
  { name: "Cisco Packet Tracer", use: "CCNA, VLAN, STP, routing, OSPF, ACL, basic services", tier: "essential" },
  { name: "EVE-NG", use: "Enterprise lab — IOSv, IOSvL2, Linux, FortiGate", tier: "essential" },
  { name: "Wireshark", use: "Mandatory packet analysis", tier: "essential" },
  { name: "Ubuntu/Debian VM", use: "Linux networking commands", tier: "essential" },
  { name: "Windows VM", use: "Windows networking tools", tier: "essential" },
  { name: "FortiGate VM", use: "NSE 4 lab practice", tier: "advanced" },
  { name: "Azure", use: "AZ-104 & AZ-700 hands-on", tier: "advanced" },
  { name: "Python + Ansible", use: "Automation phase", tier: "advanced" },
];

export function getPhase(id: string): Phase | undefined {
  return PHASES.find((p) => p.id === id);
}

export function getModule(id: string) {
  for (const phase of PHASES) {
    const mod = phase.modules.find((m) => m.id === id);
    if (mod) return { phase, module: mod };
  }
  return undefined;
}

export function getTotalModules(): number {
  return PHASES.reduce((sum, p) => sum + p.modules.length, 0);
}
