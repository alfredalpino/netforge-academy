import { makeMac } from "./net-utils";
import type {
  NetworkDevice,
  NetworkInterface,
  NetworkLink,
  TopologySpec,
  DeviceRuntimeState,
} from "./types";

function emptyRuntime(): DeviceRuntimeState {
  return {
    arpTable: [],
    macTable: [],
    routingTable: [],
    pendingArp: new Map(),
  };
}

function emptyCounters() {
  return { inPackets: 0, outPackets: 0, inBytes: 0, outBytes: 0, drops: 0 };
}

function defaultIfaceNames(type: NetworkDevice["type"]): string[] {
  if (type === "switch") return ["Gi0/1", "Gi0/2", "Gi0/3", "Gi0/4"];
  if (type === "host" || type === "server") return ["eth0"];
  return ["Gi0/0", "Gi0/1"];
}

export function buildTopology(spec: TopologySpec, seed = 1): {
  devices: Map<string, NetworkDevice>;
  links: Map<string, NetworkLink>;
} {
  const devices = new Map<string, NetworkDevice>();
  let macIndex = 0;

  for (const node of spec.nodes) {
    const names =
      node.interfaces?.map((i) => i.name) ?? defaultIfaceNames(node.type);
    const interfaces: NetworkInterface[] = names.map((name, idx) => {
      const provided = node.interfaces?.[idx]?.mac;
      const base: NetworkInterface = {
        id: `${node.id}:${name}`,
        name,
        type: "ethernet",
        macAddress: provided ?? makeMac(seed, macIndex++),
        adminStatus: "up",
        operationalStatus: "down",
        speedMbps: 1000,
        duplex: "full",
        mtu: 1500,
        ipv4: [],
        counters: emptyCounters(),
      };
      if (node.type === "switch") {
        base.switchport = {
          mode: "access",
          accessVlan: 1,
          nativeVlan: 1,
          allowedVlans: [1],
        };
      }
      return base;
    });

    devices.set(node.id, {
      id: node.id,
      name: node.name,
      type: node.type,
      vendor: "netforge",
      os: "NetForgeOS",
      interfaces,
      hostname: node.name,
      runningConfigLines: [`hostname ${node.name}`],
      runtime: emptyRuntime(),
    });
  }

  const links = new Map<string, NetworkLink>();

  for (const link of spec.links) {
    const aDev = devices.get(link.a.deviceId);
    const bDev = devices.get(link.b.deviceId);
    if (!aDev || !bDev) {
      throw new Error(`Link ${link.id}: unknown device`);
    }
    const aIface = aDev.interfaces.find((i) => i.name === link.a.interfaceName);
    const bIface = bDev.interfaces.find((i) => i.name === link.b.interfaceName);
    if (!aIface || !bIface) {
      throw new Error(`Link ${link.id}: unknown interface`);
    }

    aIface.operationalStatus =
      aIface.adminStatus === "up" ? "up" : "down";
    bIface.operationalStatus =
      bIface.adminStatus === "up" ? "up" : "down";

    links.set(link.id, {
      id: link.id,
      a: { deviceId: aDev.id, interfaceId: aIface.id },
      b: { deviceId: bDev.id, interfaceId: bIface.id },
      state: "up",
      bandwidthMbps: 1000,
      latencyMs: link.latencyMs ?? 1,
      jitterMs: 0,
      loss: 0,
      mtu: 1500,
    });
  }

  return { devices, links };
}

export function findIface(
  device: NetworkDevice,
  nameOrId: string,
): NetworkInterface | undefined {
  return device.interfaces.find(
    (i) => i.name === nameOrId || i.id === nameOrId,
  );
}

export function peerFor(
  links: Map<string, NetworkLink>,
  deviceId: string,
  ifaceId: string,
): { link: NetworkLink; peerDeviceId: string; peerIfaceId: string } | null {
  for (const link of links.values()) {
    if (link.state !== "up") continue;
    if (link.a.deviceId === deviceId && link.a.interfaceId === ifaceId) {
      return {
        link,
        peerDeviceId: link.b.deviceId,
        peerIfaceId: link.b.interfaceId,
      };
    }
    if (link.b.deviceId === deviceId && link.b.interfaceId === ifaceId) {
      return {
        link,
        peerDeviceId: link.a.deviceId,
        peerIfaceId: link.a.interfaceId,
      };
    }
  }
  return null;
}
