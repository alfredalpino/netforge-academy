import type { NetworkDevice, NetworkInterface } from "./types";

const SUBIF_RE = /^(.+)\.(\d+)$/i;

/** Parse Cisco-style subinterface name e.g. Gi0/0.10 → parent Gi0/0, VLAN 10. */
export function parseSubinterfaceName(
  name: string,
): { parentName: string; vlan: number } | null {
  const m = name.match(SUBIF_RE);
  if (!m) return null;
  const vlan = Number(m[2]);
  if (!vlan || vlan > 4094) return null;
  return { parentName: m[1]!, vlan };
}

export function isSubinterface(iface: NetworkInterface): boolean {
  return !!iface.parentInterfaceId;
}

export function getPhysicalInterface(
  device: NetworkDevice,
  iface: NetworkInterface,
): NetworkInterface {
  if (!iface.parentInterfaceId) return iface;
  return (
    device.interfaces.find((i) => i.id === iface.parentInterfaceId) ?? iface
  );
}

export function findSubinterfaceForVlan(
  device: NetworkDevice,
  physicalIface: NetworkInterface,
  vlanId: number,
): NetworkInterface | undefined {
  return device.interfaces.find(
    (i) =>
      i.parentInterfaceId === physicalIface.id &&
      i.encapVlan === vlanId &&
      i.adminStatus === "up",
  );
}

export function findInterfaceOwningIp(
  device: NetworkDevice,
  ip: string,
): NetworkInterface | undefined {
  return device.interfaces.find((i) => i.ipv4.some((a) => a.address === ip));
}

export function syncSubinterfaceOperState(
  device: NetworkDevice,
  sub: NetworkInterface,
): void {
  const parent = getPhysicalInterface(device, sub);
  sub.operationalStatus =
    sub.adminStatus === "up" &&
    parent.adminStatus === "up" &&
    parent.operationalStatus === "up" &&
    sub.encapVlan != null
      ? "up"
      : "down";
}

export function syncAllSubinterfaces(device: NetworkDevice): void {
  for (const iface of device.interfaces) {
    if (isSubinterface(iface)) syncSubinterfaceOperState(device, iface);
  }
}

export function createSubinterface(
  device: NetworkDevice,
  name: string,
): NetworkInterface | null {
  const parsed = parseSubinterfaceName(name);
  if (!parsed) return null;
  const parent = device.interfaces.find((i) => i.name === parsed.parentName);
  if (!parent || parent.parentInterfaceId) return null;

  const existing = device.interfaces.find((i) => i.name === name);
  if (existing) return existing;

  const sub: NetworkInterface = {
    id: `${device.id}:${name}`,
    name,
    type: "ethernet",
    macAddress: parent.macAddress,
    adminStatus: "down",
    operationalStatus: "down",
    speedMbps: parent.speedMbps,
    duplex: parent.duplex,
    mtu: parent.mtu,
    ipv4: [],
    counters: {
      inPackets: 0,
      outPackets: 0,
      inBytes: 0,
      outBytes: 0,
      drops: 0,
    },
    parentInterfaceId: parent.id,
    encapVlan: parsed.vlan,
  };
  device.interfaces.push(sub);
  return sub;
}
