/** Deterministic helpers for IPv4 / MAC (React-free). */

export function parseIpv4(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    const v = Number(p);
    if (v < 0 || v > 255) return null;
    n = (n << 8) | v;
  }
  return n >>> 0;
}

export function formatIpv4(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

export function ipv4InSubnet(ip: string, network: string, prefix: number): boolean {
  const a = parseIpv4(ip);
  const b = parseIpv4(network);
  if (a === null || b === null || prefix < 0 || prefix > 32) return false;
  if (prefix === 0) return true;
  const mask = prefix === 32 ? 0xffffffff : (~0 << (32 - prefix)) >>> 0;
  return (a & mask) === (b & mask);
}

export function networkAddress(ip: string, prefix: number): string | null {
  const n = parseIpv4(ip);
  if (n === null || prefix < 0 || prefix > 32) return null;
  if (prefix === 0) return "0.0.0.0";
  const mask = prefix === 32 ? 0xffffffff : (~0 << (32 - prefix)) >>> 0;
  return formatIpv4(n & mask);
}

export function macEqual(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export function isBroadcastMac(mac: string): boolean {
  return macEqual(mac, "ff:ff:ff:ff:ff:ff");
}

/** Deterministic MAC from seed + counter (labs use explicit MACs when possible). */
export function makeMac(seed: number, index: number): string {
  const n = (Math.imul(seed, 0x9e3779b1) ^ Math.imul(index + 1, 0x85ebca6b)) >>> 0;
  const bytes = [
    0x02, // locally administered unicast
    (n >>> 16) & 0xff,
    (n >>> 8) & 0xff,
    n & 0xff,
    (index >>> 8) & 0xff,
    index & 0xff,
  ];
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join(":");
}
