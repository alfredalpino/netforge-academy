import { makeMac } from "./net-utils";
import type { NetworkDevice, NetworkInterface } from "./types";

const SVI_RE = /^vlan(\d+)$/i;

export function parseVlanInterfaceName(name: string): number | null {
  const m = name.match(SVI_RE);
  if (!m) return null;
  const vlan = Number(m[1]);
  return vlan > 0 && vlan <= 4094 ? vlan : null;
}

export function isSvi(iface: NetworkInterface): boolean {
  return iface.sviVlan != null;
}

export function findSviForVlan(
  device: NetworkDevice,
  vlanId: number,
): NetworkInterface | undefined {
  return device.interfaces.find(
    (i) => i.sviVlan === vlanId && i.operationalStatus === "up",
  );
}

export function syncSviOperState(iface: NetworkInterface): void {
  iface.operationalStatus = iface.adminStatus === "up" ? "up" : "down";
}

/** Pick an up access (or trunk) port in the given VLAN for L2 egress from an SVI. */
export function pickVlanEgressPort(
  device: NetworkDevice,
  vlanId: number,
): NetworkInterface | undefined {
  for (const iface of device.interfaces) {
    if (iface.sviVlan != null) continue;
    if (iface.operationalStatus !== "up") continue;
    const sp = iface.switchport;
    if (!sp) continue;
    if (sp.mode === "access" && sp.accessVlan === vlanId) return iface;
  }
  for (const iface of device.interfaces) {
    if (iface.sviVlan != null) continue;
    if (iface.operationalStatus !== "up") continue;
    const sp = iface.switchport;
    if (sp?.mode === "trunk" && sp.allowedVlans.includes(vlanId)) return iface;
  }
  return undefined;
}

export function createSvi(
  device: NetworkDevice,
  name: string,
  seed = 1,
): NetworkInterface | null {
  const vlan = parseVlanInterfaceName(name);
  if (!vlan) return null;

  const existing = device.interfaces.find(
    (i) => i.name.toLowerCase() === name.toLowerCase(),
  );
  if (existing) return existing;

  const canonical = `Vlan${vlan}`;
  const routerMac =
    device.interfaces.find((i) => i.sviVlan == null)?.macAddress ??
    makeMac(seed, vlan);
  const svi: NetworkInterface = {
    id: `${device.id}:${canonical}`,
    name: canonical,
    type: "ethernet",
    macAddress: routerMac,
    adminStatus: "down",
    operationalStatus: "down",
    speedMbps: 1000,
    duplex: "full",
    mtu: 1500,
    ipv4: [],
    counters: {
      inPackets: 0,
      outPackets: 0,
      inBytes: 0,
      outBytes: 0,
      drops: 0,
    },
    sviVlan: vlan,
  };
  device.interfaces.push(svi);
  return svi;
}
