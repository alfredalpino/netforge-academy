export interface SubnetWorkedExample {
  id: string;
  title: string;
  given: string;
  steps: string[];
  answer: {
    network: string;
    broadcast: string;
    firstHost: string;
    lastHost: string;
    usableHosts: number;
  };
}

export interface VlsmWorkedExample {
  id: string;
  title: string;
  given: string;
  steps: string[];
  allocations: { name: string; network: string; prefix: number; usableHosts: number }[];
}

export const SUBNET_EXAMPLES: SubnetWorkedExample[] = [
  {
    id: "ex-24",
    title: "Classic /24",
    given: "192.168.10.45/24",
    steps: [
      "Mask /24 means the first three octets are the network: 192.168.10.0.",
      "Broadcast is the last address in the block: 192.168.10.255.",
      "Usable hosts are .1 through .254 (256 − 2 = 254).",
    ],
    answer: {
      network: "192.168.10.0",
      broadcast: "192.168.10.255",
      firstHost: "192.168.10.1",
      lastHost: "192.168.10.254",
      usableHosts: 254,
    },
  },
  {
    id: "ex-26",
    title: "Quarter of a /24 — /26",
    given: "10.0.0.70/26",
    steps: [
      "/26 creates blocks of 64 addresses (2^(32−26)).",
      "Block boundaries: .0, .64, .128, .192 — 70 falls in the .64 block.",
      "Network 10.0.0.64, broadcast 10.0.0.127, usable .65–.126 (62 hosts).",
    ],
    answer: {
      network: "10.0.0.64",
      broadcast: "10.0.0.127",
      firstHost: "10.0.0.65",
      lastHost: "10.0.0.126",
      usableHosts: 62,
    },
  },
  {
    id: "ex-30",
    title: "Point-to-point /30",
    given: "172.16.5.5/30",
    steps: [
      "/30 blocks are 4 addresses — typical router-to-router links.",
      "5 is in the .4 block (.4 network, .5 and .6 hosts, .7 broadcast).",
      "Usable hosts = 2.",
    ],
    answer: {
      network: "172.16.5.4",
      broadcast: "172.16.5.7",
      firstHost: "172.16.5.5",
      lastHost: "172.16.5.6",
      usableHosts: 2,
    },
  },
];

export const VLSM_EXAMPLE: VlsmWorkedExample = {
  id: "vlsm-ex-1",
  title: "Allocate largest first",
  given: "Base 192.168.1.0/24 — Sales 60 hosts, HR 20 hosts, Guest 10 hosts",
  steps: [
    "Sort by hosts descending: Sales (60) → needs /26 (62 usable).",
    "Sales: 192.168.1.0/26 (uses .0–.63).",
    "HR (20) → /27 (30 usable): next free block 192.168.1.64/27.",
    "Guest (10) → /28 (14 usable): next free 192.168.1.96/28.",
  ],
  allocations: [
    { name: "Sales", network: "192.168.1.0", prefix: 26, usableHosts: 62 },
    { name: "HR", network: "192.168.1.64", prefix: 27, usableHosts: 30 },
    { name: "Guest", network: "192.168.1.96", prefix: 28, usableHosts: 14 },
  ],
};

export const SUBNET_VIDEO_LINKS = [
  { href: "/topics/subnetting", label: "Subnetting lecture" },
  { href: "/topics/subnetting-part-2", label: "Part 2" },
  { href: "/topics/subnet-mask", label: "Subnet mask (intuition)" },
] as const;

export const VLSM_VIDEO_LINKS = [
  { href: "/topics/vlsm", label: "VLSM lecture" },
  { href: "/topics/subnetting", label: "Subnetting basics" },
] as const;
