import { parseIpv4 } from "./net-utils";
import type {
  AccessList,
  AclProtocol,
  ExtendedAccessList,
  ExtendedAclEntry,
  NetworkDevice,
  StandardAccessList,
  StandardAclEntry,
} from "./types";

export const IP_PROTO_ICMP = 1;
export const IP_PROTO_TCP = 6;
export const IP_PROTO_UDP = 17;

/** Cisco-style wildcard: 0 bits must match, 1 bits ignored. */
export function aclMatch(ip: string, network: string, wildcard: string): boolean {
  const a = parseIpv4(ip);
  const s = parseIpv4(network);
  const w = parseIpv4(wildcard);
  if (a === null || s === null || w === null) return false;
  const mask = (~w) >>> 0;
  return (a & mask) === (s & mask);
}

export function parseAclEndpoint(
  tokens: string[],
  start: number,
): { ip: string; wildcard: string; next: number } | null {
  const tok = tokens[start]?.toLowerCase();
  if (!tok) return null;
  if (tok === "any") {
    return { ip: "0.0.0.0", wildcard: "255.255.255.255", next: start + 1 };
  }
  if (tok === "host") {
    const ip = tokens[start + 1] ?? "";
    if (parseIpv4(ip) === null) return null;
    return { ip, wildcard: "0.0.0.0", next: start + 2 };
  }
  const ip = tokens[start] ?? "";
  const maybeWild = tokens[start + 1];
  if (maybeWild && parseIpv4(maybeWild) !== null && maybeWild.includes(".")) {
    return { ip, wildcard: maybeWild, next: start + 2 };
  }
  if (parseIpv4(ip) === null) return null;
  return { ip, wildcard: "0.0.0.0", next: start + 1 };
}

/** Optional `eq <port>` after an ACL endpoint (tcp/udp). */
export function parseAclPortEq(
  tokens: string[],
  start: number,
): { port: number | undefined; next: number } {
  const op = tokens[start]?.toLowerCase();
  if (op !== "eq") return { port: undefined, next: start };
  const port = Number(tokens[start + 1]);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { port: undefined, next: start };
  }
  return { port, next: start + 2 };
}

function portMatches(spec: number | undefined, actual: number | undefined): boolean {
  if (spec === undefined) return true;
  if (actual === undefined) return false;
  return spec === actual;
}

function protocolMatches(aceProtocol: AclProtocol, ipProtocol: number): boolean {
  if (aceProtocol === "ip") return true;
  if (aceProtocol === "icmp") return ipProtocol === IP_PROTO_ICMP;
  if (aceProtocol === "tcp") return ipProtocol === IP_PROTO_TCP;
  if (aceProtocol === "udp") return ipProtocol === IP_PROTO_UDP;
  return false;
}

export function findAccessList(
  device: NetworkDevice,
  number: number,
): AccessList | undefined {
  return device.accessLists?.find((l) => l.number === number);
}

export function ensureStandardAcl(device: NetworkDevice, number: number): StandardAccessList {
  if (!device.accessLists) device.accessLists = [];
  let list = device.accessLists.find(
    (l) => l.number === number && l.kind === "standard",
  ) as StandardAccessList | undefined;
  if (!list) {
    list = { kind: "standard", number, entries: [] };
    device.accessLists.push(list);
  }
  return list;
}

export function ensureExtendedAcl(device: NetworkDevice, number: number): ExtendedAccessList {
  if (!device.accessLists) device.accessLists = [];
  let list = device.accessLists.find(
    (l) => l.number === number && l.kind === "extended",
  ) as ExtendedAccessList | undefined;
  if (!list) {
    list = { kind: "extended", number, entries: [] };
    device.accessLists.push(list);
  }
  return list;
}

export function addStandardAclEntry(
  device: NetworkDevice,
  number: number,
  action: "permit" | "deny",
  source: string,
  wildcard: string,
): StandardAclEntry {
  const list = ensureStandardAcl(device, number);
  const seq = list.entries.length + 10;
  const entry: StandardAclEntry = { seq, action, source, wildcard, hits: 0 };
  list.entries.push(entry);
  return entry;
}

export function addExtendedAclEntry(
  device: NetworkDevice,
  number: number,
  action: "permit" | "deny",
  protocol: AclProtocol,
  source: string,
  sourceWildcard: string,
  dest: string,
  destWildcard: string,
  sourcePortEq?: number,
  destPortEq?: number,
): ExtendedAclEntry {
  const list = ensureExtendedAcl(device, number);
  const seq = list.entries.length + 10;
  const entry: ExtendedAclEntry = {
    seq,
    action,
    protocol,
    source,
    sourceWildcard,
    dest,
    destWildcard,
    sourcePortEq,
    destPortEq,
    hits: 0,
  };
  list.entries.push(entry);
  return entry;
}

/** @deprecated use findAccessList */
export function findStandardAcl(
  device: NetworkDevice,
  number: number,
): StandardAccessList | undefined {
  const list = findAccessList(device, number);
  return list?.kind === "standard" ? list : undefined;
}

/** First-match wins; implicit deny at end. */
export function evaluateStandardAcl(
  list: StandardAccessList,
  srcIp: string,
): "permit" | "deny" {
  for (const entry of list.entries) {
    if (aclMatch(srcIp, entry.source, entry.wildcard)) {
      entry.hits++;
      return entry.action;
    }
  }
  return "deny";
}

export function evaluateExtendedAcl(
  list: ExtendedAccessList,
  ctx: {
    srcIp: string;
    dstIp: string;
    protocol: number;
    srcPort?: number;
    dstPort?: number;
  },
): "permit" | "deny" {
  for (const entry of list.entries) {
    if (!protocolMatches(entry.protocol, ctx.protocol)) continue;
    if (!aclMatch(ctx.srcIp, entry.source, entry.sourceWildcard)) continue;
    if (!aclMatch(ctx.dstIp, entry.dest, entry.destWildcard)) continue;
    if (!portMatches(entry.sourcePortEq, ctx.srcPort)) continue;
    if (!portMatches(entry.destPortEq, ctx.dstPort)) continue;
    entry.hits++;
    return entry.action;
  }
  return "deny";
}

export function evaluateAccessList(
  list: AccessList,
  ctx: {
    srcIp: string;
    dstIp: string;
    protocol: number;
    srcPort?: number;
    dstPort?: number;
  },
): "permit" | "deny" {
  if (list.kind === "standard") {
    return evaluateStandardAcl(list, ctx.srcIp);
  }
  return evaluateExtendedAcl(list, ctx);
}

function formatWildcard(network: string, wildcard: string): string {
  if (wildcard === "255.255.255.255" && network === "0.0.0.0") return "any";
  if (wildcard === "0.0.0.0") return `host ${network}`;
  if (wildcard === "0.0.0.255" && network.endsWith(".0")) return network;
  return `${network} ${wildcard}`;
}

function formatPortEq(port: number | undefined): string {
  return port !== undefined ? ` eq ${port}` : "";
}

export function formatAccessLists(device: NetworkDevice): string {
  if (!device.accessLists?.length) return "";
  const lines: string[] = [];
  for (const list of [...device.accessLists].sort((a, b) => a.number - b.number)) {
    if (list.kind === "standard") {
      for (const e of list.entries) {
        lines.push(
          `Standard IP access list ${list.number}\n    ${e.seq} ${e.action} ${formatWildcard(e.source, e.wildcard)} (${e.hits} matches)`,
        );
      }
    } else {
      for (const e of list.entries) {
        lines.push(
          `Extended IP access list ${list.number}\n    ${e.seq} ${e.action} ${e.protocol} ${formatWildcard(e.source, e.sourceWildcard)}${formatPortEq(e.sourcePortEq)} ${formatWildcard(e.dest, e.destWildcard)}${formatPortEq(e.destPortEq)} (${e.hits} matches)`,
        );
      }
    }
  }
  return lines.join("\n");
}
