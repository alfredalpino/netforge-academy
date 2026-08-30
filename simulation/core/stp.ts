import type { NetworkDevice, NetworkInterface, NetworkLink } from "./types";

type SwitchLinkEdge = {
  linkId: string;
  a: { switchId: string; iface: NetworkInterface };
  b: { switchId: string; iface: NetworkInterface };
};

function resetSwitchStp(device: NetworkDevice): void {
  for (const iface of device.interfaces) {
    iface.stpRole = "designated";
    iface.stpState = "forwarding";
  }
}

function collectSwitchSwitchLinks(
  devices: Map<string, NetworkDevice>,
  links: Map<string, NetworkLink>,
): SwitchLinkEdge[] {
  const out: SwitchLinkEdge[] = [];
  for (const link of links.values()) {
    if (link.state !== "up") continue;
    const aDev = devices.get(link.a.deviceId);
    const bDev = devices.get(link.b.deviceId);
    if (!aDev || !bDev) continue;
    if (aDev.type !== "switch" || bDev.type !== "switch") continue;
    const aIface = aDev.interfaces.find((i) => i.id === link.a.interfaceId);
    const bIface = bDev.interfaces.find((i) => i.id === link.b.interfaceId);
    if (!aIface || !bIface) continue;
    out.push({
      linkId: link.id,
      a: { switchId: aDev.id, iface: aIface },
      b: { switchId: bDev.id, iface: bIface },
    });
  }
  return out;
}

/** Minimal STP: lowest switch ID is root; one blocked port per redundant inter-switch link. */
export function rebuildAllStp(
  devices: Map<string, NetworkDevice>,
  links: Map<string, NetworkLink>,
): void {
  for (const dev of devices.values()) {
    if (dev.type === "switch") resetSwitchStp(dev);
  }

  const edges = collectSwitchSwitchLinks(devices, links);
  if (edges.length === 0) return;

  const switchIds = [...new Set(edges.flatMap((e) => [e.a.switchId, e.b.switchId]))].sort();
  if (switchIds.length <= 1) return;

  const rootId = switchIds[0]!;
  const adj = new Map<string, Array<{ neighbor: string; linkId: string; localIface: NetworkInterface }>>();
  for (const id of switchIds) adj.set(id, []);
  for (const edge of edges) {
    adj.get(edge.a.switchId)!.push({
      neighbor: edge.b.switchId,
      linkId: edge.linkId,
      localIface: edge.a.iface,
    });
    adj.get(edge.b.switchId)!.push({
      neighbor: edge.a.switchId,
      linkId: edge.linkId,
      localIface: edge.b.iface,
    });
  }

  const parent = new Map<string, string | null>();
  const parentPort = new Map<string, NetworkInterface>();
  const treeLinkIds = new Set<string>();
  const queue = [rootId];
  parent.set(rootId, null);

  while (queue.length) {
    const id = queue.shift()!;
    for (const n of adj.get(id) ?? []) {
      if (parent.has(n.neighbor)) continue;
      parent.set(n.neighbor, id);
      parentPort.set(n.neighbor, n.localIface);
      treeLinkIds.add(n.linkId);
      queue.push(n.neighbor);
    }
  }

  for (const swId of switchIds) {
    const sw = devices.get(swId);
    if (!sw) continue;
    if (swId === rootId) continue;
    const rp = parentPort.get(swId);
    if (rp) {
      rp.stpRole = "root";
      rp.stpState = "forwarding";
    }
  }

  for (const edge of edges) {
    if (!treeLinkIds.has(edge.linkId)) {
      const blockOnB = edge.b.switchId > edge.a.switchId;
      if (blockOnB) {
        edge.b.iface.stpRole = "alternate";
        edge.b.iface.stpState = "blocking";
      } else {
        edge.a.iface.stpRole = "alternate";
        edge.a.iface.stpState = "blocking";
      }
    }
  }
}

export function formatSpanningTree(device: NetworkDevice, rootId: string | null): string {
  const lines = ["VLAN0001 Spanning tree enabled"];
  if (rootId) {
    lines.push(`  Root ID: ${rootId}`);
    if (device.id === rootId) lines.push(`  This bridge is the root`);
  }
  lines.push("  Interface        Role         State");
  for (const iface of device.interfaces) {
    const role = (iface.stpRole ?? "designated").padEnd(12);
    const state = (iface.stpState === "blocking" ? "BLK" : "FWD").padEnd(4);
    lines.push(`  ${iface.name.padEnd(16)} ${role} ${state}`);
  }
  return lines.join("\n");
}

export function findStpRootId(
  devices: Map<string, NetworkDevice>,
  links: Map<string, NetworkLink>,
): string | null {
  const edges = collectSwitchSwitchLinks(devices, links);
  if (edges.length === 0) return null;
  const switchIds = [...new Set(edges.flatMap((e) => [e.a.switchId, e.b.switchId]))].sort();
  return switchIds[0] ?? null;
}

export function isStpBlocked(iface: NetworkInterface): boolean {
  return iface.stpState === "blocking";
}
