import { networkAddress, parseIpv4 } from "./net-utils";
import type {
  NetworkDevice,
  NetworkInterface,
  NetworkLink,
  OspfProcess,
  RouteEntry,
} from "./types";

export const OSPF_ADMIN_DISTANCE = 110;

/** Cisco-style wildcard: (ip & ~wildcard) === (network & ~wildcard). */
export function matchesOspfWildcard(
  ip: string,
  network: string,
  wildcard: string,
): boolean {
  const ipN = parseIpv4(ip);
  const netN = parseIpv4(network);
  const wildN = parseIpv4(wildcard);
  if (ipN === null || netN === null || wildN === null) return false;
  return (ipN & ~wildN) === (netN & ~wildN);
}

export function ifaceOspfArea(
  device: NetworkDevice,
  iface: NetworkInterface,
  process: OspfProcess,
): number | null {
  if (iface.adminStatus !== "up" || iface.operationalStatus !== "up") return null;
  const ip = iface.ipv4[0]?.address;
  if (!ip) return null;
  for (const stmt of process.networks) {
    if (matchesOspfWildcard(ip, stmt.network, stmt.wildcard)) {
      return stmt.area;
    }
  }
  return null;
}

function linkEndpoints(
  link: NetworkLink,
  devices: Map<string, NetworkDevice>,
): Array<{ device: NetworkDevice; iface: NetworkInterface }> | null {
  const aDev = devices.get(link.a.deviceId);
  const bDev = devices.get(link.b.deviceId);
  if (!aDev || !bDev) return null;
  const aIface = aDev.interfaces.find((i) => i.id === link.a.interfaceId);
  const bIface = bDev.interfaces.find((i) => i.id === link.b.interfaceId);
  if (!aIface || !bIface) return null;
  return [
    { device: aDev, iface: aIface },
    { device: bDev, iface: bIface },
  ];
}

function connectedNetworks(device: NetworkDevice): RouteEntry[] {
  const routes: RouteEntry[] = [];
  for (const iface of device.interfaces) {
    if (iface.adminStatus !== "up" || iface.operationalStatus !== "up") continue;
    for (const ip of iface.ipv4) {
      const net = networkAddress(ip.address, ip.prefixLength);
      if (!net) continue;
      routes.push({
        network: net,
        prefixLength: ip.prefixLength,
        nextHop: null,
        ifaceId: iface.id,
        metric: 0,
        kind: "connected",
      });
    }
  }
  return routes;
}

function hasConnectedRoute(device: NetworkDevice, network: string, prefixLength: number): boolean {
  return device.runtime.routingTable.some(
    (r) =>
      r.kind === "connected" &&
      r.network === network &&
      r.prefixLength === prefixLength,
  );
}

/** Recompute OSPF adjacencies and inter-router routes for all routers. */
export function rebuildAllOspfRoutes(
  devices: Map<string, NetworkDevice>,
  links: Map<string, NetworkLink>,
): void {
  for (const device of devices.values()) {
    if (device.type !== "router") continue;
    device.runtime.routingTable = device.runtime.routingTable.filter((r) => r.kind !== "ospf");
    device.ospfNeighbors = [];
  }

  for (const link of links.values()) {
    if (link.state !== "up") continue;
    const endpoints = linkEndpoints(link, devices);
    if (!endpoints || endpoints.length !== 2) continue;

    const [left, right] = endpoints;
    if (left.device.type !== "router" || right.device.type !== "router") continue;

    const leftOspf = left.device.ospf;
    const rightOspf = right.device.ospf;
    if (!leftOspf || !rightOspf) continue;

    const leftArea = ifaceOspfArea(left.device, left.iface, leftOspf);
    const rightArea = ifaceOspfArea(right.device, right.iface, rightOspf);
    if (leftArea === null || rightArea === null || leftArea !== rightArea) continue;

    const leftIp = left.iface.ipv4[0]?.address;
    const rightIp = right.iface.ipv4[0]?.address;
    if (!leftIp || !rightIp) continue;

    const leftRid = leftOspf.routerId ?? leftIp;
    const rightRid = rightOspf.routerId ?? rightIp;

    left.device.ospfNeighbors!.push({
      neighborId: rightRid,
      address: rightIp,
      interfaceId: left.iface.id,
      interfaceName: left.iface.name,
      state: "FULL",
      area: leftArea,
    });
    right.device.ospfNeighbors!.push({
      neighborId: leftRid,
      address: leftIp,
      interfaceId: right.iface.id,
      interfaceName: right.iface.name,
      state: "FULL",
      area: rightArea,
    });

    installLearnedRoutes(left.device, right.device, rightIp, left.iface.id, leftArea);
    installLearnedRoutes(right.device, left.device, leftIp, right.iface.id, rightArea);
  }
}

function installLearnedRoutes(
  local: NetworkDevice,
  remote: NetworkDevice,
  nextHop: string,
  outIfaceId: string,
  area: number,
): void {
  const remoteOspf = remote.ospf;
  if (!remoteOspf) return;

  for (const route of connectedNetworks(remote)) {
    const remoteArea = ifaceOspfArea(
      remote,
      remote.interfaces.find((i) => i.id === route.ifaceId)!,
      remoteOspf,
    );
    if (remoteArea !== area) continue;
    if (hasConnectedRoute(local, route.network, route.prefixLength)) continue;

    local.runtime.routingTable = local.runtime.routingTable.filter(
      (r) =>
        !(
          r.kind === "ospf" &&
          r.network === route.network &&
          r.prefixLength === route.prefixLength
        ),
    );
    local.runtime.routingTable.push({
      network: route.network,
      prefixLength: route.prefixLength,
      nextHop,
      ifaceId: outIfaceId,
      metric: OSPF_ADMIN_DISTANCE,
      kind: "ospf",
    });
  }
}

export function ensureOspfProcess(device: NetworkDevice, processId: number): OspfProcess {
  if (!device.ospf) {
    device.ospf = { processId, routerId: null, networks: [] };
  }
  device.ospf.processId = processId;
  return device.ospf;
}

export function addOspfNetwork(
  device: NetworkDevice,
  processId: number,
  network: string,
  wildcard: string,
  area: number,
): string | null {
  if (device.type !== "router") return "OSPF only supported on routers";
  if (parseIpv4(network) === null || parseIpv4(wildcard) === null) {
    return "Invalid network or wildcard";
  }
  if (area < 0 || area > 65535) return "Invalid area";

  const proc = ensureOspfProcess(device, processId);
  proc.networks = proc.networks.filter(
    (n) => !(n.network === network && n.wildcard === wildcard && n.area === area),
  );
  proc.networks.push({ network, wildcard, area });
  return null;
}

export function setOspfRouterId(
  device: NetworkDevice,
  processId: number,
  routerId: string,
): string | null {
  if (device.type !== "router") return "OSPF only supported on routers";
  if (parseIpv4(routerId) === null) return "Invalid router-id";
  const proc = ensureOspfProcess(device, processId);
  proc.routerId = routerId;
  return null;
}
