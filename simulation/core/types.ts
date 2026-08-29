/** NetForge simulation domain types — React-free. */

export type DeviceType = "router" | "switch" | "host" | "server";

export type AdminStatus = "up" | "down";
export type OperStatus = "up" | "down";

export interface IPv4Address {
  address: string;
  prefixLength: number;
}

export interface InterfaceCounters {
  inPackets: number;
  outPackets: number;
  inBytes: number;
  outBytes: number;
  drops: number;
}

export interface NetworkInterface {
  id: string;
  name: string;
  type: "ethernet";
  macAddress: string;
  adminStatus: AdminStatus;
  operationalStatus: OperStatus;
  speedMbps: number;
  duplex: "full" | "half";
  mtu: number;
  ipv4: IPv4Address[];
  /** L2 switchport config (switches). Hosts/routers omit. */
  switchport?: {
    mode: "access" | "trunk";
    accessVlan: number;
    nativeVlan: number;
    allowedVlans: number[];
  };
  counters: InterfaceCounters;
}

export interface ArpEntry {
  ip: string;
  mac: string;
  ifaceId: string;
  ageSimTime: number;
}

export interface MacEntry {
  mac: string;
  ifaceId: string;
  vlan: number;
  ageSimTime: number;
}

export interface RouteEntry {
  network: string;
  prefixLength: number;
  nextHop: string | null; // null = connected
  ifaceId: string;
  metric: number;
  kind: "connected" | "static";
}

export interface DeviceRuntimeState {
  arpTable: ArpEntry[];
  macTable: MacEntry[];
  routingTable: RouteEntry[];
  pendingArp: Map<string, string[]>; // ip -> packetIds waiting
}

export interface NetworkDevice {
  id: string;
  name: string;
  type: DeviceType;
  vendor: "netforge";
  os: "NetForgeOS";
  interfaces: NetworkInterface[];
  hostname: string;
  runningConfigLines: string[];
  runtime: DeviceRuntimeState;
}

export interface LinkEndpoint {
  deviceId: string;
  interfaceId: string;
}

export interface NetworkLink {
  id: string;
  a: LinkEndpoint;
  b: LinkEndpoint;
  state: "up" | "down";
  bandwidthMbps: number;
  latencyMs: number;
  jitterMs: number;
  loss: number;
  mtu: number;
}

export interface EthernetHeader {
  dstMac: string;
  srcMac: string;
  ethertype: number; // 0x0800 IPv4, 0x0806 ARP
}

export interface ArpPayload {
  op: "request" | "reply";
  senderMac: string;
  senderIp: string;
  targetMac: string;
  targetIp: string;
}

export interface IPv4Header {
  src: string;
  dst: string;
  ttl: number;
  protocol: number; // 1 = ICMP
}

export interface IcmpPayload {
  type: number; // 8 echo request, 0 echo reply
  code: number;
  identifier: number;
  sequence: number;
  data?: string;
}

export interface Packet {
  id: string;
  createdAt: number;
  layers: {
    eth?: EthernetHeader;
    vlan?: { vlanId: number; ethertype: number };
    arp?: ArpPayload;
    ipv4?: IPv4Header;
    icmp?: IcmpPayload;
  };
  meta: {
    ingressIface?: string;
    egressIface?: string;
    dropReason?: string;
    hopDeviceIds?: string[];
  };
}

export type SimEventType =
  | "PACKET_ARRIVE"
  | "LINK_TRANSMIT"
  | "TIMER"
  | "CLI_COMMIT"
  | "INTERFACE_STATE"
  | "PING_RESULT";

export interface SimulationEvent {
  id: string;
  t: number;
  type: SimEventType;
  deviceId?: string;
  packetId?: string;
  data: Record<string, unknown>;
}

export interface PacketTrace {
  packetId: string;
  protocol: string;
  summary: string;
  hops: { t: number; deviceId: string; action: string }[];
  outcome: "delivered" | "dropped" | "in_flight";
}

export interface TopologyNodeSpec {
  id: string;
  name: string;
  type: DeviceType;
  interfaces?: { name: string; mac?: string }[];
}

export interface TopologyLinkSpec {
  id: string;
  a: { deviceId: string; interfaceName: string };
  b: { deviceId: string; interfaceName: string };
  latencyMs?: number;
}

export interface TopologySpec {
  nodes: TopologyNodeSpec[];
  links: TopologyLinkSpec[];
  positions?: Record<string, { x: number; y: number }>;
}

export interface CliResult {
  output: string;
  error?: string;
  prompt: string;
  mode: string;
}

export interface EngineSnapshot {
  schemaVersion: 1;
  seed: number;
  t: number;
  devices: NetworkDevice[];
  links: NetworkLink[];
  eventSeq: number;
  packetSeq: number;
}

export const ETHertype = {
  IPV4: 0x0800,
  ARP: 0x0806,
} as const;

export const ICMP = {
  ECHO_REPLY: 0,
  ECHO_REQUEST: 8,
} as const;

export const BROADCAST_MAC = "ff:ff:ff:ff:ff:ff";
export const MAX_EVENTS_PER_RUN = 10_000;
