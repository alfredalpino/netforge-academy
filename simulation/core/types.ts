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
  /** STP port role/state (switches). */
  stpRole?: "root" | "designated" | "alternate" | "disabled";
  stpState?: "forwarding" | "blocking";
  /** Applied standard ACL number (routers). */
  accessGroupIn?: number;
  accessGroupOut?: number;
  /** NAT role on router interfaces. */
  natInside?: boolean;
  natOutside?: boolean;
  /** Parent physical interface (router subinterfaces). */
  parentInterfaceId?: string;
  /** 802.1Q encapsulation VLAN (router subinterfaces). */
  encapVlan?: number;
  /** SVI VLAN id (L3 switch virtual interfaces). */
  sviVlan?: number;
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
  /** Route preference — connected=0, static=1, ospf=110 */
  metric: number;
  kind: "connected" | "static" | "ospf";
}

export interface OspfNetworkStmt {
  network: string;
  wildcard: string;
  area: number;
}

export interface OspfProcess {
  processId: number;
  routerId: string | null;
  networks: OspfNetworkStmt[];
}

export interface OspfNeighbor {
  neighborId: string;
  address: string;
  interfaceId: string;
  interfaceName: string;
  state: "FULL";
  area: number;
}

export interface DeviceRuntimeState {
  arpTable: ArpEntry[];
  macTable: MacEntry[];
  routingTable: RouteEntry[];
  pendingArp: Map<string, string[]>; // ip -> packetIds waiting
  /** Active NAT translations (routers). */
  natTranslations?: NatTranslation[];
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
  /** OSPF process config (routers). */
  ospf?: OspfProcess | null;
  /** Last computed adjacencies for show commands. */
  ospfNeighbors?: OspfNeighbor[];
  /** DHCP pools (routers). */
  dhcpPools?: DhcpPool[];
  /** Numbered ACLs (routers) — standard 1–99, extended 100–199. */
  accessLists?: AccessList[];
  /** PAT overload rules (routers). */
  natRules?: NatPatRule[];
  /** L3 routing enabled (multilayer switches). */
  ipRouting?: boolean;
  runtime: DeviceRuntimeState;
}

export type AclProtocol = "ip" | "icmp" | "tcp" | "udp";

export interface StandardAclEntry {
  seq: number;
  action: "permit" | "deny";
  source: string;
  wildcard: string;
  hits: number;
}

export interface ExtendedAclEntry {
  seq: number;
  action: "permit" | "deny";
  protocol: AclProtocol;
  source: string;
  sourceWildcard: string;
  dest: string;
  destWildcard: string;
  /** Source port (eq) — tcp/udp only; undefined = any */
  sourcePortEq?: number;
  /** Destination port (eq) — tcp/udp only; undefined = any */
  destPortEq?: number;
  hits: number;
}

export interface StandardAccessList {
  kind: "standard";
  number: number;
  entries: StandardAclEntry[];
}

export interface ExtendedAccessList {
  kind: "extended";
  number: number;
  entries: ExtendedAclEntry[];
}

export type AccessList = StandardAccessList | ExtendedAccessList;

export interface NatPatRule {
  kind: "pat-overload";
  aclNumber: number;
  outsideIfaceId: string;
}

export interface NatTranslation {
  insideLocal: string;
  insideGlobal: string;
  outsideLocal: string;
  outsideGlobal: string;
  ageSimTime: number;
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

export interface UdpPayload {
  srcPort: number;
  dstPort: number;
}

export interface TcpPayload {
  srcPort: number;
  dstPort: number;
}

export interface DhcpPayload {
  messageType: "discover" | "offer" | "request" | "ack";
  clientMac: string;
  yiaddr?: string;
  serverId?: string;
}

export interface DhcpLease {
  ip: string;
  mac: string;
}

export interface DhcpPool {
  name: string;
  network: string;
  prefixLength: number;
  defaultRouter: string;
  leases: DhcpLease[];
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
    tcp?: TcpPayload;
    udp?: UdpPayload;
    dhcp?: DhcpPayload;
  };
  meta: {
    ingressIface?: string;
    egressIface?: string;
    dropReason?: string;
    hopDeviceIds?: string[];
    /** VLAN context preserved when L3 device receives tagged frames from a trunk. */
    vlanId?: number;
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

export const IP_PROTOCOL = {
  ICMP: 1,
  UDP: 17,
} as const;

export const DHCP_PORTS = {
  SERVER: 67,
  CLIENT: 68,
} as const;

export const BROADCAST_MAC = "ff:ff:ff:ff:ff:ff";
export const MAX_EVENTS_PER_RUN = 10_000;
