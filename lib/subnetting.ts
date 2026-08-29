export interface SubnetQuestion {
  ip: string;
  prefix: number;
  answer: SubnetAnswer;
}

export interface SubnetAnswer {
  network: string;
  broadcast: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
}

function ipToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let result = 0;
  for (const octet of parts) {
    const n = parseInt(octet, 10);
    if (Number.isNaN(n) || n < 0 || n > 255) return null;
    result = (result << 8) + n;
  }
  return result >>> 0;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

export function calculateSubnet(ip: string, prefix: number): SubnetAnswer {
  if (prefix < 0 || prefix > 32) {
    throw new RangeError("Prefix must be between 0 and 32");
  }
  const ipInt = ipToInt(ip);
  if (ipInt === null) {
    throw new RangeError("Invalid IP address");
  }
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const networkInt = (ipInt & mask) >>> 0;
  const broadcastInt = (networkInt | (~mask >>> 0)) >>> 0;
  const totalHosts = 2 ** (32 - prefix);
  const usableHosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : totalHosts - 2;

  return {
    network: intToIp(networkInt),
    broadcast: intToIp(broadcastInt),
    firstHost: prefix >= 31 ? intToIp(networkInt) : intToIp(networkInt + 1),
    lastHost: prefix >= 31 ? intToIp(broadcastInt) : intToIp(broadcastInt - 1),
    totalHosts,
    usableHosts,
  };
}

function randomOctet(): number {
  return Math.floor(Math.random() * 256);
}

export function generateSubnetQuestion(): SubnetQuestion {
  const prefixes = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const ip = `${randomOctet()}.${randomOctet()}.${randomOctet()}.${randomOctet()}`;
  return { ip, prefix, answer: calculateSubnet(ip, prefix) };
}

export function checkAnswer(
  user: Partial<SubnetAnswer>,
  correct: SubnetAnswer
): { field: string; correct: boolean }[] {
  return [
    { field: "Network", correct: user.network?.trim() === correct.network },
    { field: "Broadcast", correct: user.broadcast?.trim() === correct.broadcast },
    { field: "First Host", correct: user.firstHost?.trim() === correct.firstHost },
    { field: "Last Host", correct: user.lastHost?.trim() === correct.lastHost },
    { field: "Usable Hosts", correct: user.usableHosts === correct.usableHosts },
  ];
}

export function isFullyCorrect(user: Partial<SubnetAnswer>, correct: SubnetAnswer): boolean {
  return checkAnswer(user, correct).every((r) => r.correct);
}

// --- VLSM ---

export interface VlsmRequirement {
  name: string;
  hostsNeeded: number;
}

export interface VlsmSubnetAssignment {
  name: string;
  network: string;
  prefix: number;
  usableHosts: number;
}

export interface VlsmQuestion {
  baseNetwork: string;
  basePrefix: number;
  requirements: VlsmRequirement[];
  answer: VlsmSubnetAssignment[];
}

const VLSM_DEPARTMENTS = [
  "Engineering",
  "Sales",
  "Marketing",
  "HR",
  "Guest WiFi",
  "VoIP",
  "Servers",
  "Warehouse",
] as const;

const VLSM_HOST_COUNTS = [10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 120];

function prefixForHosts(hostsNeeded: number): number {
  if (hostsNeeded <= 0) {
    throw new RangeError("hostsNeeded must be positive");
  }
  const needed = hostsNeeded + 2;
  const hostBits = Math.ceil(Math.log2(needed));
  return 32 - hostBits;
}

function allocateVlsm(
  baseNetwork: string,
  basePrefix: number,
  requirements: VlsmRequirement[]
): VlsmSubnetAssignment[] | null {
  const baseInt = ipToInt(baseNetwork);
  if (baseInt === null) return null;

  const baseSize = 2 ** (32 - basePrefix);
  const sorted = [...requirements].sort((a, b) => b.hostsNeeded - a.hostsNeeded);

  let offset = 0;
  const assignments: VlsmSubnetAssignment[] = [];

  for (const req of sorted) {
    const prefix = prefixForHosts(req.hostsNeeded);
    const subnetSize = 2 ** (32 - prefix);

    if (offset % subnetSize !== 0) {
      offset = Math.ceil(offset / subnetSize) * subnetSize;
    }

    if (offset + subnetSize > baseSize) return null;

    const networkInt = (baseInt + offset) >>> 0;
    const network = intToIp(networkInt);
    const subnet = calculateSubnet(network, prefix);

    assignments.push({
      name: req.name,
      network,
      prefix,
      usableHosts: subnet.usableHosts,
    });

    offset += subnetSize;
  }

  return assignments;
}

const VLSM_FALLBACK: VlsmQuestion = {
  baseNetwork: "192.168.10.0",
  basePrefix: 24,
  requirements: [
    { name: "Engineering", hostsNeeded: 100 },
    { name: "Sales", hostsNeeded: 50 },
    { name: "HR", hostsNeeded: 25 },
    { name: "Guest WiFi", hostsNeeded: 10 },
  ],
  answer: [
    { name: "Engineering", network: "192.168.10.0", prefix: 25, usableHosts: 126 },
    { name: "Sales", network: "192.168.10.128", prefix: 26, usableHosts: 62 },
    { name: "HR", network: "192.168.10.192", prefix: 27, usableHosts: 30 },
    { name: "Guest WiFi", network: "192.168.10.224", prefix: 28, usableHosts: 14 },
  ],
};

export function generateVlsmQuestion(): VlsmQuestion {
  for (let attempt = 0; attempt < 100; attempt++) {
    const basePrefix = Math.random() < 0.7 ? 24 : 23;
    const baseNetwork =
      basePrefix === 24
        ? `192.168.${Math.floor(Math.random() * 256)}.0`
        : `10.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.0`;

    const deptCount = 3 + Math.floor(Math.random() * 2);
    const departments = [...VLSM_DEPARTMENTS].sort(() => Math.random() - 0.5);
    const requirements: VlsmRequirement[] = [];

    for (let i = 0; i < deptCount; i++) {
      requirements.push({
        name: departments[i],
        hostsNeeded: VLSM_HOST_COUNTS[Math.floor(Math.random() * VLSM_HOST_COUNTS.length)],
      });
    }

    const answer = allocateVlsm(baseNetwork, basePrefix, requirements);
    if (answer) {
      return { baseNetwork, basePrefix, requirements, answer };
    }
  }

  return VLSM_FALLBACK;
}

export function checkVlsmAnswer(
  user: VlsmSubnetAssignment[],
  correct: VlsmSubnetAssignment[]
): { name: string; correct: boolean }[] {
  return correct.map((expected) => {
    const match = user.find((a) => a.name === expected.name);
    const isCorrect =
      match?.network?.trim() === expected.network && match?.prefix === expected.prefix;
    return { name: expected.name, correct: !!isCorrect };
  });
}

export function isVlsmFullyCorrect(
  user: VlsmSubnetAssignment[],
  correct: VlsmSubnetAssignment[]
): boolean {
  return checkVlsmAnswer(user, correct).every((r) => r.correct);
}
