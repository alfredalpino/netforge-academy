import { ipv4InSubnet, networkAddress, parseIpv4, formatIpv4 } from "./net-utils";
import type {
  DhcpPool,
  NetworkDevice,
  NetworkLink,
  PacketTrace,
} from "./types";

function linkNeighbors(
  deviceId: string,
  links: Map<string, NetworkLink>,
): string[] {
  const out: string[] = [];
  for (const link of links.values()) {
    if (link.state !== "up") continue;
    if (link.a.deviceId === deviceId) out.push(link.b.deviceId);
    else if (link.b.deviceId === deviceId) out.push(link.a.deviceId);
  }
  return out;
}

/** Routers reachable from a host without crossing another router. */
export function reachableDhcpServers(
  hostId: string,
  devices: Map<string, NetworkDevice>,
  links: Map<string, NetworkLink>,
): NetworkDevice[] {
  const visited = new Set<string>();
  const queue = [hostId];
  const routers: NetworkDevice[] = [];

  while (queue.length) {
    const id = queue.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);

    const dev = devices.get(id);
    if (!dev) continue;

    if (dev.type === "router") {
      routers.push(dev);
      continue;
    }

    for (const neighborId of linkNeighbors(id, links)) {
      if (visited.has(neighborId)) continue;
      const neighbor = devices.get(neighborId);
      if (!neighbor) continue;
      if (neighbor.type === "router") {
        routers.push(neighbor);
      } else {
        queue.push(neighborId);
      }
    }
  }

  return routers;
}

function macEqual(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

export function allocateDhcpAddress(pool: DhcpPool, mac: string, routerIp: string): string | null {
  const existing = pool.leases.find((l) => macEqual(l.mac, mac));
  if (existing) return existing.ip;

  const reserved = new Set<string>([
    pool.network,
    networkAddress(pool.network, pool.prefixLength) ?? pool.network,
    routerIp,
    ...pool.leases.map((l) => l.ip),
  ]);

  // Offer .10–.254 in the subnet
  const base = networkAddress(pool.network, pool.prefixLength);
  if (!base) return null;
  const baseNum = parseIpv4(base);
  if (baseNum === null) return null;

  for (let host = 10; host <= 254; host++) {
    const candidate = formatIpv4((baseNum & 0xffffff00) | host);
    if (reserved.has(candidate)) continue;
    if (!ipv4InSubnet(candidate, pool.network, pool.prefixLength)) continue;
    pool.leases.push({ ip: candidate, mac });
    return candidate;
  }
  return null;
}

export function routerHasPoolInterface(router: NetworkDevice, pool: DhcpPool): boolean {
  return router.interfaces.some(
    (i) =>
      i.operationalStatus === "up" &&
      i.ipv4.some((a) => ipv4InSubnet(a.address, pool.network, pool.prefixLength)),
  );
}

export function findDhcpOffer(
  host: NetworkDevice,
  hostMac: string,
  devices: Map<string, NetworkDevice>,
  links: Map<string, NetworkLink>,
): { router: NetworkDevice; pool: DhcpPool; ip: string; gateway: string } | null {
  for (const router of reachableDhcpServers(host.id, devices, links)) {
    for (const pool of router.dhcpPools ?? []) {
      if (!routerHasPoolInterface(router, pool)) continue;
      const gw =
        pool.defaultRouter ||
        router.interfaces.find((i) =>
          i.ipv4.some((a) => ipv4InSubnet(a.address, pool.network, pool.prefixLength)),
        )?.ipv4[0]?.address;
      if (!gw) continue;
      const ip = allocateDhcpAddress(pool, hostMac, gw);
      if (ip) return { router, pool, ip, gateway: gw };
    }
  }
  return null;
}

export function buildDhcpTraces(
  hostId: string,
  routerId: string,
  ip: string,
  t: number,
  nextPacketId: () => string,
): PacketTrace[] {
  const steps: Array<{ summary: string; hops: Array<{ deviceId: string; action: string }> }> = [
    {
      summary: `DHCP DISCOVER (0.0.0.0 → 255.255.255.255)`,
      hops: [
        { deviceId: hostId, action: "UDP/68 broadcast DISCOVER" },
        { deviceId: routerId, action: "receive DISCOVER" },
      ],
    },
    {
      summary: `DHCP OFFER (server → ${ip})`,
      hops: [
        { deviceId: routerId, action: `OFFER yiaddr ${ip}` },
        { deviceId: hostId, action: "receive OFFER" },
      ],
    },
    {
      summary: `DHCP REQUEST (request ${ip})`,
      hops: [
        { deviceId: hostId, action: "UDP/68 broadcast REQUEST" },
        { deviceId: routerId, action: "receive REQUEST" },
      ],
    },
    {
      summary: `DHCP ACK (assigned ${ip})`,
      hops: [
        { deviceId: routerId, action: `ACK yiaddr ${ip}` },
        { deviceId: hostId, action: "bound address" },
      ],
    },
  ];

  return steps.map((step, idx) => ({
    packetId: nextPacketId(),
    protocol: "DHCP",
    summary: step.summary,
    hops: step.hops.map((h, hopIdx) => ({
      t: t + idx * 4 + hopIdx,
      deviceId: h.deviceId,
      action: h.action,
    })),
    outcome: "delivered" as const,
  }));
}

export function upsertDhcpPool(
  device: NetworkDevice,
  name: string,
): DhcpPool {
  if (!device.dhcpPools) device.dhcpPools = [];
  let pool = device.dhcpPools.find((p) => p.name === name);
  if (!pool) {
    pool = {
      name,
      network: "0.0.0.0",
      prefixLength: 24,
      defaultRouter: "",
      leases: [],
    };
    device.dhcpPools.push(pool);
  }
  return pool;
}

export function maskToPrefix(mask: string): number | null {
  const n = parseIpv4(mask);
  if (n === null) return null;
  let bits = 0;
  for (let i = 31; i >= 0; i--) {
    if (n & (1 << i)) bits++;
    else break;
  }
  return bits;
}
