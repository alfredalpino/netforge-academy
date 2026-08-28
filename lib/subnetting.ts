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

function ipToInt(ip: string): number {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

function intToIp(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

export function calculateSubnet(ip: string, prefix: number): SubnetAnswer {
  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const ipInt = ipToInt(ip);
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
