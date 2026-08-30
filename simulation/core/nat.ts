import { evaluateAccessList, findAccessList } from "./acl";
import { findIface } from "./topology";
import type {
  NatPatRule,
  NatTranslation,
  NetworkDevice,
  NetworkInterface,
  Packet,
} from "./types";

export type { NatPatRule, NatTranslation };

export function setNatDirection(
  iface: NetworkInterface,
  direction: "inside" | "outside" | null,
): void {
  iface.natInside = direction === "inside";
  iface.natOutside = direction === "outside";
}

export function addNatPatRule(
  device: NetworkDevice,
  aclNumber: number,
  outsideIfaceName: string,
): string | null {
  if (device.type !== "router") return "NAT only on routers";
  if (aclNumber < 1 || aclNumber > 99) return "NAT ACL must be standard (1–99)";
  if (!findAccessList(device, aclNumber)) {
    return `% Access list ${aclNumber} does not exist`;
  }
  const iface = findIface(device, outsideIfaceName);
  if (!iface) return "Invalid outside interface";
  if (!iface.natOutside) {
    return `% ${outsideIfaceName} is not configured as NAT outside`;
  }
  if (!device.natRules) device.natRules = [];
  device.natRules = device.natRules.filter(
    (r) => !(r.kind === "pat-overload" && r.aclNumber === aclNumber),
  );
  device.natRules.push({
    kind: "pat-overload",
    aclNumber,
    outsideIfaceId: iface.id,
  });
  return null;
}

function outsideIpFor(iface: NetworkInterface): string | null {
  return iface.ipv4[0]?.address ?? null;
}

function findPatRule(
  device: NetworkDevice,
  outIface: NetworkInterface,
): NatPatRule | undefined {
  return device.natRules?.find(
    (r) => r.kind === "pat-overload" && r.outsideIfaceId === outIface.id,
  );
}

/** Reverse NAT on outside ingress — returns true if destination was rewritten. */
export function applyInboundNat(
  device: NetworkDevice,
  iface: NetworkInterface,
  packet: Packet,
  simTime: number,
): boolean {
  const ipv4 = packet.layers.ipv4;
  if (!ipv4 || !iface.natOutside || !device.runtime.natTranslations) return false;

  const hit = device.runtime.natTranslations.find(
    (t) => t.outsideGlobal === ipv4.dst || t.outsideLocal === ipv4.dst,
  );
  if (!hit) return false;

  hit.ageSimTime = simTime;
  ipv4.dst = hit.insideLocal;
  return true;
}

/** Source NAT when exiting inside → outside. Returns true if translated. */
export function applyOutboundNat(
  device: NetworkDevice,
  inIface: NetworkInterface,
  outIface: NetworkInterface,
  packet: Packet,
  simTime: number,
): boolean {
  const ipv4 = packet.layers.ipv4;
  if (!ipv4 || !inIface.natInside || !outIface.natOutside) return false;

  const rule = findPatRule(device, outIface);
  if (!rule) return false;

  const list = findAccessList(device, rule.aclNumber);
  if (!list) return false;
  if (
    evaluateAccessList(list, {
      srcIp: ipv4.src,
      dstIp: ipv4.dst,
      protocol: ipv4.protocol,
    }) !== "permit"
  ) {
    return false;
  }

  const globalIp = outsideIpFor(outIface);
  if (!globalIp) return false;

  if (!device.runtime.natTranslations) {
    device.runtime.natTranslations = [];
  }

  let entry = device.runtime.natTranslations.find(
    (t) => t.insideLocal === ipv4.src && t.outsideGlobal === globalIp,
  );
  if (!entry) {
    entry = {
      insideLocal: ipv4.src,
      insideGlobal: ipv4.src,
      outsideLocal: globalIp,
      outsideGlobal: globalIp,
      ageSimTime: simTime,
    };
    device.runtime.natTranslations.push(entry);
  } else {
    entry.ageSimTime = simTime;
  }

  ipv4.src = globalIp;
  return true;
}

export function formatNatTranslations(device: NetworkDevice): string {
  const rows = device.runtime.natTranslations ?? [];
  if (!rows.length) return "No translations active";
  const header =
    "Pro Inside global      Inside local       Outside local      Outside global";
  const lines = rows.map((t) => {
    const pro = "icmp";
    return `${pro.padEnd(4)}${t.insideGlobal.padEnd(21)}${t.insideLocal.padEnd(19)}${t.outsideLocal.padEnd(19)}${t.outsideGlobal}`;
  });
  return [header, ...lines].join("\n");
}
