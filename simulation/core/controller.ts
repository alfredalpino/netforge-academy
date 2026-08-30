import { EventQueue } from "./event-queue";
import {
  BROADCAST_MAC,
  ETHertype,
  ICMP,
  MAX_EVENTS_PER_RUN,
  type CliResult,
  type EngineSnapshot,
  type NetworkDevice,
  type NetworkInterface,
  type NetworkLink,
  type Packet,
  type PacketTrace,
  type RouteEntry,
  type SimulationEvent,
  type TopologySpec,
} from "./types";
import {
  ipv4InSubnet,
  isBroadcastMac,
  macEqual,
  networkAddress,
  parseIpv4,
} from "./net-utils";
import { buildTopology, findIface, peerFor } from "./topology";
import {
  buildDhcpTraces,
  findDhcpOffer,
  upsertDhcpPool,
  maskToPrefix as dhcpMaskToPrefix,
} from "./dhcp";
import {
  addOspfNetwork as applyOspfNetwork,
  ensureOspfProcess as initOspfProcess,
  rebuildAllOspfRoutes,
  setOspfRouterId as applyOspfRouterId,
} from "./ospf";
import {
  findStpRootId,
  formatSpanningTree,
  isStpBlocked,
  rebuildAllStp,
} from "./stp";
import {
  addStandardAclEntry as applyStandardAclEntry,
  addExtendedAclEntry as applyExtendedAclEntry,
  evaluateAccessList,
  findAccessList,
  formatAccessLists,
} from "./acl";
import {
  createSubinterface,
  findInterfaceOwningIp,
  findSubinterfaceForVlan,
  getPhysicalInterface,
  isSubinterface,
  parseSubinterfaceName,
  syncAllSubinterfaces,
  syncSubinterfaceOperState,
} from "./subinterface";
import {
  createSvi,
  findSviForVlan,
  isSvi,
  parseVlanInterfaceName,
  pickVlanEgressPort,
  syncSviOperState,
} from "./svi";
import {
  addNatPatRule as applyNatPatRule,
  applyInboundNat,
  applyOutboundNat,
  formatNatTranslations,
  setNatDirection,
} from "./nat";
import { executeCliLine, type CliSession } from "../cli/interpreter";

export class SimulationController {
  private devices = new Map<string, NetworkDevice>();
  private links = new Map<string, NetworkLink>();
  private queue = new EventQueue();
  private packets = new Map<string, Packet>();
  private traces = new Map<string, PacketTrace>();
  private cliSessions = new Map<string, CliSession>();
  private t = 0;
  private seed = 1;
  private eventSeq = 0;
  private packetSeq = 0;
  private lastEvents: SimulationEvent[] = [];
  private pingWaiters = new Map<
    string,
    { resolve: (ok: boolean) => void; packetId: string }
  >();

  loadTopology(spec: TopologySpec, seed = 1): void {
    this.reset(seed);
    const built = buildTopology(spec, seed);
    this.devices = built.devices;
    this.links = built.links;
    this.rebuildAllStpState();
  }

  private rebuildAllStpState(): void {
    rebuildAllStp(this.devices, this.links);
  }

  getSpanningTreeText(deviceId: string): string | null {
    const device = this.devices.get(deviceId);
    if (!device || device.type !== "switch") return null;
    return formatSpanningTree(device, findStpRootId(this.devices, this.links));
  }

  /** Freeform: add a device with default interfaces. */
  addDevice(
    type: NetworkDevice["type"],
    name?: string,
  ): NetworkDevice {
    const n = this.devices.size + 1;
    const id = name?.replace(/\s+/g, "") || `${type}${n}`;
    if (this.devices.has(id)) {
      return this.addDevice(type, `${id}-${n}`);
    }
    const hostname = name ?? id.toUpperCase();
    const spec: TopologySpec = {
      nodes: [{ id, name: hostname, type }],
      links: [],
    };
    const built = buildTopology(spec, this.seed + n);
    const device = built.devices.get(id)!;
    this.devices.set(id, device);
    return structuredClone(device);
  }

  removeDevice(deviceId: string): void {
    const toRemove = [...this.links.values()].filter(
      (l) => l.a.deviceId === deviceId || l.b.deviceId === deviceId,
    );
    for (const l of toRemove) this.links.delete(l.id);
    this.devices.delete(deviceId);
    this.cliSessions.delete(deviceId);
    this.rebuildAllStpState();
  }

  addLink(
    a: { deviceId: string; interfaceName: string },
    b: { deviceId: string; interfaceName: string },
    latencyMs = 1,
  ): NetworkLink | { error: string } {
    const aDev = this.devices.get(a.deviceId);
    const bDev = this.devices.get(b.deviceId);
    if (!aDev || !bDev) return { error: "Unknown device" };
    const aIface = findIface(aDev, a.interfaceName);
    const bIface = findIface(bDev, b.interfaceName);
    if (!aIface || !bIface) return { error: "Unknown interface" };
    // Interface already linked?
    for (const existing of this.links.values()) {
      if (
        existing.a.interfaceId === aIface.id ||
        existing.b.interfaceId === aIface.id ||
        existing.a.interfaceId === bIface.id ||
        existing.b.interfaceId === bIface.id
      ) {
        return { error: "Interface already connected" };
      }
    }
    const id = `L-${a.deviceId}-${b.deviceId}-${++this.eventSeq}`;
    const link: NetworkLink = {
      id,
      a: { deviceId: aDev.id, interfaceId: aIface.id },
      b: { deviceId: bDev.id, interfaceId: bIface.id },
      state: "up",
      bandwidthMbps: 1000,
      latencyMs,
      jitterMs: 0,
      loss: 0,
      mtu: 1500,
    };
    this.links.set(id, link);
    aIface.operationalStatus = aIface.adminStatus === "up" ? "up" : "down";
    bIface.operationalStatus = bIface.adminStatus === "up" ? "up" : "down";
    this.rebuildAllStpState();
    return structuredClone(link);
  }

  removeLink(linkId: string): void {
    const link = this.links.get(linkId);
    if (!link) return;
    this.links.delete(linkId);
    for (const ep of [link.a, link.b]) {
      const dev = this.devices.get(ep.deviceId);
      const iface = dev?.interfaces.find((i) => i.id === ep.interfaceId);
      if (iface) iface.operationalStatus = "down";
    }
    this.rebuildAllStpState();
  }

  setSwitchport(
    deviceId: string,
    ifaceName: string,
    config: {
      mode: "access" | "trunk";
      accessVlan?: number;
      nativeVlan?: number;
      allowedVlans?: number[];
    },
  ): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    if (device.type !== "switch") return "Switchport only on switches";
    const iface = findIface(device, ifaceName);
    if (!iface) return "Interface not found";
    iface.switchport = {
      mode: config.mode,
      accessVlan: config.accessVlan ?? iface.switchport?.accessVlan ?? 1,
      nativeVlan: config.nativeVlan ?? iface.switchport?.nativeVlan ?? 1,
      allowedVlans:
        config.allowedVlans ??
        iface.switchport?.allowedVlans ??
        [1],
    };
    this.appendConfig(
      device,
      config.mode === "access"
        ? ` switchport mode access`
        : ` switchport mode trunk`,
    );
    if (config.mode === "access" && config.accessVlan !== undefined) {
      this.appendConfig(device, ` switchport access vlan ${config.accessVlan}`);
    }
    return null;
  }

  /** Engine state mirror for Worker → UI. */
  getStateMirror(): {
    devices: NetworkDevice[];
    links: NetworkLink[];
    traces: PacketTrace[];
    events: SimulationEvent[];
  } {
    return {
      devices: this.getDevices(),
      links: this.getLinks(),
      traces: this.getTraces(),
      events: this.getRecentEvents(),
    };
  }

  reset(seed = this.seed): void {
    this.seed = seed;
    this.t = 0;
    this.eventSeq = 0;
    this.packetSeq = 0;
    this.queue.clear();
    this.packets.clear();
    this.traces.clear();
    this.cliSessions.clear();
    this.lastEvents = [];
    this.pingWaiters.clear();
    this.devices.clear();
    this.links.clear();
  }

  getSimTime(): number {
    return this.t;
  }

  getDevices(): NetworkDevice[] {
    return [...this.devices.values()].map((d) => structuredClone(d));
  }

  getDevice(id: string): NetworkDevice | undefined {
    const d = this.devices.get(id);
    return d ? structuredClone(d) : undefined;
  }

  getLinks(): NetworkLink[] {
    return [...this.links.values()].map((l) => structuredClone(l));
  }

  getRecentEvents(): SimulationEvent[] {
    return [...this.lastEvents];
  }

  getTraces(): PacketTrace[] {
    return [...this.traces.values()].map((tr) => structuredClone(tr));
  }

  snapshot(): EngineSnapshot {
    return {
      schemaVersion: 1,
      seed: this.seed,
      t: this.t,
      devices: this.getDevices(),
      links: this.getLinks(),
      eventSeq: this.eventSeq,
      packetSeq: this.packetSeq,
    };
  }

  restore(s: EngineSnapshot): void {
    this.seed = s.seed;
    this.t = s.t;
    this.eventSeq = s.eventSeq;
    this.packetSeq = s.packetSeq;
    this.queue.clear();
    this.packets.clear();
    this.traces.clear();
    this.cliSessions.clear();
    this.lastEvents = [];
    this.devices = new Map(s.devices.map((d) => [d.id, structuredClone(d)]));
    for (const d of this.devices.values()) {
      d.runtime.pendingArp = new Map();
    }
    this.links = new Map(s.links.map((l) => [l.id, structuredClone(l)]));
  }

  executeCommand(deviceId: string, line: string): CliResult {
    const device = this.devices.get(deviceId);
    if (!device) {
      return {
        output: "",
        error: `Unknown device ${deviceId}`,
        prompt: "",
        mode: "none",
      };
    }
    let session = this.cliSessions.get(deviceId);
    if (!session) {
      session = { mode: "user", ifaceName: null, routerProcessId: null, dhcpPoolName: null };
      this.cliSessions.set(deviceId, session);
    }
    return executeCliLine(this, device, session, line);
  }

  /** Create or return a router subinterface (Gi0/0.10). */
  ensureSubinterface(deviceId: string, ifaceName: string): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    if (device.type !== "router") return "Subinterfaces only on routers";
    if (!parseSubinterfaceName(ifaceName)) return null;
    const sub = createSubinterface(device, ifaceName);
    if (!sub) return `% Invalid parent interface for ${ifaceName}`;
    this.appendConfig(device, `interface ${ifaceName}`);
    return null;
  }

  setSubinterfaceEncap(
    deviceId: string,
    ifaceName: string,
    vlan: number,
  ): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    const iface = findIface(device, ifaceName);
    if (!iface || !isSubinterface(iface)) {
      return "Encapsulation only on subinterfaces";
    }
    if (vlan < 1 || vlan > 4094) return "Invalid VLAN ID";
    iface.encapVlan = vlan;
    syncSubinterfaceOperState(device, iface);
    this.appendConfig(device, `interface ${iface.name}`);
    this.appendConfig(device, ` encapsulation dot1Q ${vlan}`);
    return null;
  }

  ensureSvi(deviceId: string, ifaceName: string): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    if (device.type !== "switch") return "SVIs only on switches";
    const vlan = parseVlanInterfaceName(ifaceName);
    if (!vlan) return null;
    const svi = createSvi(device, ifaceName, this.seed);
    if (!svi) return `% Invalid SVI ${ifaceName}`;
    this.appendConfig(device, `interface ${svi.name}`);
    return null;
  }

  setIpRouting(deviceId: string, enabled: boolean): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    if (device.type !== "switch") return "ip routing only on switches";
    device.ipRouting = enabled;
    this.appendConfig(device, enabled ? "ip routing" : "no ip routing");
    return null;
  }

  /** Apply interface IP and rebuild connected routes. */
  setInterfaceIpv4(
    deviceId: string,
    ifaceName: string,
    address: string,
    prefixLength: number,
  ): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    const iface = findIface(device, ifaceName);
    if (!iface) return "Interface not found";
    if (parseIpv4(address) === null) return "Invalid IPv4 address";
    if (prefixLength < 0 || prefixLength > 32) return "Invalid prefix";
    iface.ipv4 = [{ address, prefixLength }];
    this.rebuildConnectedRoutes(device);
    this.rebuildAllOspf();
    this.appendConfig(device, `interface ${iface.name}`);
    this.appendConfig(device, ` ip address ${address} ${prefixToMask(prefixLength)}`);
    return null;
  }

  setInterfaceAdmin(
    deviceId: string,
    ifaceName: string,
    admin: "up" | "down",
  ): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    const iface = findIface(device, ifaceName);
    if (!iface) return "Interface not found";
    iface.adminStatus = admin;
    if (isSubinterface(iface)) {
      syncSubinterfaceOperState(device, iface);
    } else if (isSvi(iface)) {
      syncSviOperState(iface);
    } else {
      const peer = peerFor(this.links, device.id, iface.id);
      iface.operationalStatus =
        admin === "up" && peer && this.linkUp(peer.link) ? "up" : "down";
      if (peer) {
        const peerDev = this.devices.get(peer.peerDeviceId);
        const peerIface = peerDev?.interfaces.find((i) => i.id === peer.peerIfaceId);
        if (peerIface) {
          peerIface.operationalStatus =
            peerIface.adminStatus === "up" && admin === "up" && this.linkUp(peer.link)
              ? "up"
              : "down";
        }
      }
      syncAllSubinterfaces(device);
    }
    this.rebuildConnectedRoutes(device);
    this.rebuildAllOspf();
    this.appendConfig(device, admin === "up" ? " no shutdown" : " shutdown");
    return null;
  }

  addOspfNetwork(
    deviceId: string,
    processId: number,
    network: string,
    wildcard: string,
    area: number,
  ): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    const err = applyOspfNetwork(device, processId, network, wildcard, area);
    if (err) return err;
    this.appendConfig(
      device,
      `router ospf ${processId}\n network ${network} ${wildcard} area ${area}`,
    );
    this.rebuildAllOspf();
    return null;
  }

  setOspfRouterId(deviceId: string, processId: number, routerId: string): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    const err = applyOspfRouterId(device, processId, routerId);
    if (err) return err;
    this.appendConfig(device, `router ospf ${processId}\n router-id ${routerId}`);
    this.rebuildAllOspf();
    return null;
  }

  ensureOspfProcess(deviceId: string, processId: number): void {
    const device = this.devices.get(deviceId);
    if (!device) return;
    initOspfProcess(device, processId);
  }

  ensureDhcpPool(deviceId: string, poolName: string): void {
    const device = this.devices.get(deviceId);
    if (!device) return;
    upsertDhcpPool(device, poolName);
  }

  configureDhcpPoolNetwork(
    deviceId: string,
    poolName: string,
    network: string,
    mask: string,
  ): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    if (device.type !== "router") return "DHCP pools only on routers";
    const prefix = dhcpMaskToPrefix(mask);
    if (prefix === null) return "Invalid mask";
    const net = networkAddress(network, prefix);
    if (!net) return "Invalid network";
    const pool = upsertDhcpPool(device, poolName);
    pool.network = net;
    pool.prefixLength = prefix;
    this.appendConfig(device, `ip dhcp pool ${poolName}`);
    this.appendConfig(device, ` network ${net} ${mask}`);
    return null;
  }

  configureDhcpPoolDefaultRouter(
    deviceId: string,
    poolName: string,
    gateway: string,
  ): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    if (parseIpv4(gateway) === null) return "Invalid default-router";
    const pool = device.dhcpPools?.find((p) => p.name === poolName);
    if (!pool) return `% DHCP pool ${poolName} not found`;
    pool.defaultRouter = gateway;
    this.appendConfig(device, ` default-router ${gateway}`);
    return null;
  }

  requestDhcpLease(deviceId: string, ifaceName: string): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    if (device.type !== "host" && device.type !== "server") {
      return "DHCP client only on hosts";
    }
    const iface = findIface(device, ifaceName);
    if (!iface) return "Interface not found";
    if (iface.operationalStatus !== "up") return "Interface is down";

    const offer = findDhcpOffer(device, iface.macAddress, this.devices, this.links);
    if (!offer) return "% No DHCP offer received";

    for (const tr of buildDhcpTraces(
      device.id,
      offer.router.id,
      offer.ip,
      this.t,
      () => this.nextPacketId(),
    )) {
      this.traces.set(tr.packetId, tr);
    }

    iface.ipv4 = [{ address: offer.ip, prefixLength: offer.pool.prefixLength }];
    this.rebuildConnectedRoutes(device);
    this.setDefaultGateway(deviceId, offer.gateway);
    this.appendConfig(device, `interface ${iface.name}`);
    this.appendConfig(device, " ip address dhcp");
    this.t += 4;
    return null;
  }

  addStandardAclEntry(
    deviceId: string,
    listNum: number,
    action: "permit" | "deny",
    source: string,
    wildcard: string,
  ): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    if (device.type !== "router") return "ACLs only on routers";
    if (listNum < 1 || listNum > 99) return "Standard ACL number must be 1–99";
    if (source !== "any" && parseIpv4(source) === null) return "Invalid source address";
    if (parseIpv4(wildcard) === null) return "Invalid wildcard mask";
    applyStandardAclEntry(device, listNum, action, source, wildcard);
    this.appendConfig(device, `access-list ${listNum} ${action} ${source} ${wildcard}`);
    return null;
  }

  addExtendedAclEntry(
    deviceId: string,
    listNum: number,
    action: "permit" | "deny",
    protocol: "ip" | "icmp" | "tcp" | "udp",
    source: string,
    sourceWildcard: string,
    dest: string,
    destWildcard: string,
    sourcePortEq?: number,
    destPortEq?: number,
  ): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    if (device.type !== "router") return "ACLs only on routers";
    if (listNum < 100 || listNum > 199) return "Extended ACL number must be 100–199";
    if (source !== "any" && parseIpv4(source) === null) return "Invalid source address";
    if (dest !== "any" && parseIpv4(dest) === null) return "Invalid destination address";
    if (parseIpv4(sourceWildcard) === null || parseIpv4(destWildcard) === null) {
      return "Invalid wildcard mask";
    }
    applyExtendedAclEntry(
      device,
      listNum,
      action,
      protocol,
      source,
      sourceWildcard,
      dest,
      destWildcard,
      sourcePortEq,
      destPortEq,
    );
    const srcPortText =
      sourcePortEq !== undefined ? ` eq ${sourcePortEq}` : "";
    const dstPortText = destPortEq !== undefined ? ` eq ${destPortEq}` : "";
    this.appendConfig(
      device,
      `access-list ${listNum} ${action} ${protocol} ${source} ${sourceWildcard}${srcPortText} ${dest} ${destWildcard}${dstPortText}`,
    );
    return null;
  }

  setAccessGroup(
    deviceId: string,
    ifaceName: string,
    listNum: number,
    direction: "in" | "out",
  ): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    if (device.type !== "router") return "ACLs only on routers";
    const iface = findIface(device, ifaceName);
    if (!iface) return "Interface not found";
    if (!findAccessList(device, listNum)) {
      return `% Access list ${listNum} does not exist`;
    }
    if (direction === "in") {
      iface.accessGroupIn = listNum;
    } else {
      iface.accessGroupOut = listNum;
    }
    this.appendConfig(device, `interface ${iface.name}`);
    this.appendConfig(device, ` ip access-group ${listNum} ${direction}`);
    return null;
  }

  setNatDirection(
    deviceId: string,
    ifaceName: string,
    direction: "inside" | "outside" | null,
  ): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    if (device.type !== "router") return "NAT only on routers";
    const iface = findIface(device, ifaceName);
    if (!iface) return "Interface not found";
    setNatDirection(iface, direction);
    this.appendConfig(device, `interface ${iface.name}`);
    if (direction === "inside") {
      this.appendConfig(device, " ip nat inside");
    } else if (direction === "outside") {
      this.appendConfig(device, " ip nat outside");
    }
    return null;
  }

  addNatInsideSourcePat(
    deviceId: string,
    aclNumber: number,
    outsideIfaceName: string,
  ): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    const err = applyNatPatRule(device, aclNumber, outsideIfaceName);
    if (err) return err;
    this.appendConfig(
      device,
      `ip nat inside source list ${aclNumber} interface ${outsideIfaceName} overload`,
    );
    return null;
  }

  getNatTranslationsText(deviceId: string): string {
    const device = this.devices.get(deviceId);
    if (!device) return "";
    return formatNatTranslations(device);
  }

  getAccessListsText(deviceId: string): string {
    const device = this.devices.get(deviceId);
    if (!device) return "";
    return formatAccessLists(device) || "No access lists configured";
  }

  private aclPermits(
    device: NetworkDevice,
    iface: NetworkInterface,
    direction: "in" | "out",
    packet: Packet,
  ): boolean {
    const ipv4 = packet.layers.ipv4;
    if (!ipv4) return true;
    const listNum =
      direction === "in" ? iface.accessGroupIn : iface.accessGroupOut;
    if (!listNum) return true;
    const list = findAccessList(device, listNum);
    if (!list) return true;
    const transport = packet.layers.tcp ?? packet.layers.udp;
    return (
      evaluateAccessList(list, {
        srcIp: ipv4.src,
        dstIp: ipv4.dst,
        protocol: ipv4.protocol,
        srcPort: transport?.srcPort,
        dstPort: transport?.dstPort,
      }) === "permit"
    );
  }

  private rebuildAllOspf(): void {
    rebuildAllOspfRoutes(this.devices, this.links);
  }

  setHostname(deviceId: string, name: string): void {
    const device = this.devices.get(deviceId);
    if (!device) return;
    device.hostname = name;
    device.name = name;
    this.appendConfig(device, `hostname ${name}`);
  }

  /** Add or replace a static route (routers). */
  addStaticRoute(
    deviceId: string,
    network: string,
    prefixLength: number,
    nextHop: string,
  ): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    if (device.type !== "router") return "Static routes only on routers";
    if (parseIpv4(network) === null || parseIpv4(nextHop) === null) {
      return "Invalid IPv4 address";
    }
    if (prefixLength < 0 || prefixLength > 32) return "Invalid prefix";

    const net = networkAddress(network, prefixLength);
    if (!net) return "Invalid network";

    const nhRoute = this.longestMatch(device, nextHop);
    if (!nhRoute) {
      return `% No route to next-hop ${nextHop}`;
    }

    device.runtime.routingTable = device.runtime.routingTable.filter(
      (r) =>
        !(
          r.kind === "static" &&
          r.network === net &&
          r.prefixLength === prefixLength
        ),
    );
    device.runtime.routingTable.push({
      network: net,
      prefixLength,
      nextHop,
      ifaceId: nhRoute.ifaceId,
      metric: 1,
      kind: "static",
    });
    this.appendConfig(
      device,
      `ip route ${net} ${prefixToMask(prefixLength)} ${nextHop}`,
    );
    return null;
  }

  /** Default gateway for hosts/servers (modeled as 0.0.0.0/0 static route). */
  setDefaultGateway(deviceId: string, gatewayIp: string): string | null {
    const device = this.devices.get(deviceId);
    if (!device) return "Device not found";
    if (device.type !== "host" && device.type !== "server") {
      return "Default gateway only on hosts";
    }
    if (parseIpv4(gatewayIp) === null) return "Invalid IPv4 address";

    const iface = device.interfaces.find((i) => i.ipv4.length > 0);
    if (!iface) return "Configure an IP address first";

    device.runtime.routingTable = device.runtime.routingTable.filter(
      (r) =>
        !(
          r.kind === "static" &&
          r.network === "0.0.0.0" &&
          r.prefixLength === 0
        ),
    );
    device.runtime.routingTable.push({
      network: "0.0.0.0",
      prefixLength: 0,
      nextHop: gatewayIp,
      ifaceId: iface.id,
      metric: 1,
      kind: "static",
    });
    this.appendConfig(device, `ip default-gateway ${gatewayIp}`);
    return null;
  }

  /**
   * Issue ICMP echo from device toward destIp. Runs DES until reply or idle.
   * Returns whether echo reply was received.
   */
  ping(fromDeviceId: string, destIp: string, count = 1): {
    success: boolean;
    output: string;
    events: SimulationEvent[];
    traces: PacketTrace[];
  } {
    const device = this.devices.get(fromDeviceId);
    if (!device) {
      return {
        success: false,
        output: `% Device ${fromDeviceId} not found`,
        events: [],
        traces: [],
      };
    }

    const results: boolean[] = [];
    const allEvents: SimulationEvent[] = [];
    const beforeTraces = this.traces.size;

    for (let seq = 1; seq <= count; seq++) {
      const ok = this.sendEchoRequest(device, destIp, seq);
      if (!ok.started) {
        return {
          success: false,
          output: ok.message,
          events: allEvents,
          traces: this.getTraces().slice(beforeTraces),
        };
      }
      const events = this.runUntilIdle();
      allEvents.push(...events);
      const gotReply = this.didReceiveEchoReply(fromDeviceId, destIp, seq);
      results.push(gotReply);
    }

    const successCount = results.filter(Boolean).length;
    const success = successCount === count;
    const newTraces = this.getTraces().slice(beforeTraces);
    const pathLines = summarizePingPath(newTraces);
    const output = success
      ? `Ping to ${destIp}: ${successCount}/${count} success${pathLines}`
      : `Ping to ${destIp}: ${successCount}/${count} success — destination unreachable or timed out${pathLines}`;

    this.lastEvents.push({
      id: this.nextEventId(),
      t: this.t,
      type: "PING_RESULT",
      deviceId: fromDeviceId,
      data: { destIp, success, successCount, count },
    });
    if (this.lastEvents.length > 500) this.lastEvents.shift();

    return {
      success,
      output,
      events: allEvents,
      traces: newTraces,
    };
  }

  /**
   * Send a single TCP or UDP segment toward destIp and run the DES.
   * Success means the segment was delivered to the destination host (not ACL-dropped).
   */
  probe(
    fromDeviceId: string,
    destIp: string,
    opts: {
      protocol: "tcp" | "udp";
      dstPort: number;
      srcPort?: number;
    },
  ): { success: boolean; output: string; traces: PacketTrace[] } {
    const device = this.devices.get(fromDeviceId);
    if (!device) {
      return {
        success: false,
        output: `% Device ${fromDeviceId} not found`,
        traces: [],
      };
    }
    const outIface = this.pickEgressInterface(device, destIp);
    if (!outIface?.ipv4[0]?.address) {
      return {
        success: false,
        output: `% No route to host ${destIp}`,
        traces: [],
      };
    }
    const srcIp = outIface.ipv4[0].address;
    const srcPort = opts.srcPort ?? 49152;
    const ipProto = opts.protocol === "tcp" ? 6 : 17;
    const beforeTraces = this.traces.size;
    const packetId = this.nextPacketId();
    const transport = { srcPort, dstPort: opts.dstPort };
    const packet: Packet = {
      id: packetId,
      createdAt: this.t,
      layers: {
        ipv4: { src: srcIp, dst: destIp, ttl: 64, protocol: ipProto },
        ...(opts.protocol === "tcp" ? { tcp: transport } : { udp: transport }),
      },
      meta: { hopDeviceIds: [] },
    };
    const label = opts.protocol.toUpperCase();
    this.ensureTrace(
      packet,
      label,
      `${label} ${srcIp}:${srcPort} → ${destIp}:${opts.dstPort}`,
    );
    this.noteHop(packet, device.id, `originate ${label} segment`);
    this.l3Send(device, outIface, packet);
    this.runUntilIdle();

    const tr = this.traces.get(packetId);
    const success = tr?.outcome === "delivered";
    const droppedAcl = tr?.hops.some((h) => h.action.includes("ACL deny")) ?? false;
    const output = success
      ? `${label} probe to ${destIp}:${opts.dstPort} succeeded`
      : droppedAcl
        ? `${label} probe to ${destIp}:${opts.dstPort} denied by ACL`
        : `${label} probe to ${destIp}:${opts.dstPort} failed`;

    return {
      success,
      output,
      traces: this.getTraces().slice(beforeTraces),
    };
  }

  step(maxEvents = 1): SimulationEvent[] {
    const out: SimulationEvent[] = [];
    for (let i = 0; i < maxEvents; i++) {
      const ev = this.queue.pop();
      if (!ev) break;
      this.t = ev.t;
      this.dispatch(ev);
      out.push(ev);
      this.lastEvents.push(ev);
      if (this.lastEvents.length > 500) this.lastEvents.shift();
    }
    return out;
  }

  runUntilIdle(maxEvents = MAX_EVENTS_PER_RUN): SimulationEvent[] {
    const out: SimulationEvent[] = [];
    for (let i = 0; i < maxEvents; i++) {
      if (this.queue.size === 0) break;
      out.push(...this.step(1));
    }
    return out;
  }

  private linkUp(link: NetworkLink): boolean {
    return link.state === "up";
  }

  private appendConfig(device: NetworkDevice, line: string): void {
    if (!device.runningConfigLines.includes(line.trim()) && line.trim()) {
      // Keep a simple linear running-config for show run
      if (line.startsWith("interface ") || line.startsWith("hostname ")) {
        device.runningConfigLines.push(line);
      } else {
        device.runningConfigLines.push(line);
      }
    }
  }

  rebuildConnectedRoutes(device: NetworkDevice): void {
    device.runtime.routingTable = device.runtime.routingTable.filter(
      (r) => r.kind !== "connected",
    );
    for (const iface of device.interfaces) {
      for (const ip of iface.ipv4) {
        const net = networkAddress(ip.address, ip.prefixLength);
        if (!net) continue;
        device.runtime.routingTable.push({
          network: net,
          prefixLength: ip.prefixLength,
          nextHop: null,
          ifaceId: iface.id,
          metric: 0,
          kind: "connected",
        });
      }
    }
  }

  private nextEventId(): string {
    return `e${++this.eventSeq}`;
  }

  private nextPacketId(): string {
    return `p${++this.packetSeq}`;
  }

  private scheduleArrive(
    t: number,
    deviceId: string,
    ifaceId: string,
    packet: Packet,
  ): void {
    this.packets.set(packet.id, packet);
    this.queue.push({
      id: this.nextEventId(),
      t,
      type: "PACKET_ARRIVE",
      deviceId,
      packetId: packet.id,
      data: { ifaceId },
    });
  }

  private ensureTrace(packet: Packet, protocol: string, summary: string): PacketTrace {
    let tr = this.traces.get(packet.id);
    if (!tr) {
      tr = {
        packetId: packet.id,
        protocol,
        summary,
        hops: [],
        outcome: "in_flight",
      };
      this.traces.set(packet.id, tr);
    }
    return tr;
  }

  private noteHop(packet: Packet, deviceId: string, action: string): void {
    const tr = this.traces.get(packet.id);
    if (!tr) return;
    tr.hops.push({ t: this.t, deviceId, action });
    packet.meta.hopDeviceIds = packet.meta.hopDeviceIds ?? [];
    packet.meta.hopDeviceIds.push(deviceId);
    this.lastEvents.push({
      id: this.nextEventId(),
      t: this.t,
      type: "LINK_TRANSMIT",
      deviceId,
      packetId: packet.id,
      data: { action, protocol: tr.protocol, summary: tr.summary },
    });
    if (this.lastEvents.length > 500) this.lastEvents.shift();
  }

  private sendEchoRequest(
    device: NetworkDevice,
    destIp: string,
    sequence: number,
  ): { started: boolean; message: string; packetId?: string } {
    const outIface = this.pickEgressInterface(device, destIp);
    if (!outIface) {
      return {
        started: false,
        message: `% No route to host ${destIp}`,
      };
    }
    if (outIface.operationalStatus !== "up") {
      return {
        started: false,
        message: `% Interface ${outIface.name} is down`,
      };
    }
    const srcIp = outIface.ipv4[0]?.address;
    if (!srcIp) {
      return {
        started: false,
        message: `% ${outIface.name} has no IP address`,
      };
    }

    const packetId = this.nextPacketId();
    const packet: Packet = {
      id: packetId,
      createdAt: this.t,
      layers: {
        ipv4: {
          src: srcIp,
          dst: destIp,
          ttl: 64,
          protocol: 1,
        },
        icmp: {
          type: ICMP.ECHO_REQUEST,
          code: 0,
          identifier: 1,
          sequence,
          data: "netforge",
        },
      },
      meta: { hopDeviceIds: [] },
    };
    this.ensureTrace(packet, "ICMP", `echo-request ${srcIp} → ${destIp}`);
    this.noteHop(packet, device.id, "originate echo-request");
    this.l3Send(device, outIface, packet);
    return { started: true, message: "", packetId };
  }

  private didReceiveEchoReply(
    deviceId: string,
    fromIp: string,
    sequence: number,
  ): boolean {
    for (const tr of this.traces.values()) {
      if (tr.protocol !== "ICMP") continue;
      if (tr.outcome !== "delivered") continue;
      if (!tr.summary.includes("echo-reply") || !tr.summary.includes(fromIp)) continue;
      const last = tr.hops[tr.hops.length - 1];
      if (last?.deviceId === deviceId && last.action.includes(`seq=${sequence}`)) {
        return true;
      }
      if (last?.deviceId === deviceId && tr.summary.includes(`seq=${sequence}`)) {
        return true;
      }
    }
    // Fallback: any delivered reply to this device from dest
    for (const tr of this.traces.values()) {
      if (
        tr.protocol === "ICMP" &&
        tr.outcome === "delivered" &&
        tr.summary.includes("echo-reply") &&
        tr.summary.includes(fromIp) &&
        tr.hops.some((h) => h.deviceId === deviceId && h.action.includes("deliver"))
      ) {
        return true;
      }
    }
    return false;
  }

  private pickEgressInterface(
    device: NetworkDevice,
    destIp: string,
  ): NetworkInterface | null {
    const route = this.longestMatch(device, destIp);
    if (route) {
      return device.interfaces.find((i) => i.id === route.ifaceId) ?? null;
    }
    // On-link without explicit route (hosts)
    for (const iface of device.interfaces) {
      for (const ip of iface.ipv4) {
        if (ipv4InSubnet(destIp, ip.address, ip.prefixLength)) return iface;
      }
    }
    return null;
  }

  /** L3 → resolve ARP → L2 transmit */
  private l3Send(device: NetworkDevice, outIface: NetworkInterface, packet: Packet): void {
    const ipv4 = packet.layers.ipv4;
    if (!ipv4) return;

    // Destination on this device?
    if (this.deviceOwnsIp(device, ipv4.dst)) {
      this.deliverLocal(device, packet);
      return;
    }

    let nextHopIp = ipv4.dst;
    const route = this.longestMatch(device, ipv4.dst);
    if (route?.nextHop) nextHopIp = route.nextHop;

    const arp = device.runtime.arpTable.find((e) => e.ip === nextHopIp);
    if (!arp) {
      // Queue packet and send ARP request
      const waiting = device.runtime.pendingArp.get(nextHopIp) ?? [];
      waiting.push(packet.id);
      device.runtime.pendingArp.set(nextHopIp, waiting);
      this.packets.set(packet.id, packet);
      this.sendArpRequest(device, outIface, nextHopIp);
      return;
    }

    packet.layers.eth = {
      dstMac: arp.mac,
      srcMac: outIface.macAddress,
      ethertype: ETHertype.IPV4,
    };
    this.transmit(device, outIface, packet);
  }

  private longestMatch(device: NetworkDevice, destIp: string): RouteEntry | null {
    let best: RouteEntry | null = null;
    for (const route of device.runtime.routingTable) {
      if (!ipv4InSubnet(destIp, route.network, route.prefixLength)) continue;
      if (!best) {
        best = route;
        continue;
      }
      if (route.prefixLength > best.prefixLength) {
        best = route;
        continue;
      }
      if (route.prefixLength === best.prefixLength && route.metric < best.metric) {
        best = route;
      }
    }
    return best;
  }

  private deviceOwnsIp(device: NetworkDevice, ip: string): boolean {
    return device.interfaces.some((i) => i.ipv4.some((a) => a.address === ip));
  }

  private sendArpRequest(
    device: NetworkDevice,
    iface: NetworkInterface,
    targetIp: string,
  ): void {
    const srcIp = iface.ipv4[0]?.address;
    if (!srcIp) return;
    const packet: Packet = {
      id: this.nextPacketId(),
      createdAt: this.t,
      layers: {
        eth: {
          dstMac: BROADCAST_MAC,
          srcMac: iface.macAddress,
          ethertype: ETHertype.ARP,
        },
        arp: {
          op: "request",
          senderMac: iface.macAddress,
          senderIp: srcIp,
          targetMac: "00:00:00:00:00:00",
          targetIp,
        },
      },
      meta: {},
    };
    this.ensureTrace(
      packet,
      "ARP",
      `who-has ${targetIp} tell ${srcIp}`,
    );
    this.noteHop(packet, device.id, "arp-request");
    this.transmit(device, iface, packet);
  }

  private resolveL3EgressPort(
    device: NetworkDevice,
    iface: NetworkInterface,
  ): NetworkInterface | null {
    if (iface.sviVlan != null) {
      return pickVlanEgressPort(device, iface.sviVlan) ?? null;
    }
    return getPhysicalInterface(device, iface);
  }

  private transmit(
    device: NetworkDevice,
    iface: NetworkInterface,
    packet: Packet,
  ): void {
    if (iface.sviVlan != null) {
      packet.meta.vlanId = iface.sviVlan;
    }
    const physical = this.resolveL3EgressPort(device, iface);
    if (!physical) {
      packet.meta.dropReason = "no vlan egress port";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      return;
    }
    if (iface.encapVlan != null && device.type === "router") {
      packet.meta.vlanId = iface.encapVlan;
    }
    if (physical.operationalStatus !== "up") {
      packet.meta.dropReason = "interface down";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      physical.counters.drops++;
      return;
    }
    const peer = peerFor(this.links, device.id, physical.id);
    if (!peer) {
      packet.meta.dropReason = "no link";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      return;
    }
    physical.counters.outPackets++;
    packet.meta.egressIface = iface.id;
    this.applyPeerSwitchEgressVlan(device, physical, packet, peer);
    const delay = peer.link.latencyMs;
    this.scheduleArrive(this.t + delay, peer.peerDeviceId, peer.peerIfaceId, packet);
  }

  /** Tag frames for switch trunk peers when L3 devices reply on a VLAN context. */
  private applyPeerSwitchEgressVlan(
    device: NetworkDevice,
    iface: NetworkInterface,
    packet: Packet,
    peer: { peerDeviceId: string; peerIfaceId: string },
  ): void {
    if (device.type === "switch") return;
    const peerDev = this.devices.get(peer.peerDeviceId);
    if (!peerDev || peerDev.type !== "switch") return;
    const peerIface = peerDev.interfaces.find((i) => i.id === peer.peerIfaceId);
    const sp = peerIface?.switchport;
    if (!sp || sp.mode !== "trunk") return;

    const vlanId = packet.meta.vlanId ?? packet.layers.vlan?.vlanId;
    if (!vlanId) return;

    if (vlanId === sp.nativeVlan) {
      delete packet.layers.vlan;
    } else if (sp.allowedVlans.includes(vlanId)) {
      packet.layers.vlan = {
        vlanId,
        ethertype: packet.layers.eth?.ethertype ?? ETHertype.IPV4,
      };
    }
  }

  /** Strip 802.1Q on L3 devices; remember VLAN for symmetric trunk replies. */
  private absorbIngressVlan(
    device: NetworkDevice,
    packet: Packet,
  ): void {
    if (device.type === "switch") return;
    if (packet.layers.vlan) {
      packet.meta.vlanId = packet.layers.vlan.vlanId;
      delete packet.layers.vlan;
    }
  }

  private dispatch(ev: SimulationEvent): void {
    if (ev.type === "PACKET_ARRIVE" && ev.deviceId && ev.packetId) {
      const device = this.devices.get(ev.deviceId);
      const packet = this.packets.get(ev.packetId);
      const ifaceId = String(ev.data.ifaceId ?? "");
      if (!device || !packet) return;
      const iface = device.interfaces.find((i) => i.id === ifaceId);
      if (!iface || iface.operationalStatus !== "up") {
        packet.meta.dropReason = "ingress down";
        const tr = this.traces.get(packet.id);
        if (tr) tr.outcome = "dropped";
        return;
      }
      iface.counters.inPackets++;
      packet.meta.ingressIface = iface.id;
      this.handleArrive(device, iface, packet);
    }
  }

  private handleArrive(
    device: NetworkDevice,
    iface: NetworkInterface,
    packet: Packet,
  ): void {
    const eth = packet.layers.eth;
    if (!eth) {
      // L3-originated without eth yet shouldn't arrive; drop
      return;
    }

    if (device.type === "switch") {
      const eth = packet.layers.eth!;
      const ingressVlan = this.resolveIngressVlan(iface, packet);
      if (ingressVlan !== null) {
        if (!isStpBlocked(iface)) {
          const existing = device.runtime.macTable.find(
            (m) => macEqual(m.mac, eth.srcMac) && m.vlan === ingressVlan,
          );
          if (existing) {
            existing.ifaceId = iface.id;
            existing.ageSimTime = this.t;
          } else {
            device.runtime.macTable.push({
              mac: eth.srcMac,
              ifaceId: iface.id,
              vlan: ingressVlan,
              ageSimTime: this.t,
            });
          }
        }

        if (device.ipRouting) {
          const svi = findSviForVlan(device, ingressVlan);
          if (svi && svi.operationalStatus === "up") {
            const forUs =
              isBroadcastMac(eth.dstMac) || macEqual(eth.dstMac, svi.macAddress);
            if (forUs) {
              packet.meta.vlanId = ingressVlan;
              if (eth.ethertype === ETHertype.ARP && packet.layers.arp) {
                this.handleArp(device, svi, packet);
                return;
              }
              if (eth.ethertype === ETHertype.IPV4 && packet.layers.ipv4) {
                this.handleIpv4(device, svi, packet);
                return;
              }
            }
          }
        }
      }
      this.switchForward(device, iface, packet);
      return;
    }

    this.absorbIngressVlan(device, packet);

    let logicalIface = iface;
    if (device.type === "router" && packet.meta.vlanId != null) {
      const sub = findSubinterfaceForVlan(device, iface, packet.meta.vlanId);
      if (sub) logicalIface = sub;
    }

    // Router / host: accept if dst MAC is ours or broadcast
    if (
      !isBroadcastMac(eth.dstMac) &&
      !macEqual(eth.dstMac, iface.macAddress)
    ) {
      packet.meta.dropReason = "not destined to this MAC";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      return;
    }

    if (eth.ethertype === ETHertype.ARP && packet.layers.arp) {
      this.handleArp(device, logicalIface, packet);
      return;
    }

    if (eth.ethertype === ETHertype.IPV4 && packet.layers.ipv4) {
      this.handleIpv4(device, logicalIface, packet);
      return;
    }
  }

  private switchForward(
    device: NetworkDevice,
    inIface: NetworkInterface,
    packet: Packet,
  ): void {
    if (isStpBlocked(inIface)) {
      packet.meta.dropReason = "STP blocking ingress";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      this.noteHop(packet, device.id, `STP blocked on ${inIface.name}`);
      return;
    }

    const eth = packet.layers.eth!;
    const ingressVlan = this.resolveIngressVlan(inIface, packet);
    if (ingressVlan === null) {
      packet.meta.dropReason = "VLAN mismatch / not allowed";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      this.noteHop(packet, device.id, "drop VLAN");
      return;
    }

    // Strip tag for access egress later; keep tag metadata on packet
    if (!packet.layers.vlan) {
      packet.layers.vlan = { vlanId: ingressVlan, ethertype: eth.ethertype };
    }

    this.noteHop(
      packet,
      device.id,
      `L2 learn ${eth.srcMac} vlan ${ingressVlan} on ${inIface.name}`,
    );

    const existing = device.runtime.macTable.find(
      (m) => macEqual(m.mac, eth.srcMac) && m.vlan === ingressVlan,
    );
    if (existing) {
      existing.ifaceId = inIface.id;
      existing.ageSimTime = this.t;
    } else {
      device.runtime.macTable.push({
        mac: eth.srcMac,
        ifaceId: inIface.id,
        vlan: ingressVlan,
        ageSimTime: this.t,
      });
    }

    const isBcast = isBroadcastMac(eth.dstMac);
    let known = device.runtime.macTable.find(
      (m) => macEqual(m.mac, eth.dstMac) && m.vlan === ingressVlan,
    );
    if (known) {
      const knownIface = device.interfaces.find((i) => i.id === known!.ifaceId);
      if (!knownIface || isStpBlocked(knownIface)) {
        known = undefined;
      }
    }

    const egressIfaces = device.interfaces.filter((i) => {
      if (i.id === inIface.id) return false;
      if (i.operationalStatus !== "up") return false;
      if (isStpBlocked(i)) return false;
      if (!this.vlanAllowedOnEgress(i, ingressVlan)) return false;
      if (isBcast || !known) return true;
      return i.id === known.ifaceId;
    });

    for (const out of egressIfaces) {
      const clone = clonePacket(packet, this.nextPacketId());
      this.prepareEgressVlan(out, clone, ingressVlan);
      this.traces.set(clone.id, {
        packetId: clone.id,
        protocol: this.traces.get(packet.id)?.protocol ?? "ETH",
        summary: this.traces.get(packet.id)?.summary ?? "L2 frame",
        hops: [...(this.traces.get(packet.id)?.hops ?? [])],
        outcome: "in_flight",
      });
      this.noteHop(clone, device.id, `forward vlan ${ingressVlan} → ${out.name}`);
      this.transmit(device, out, clone);
    }

    if (egressIfaces.length === 0) {
      packet.meta.dropReason = "no switch egress (VLAN?)";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
    }
  }

  private resolveIngressVlan(
    iface: NetworkInterface,
    packet: Packet,
  ): number | null {
    const sp = iface.switchport ?? {
      mode: "access" as const,
      accessVlan: 1,
      nativeVlan: 1,
      allowedVlans: [1],
    };
    if (packet.layers.vlan) {
      if (sp.mode === "access") {
        // Tagged on access — drop (educational strict)
        return null;
      }
      if (!sp.allowedVlans.includes(packet.layers.vlan.vlanId)) return null;
      return packet.layers.vlan.vlanId;
    }
    // Untagged
    if (sp.mode === "access") return sp.accessVlan;
    return sp.nativeVlan;
  }

  private vlanAllowedOnEgress(iface: NetworkInterface, vlan: number): boolean {
    const sp = iface.switchport ?? {
      mode: "access" as const,
      accessVlan: 1,
      nativeVlan: 1,
      allowedVlans: [1],
    };
    if (sp.mode === "access") return sp.accessVlan === vlan;
    return sp.allowedVlans.includes(vlan);
  }

  private prepareEgressVlan(
    outIface: NetworkInterface,
    packet: Packet,
    vlan: number,
  ): void {
    const sp = outIface.switchport ?? {
      mode: "access" as const,
      accessVlan: 1,
      nativeVlan: 1,
      allowedVlans: [1],
    };
    if (sp.mode === "access") {
      delete packet.layers.vlan;
    } else if (vlan === sp.nativeVlan) {
      delete packet.layers.vlan;
    } else {
      packet.layers.vlan = {
        vlanId: vlan,
        ethertype: packet.layers.eth?.ethertype ?? 0x0800,
      };
    }
  }

  private handleArp(
    device: NetworkDevice,
    iface: NetworkInterface,
    packet: Packet,
  ): void {
    const arp = packet.layers.arp!;
    this.noteHop(packet, device.id, `arp ${arp.op}`);

    // Learn sender
    const existing = device.runtime.arpTable.find((e) => e.ip === arp.senderIp);
    if (existing) {
      existing.mac = arp.senderMac;
      existing.ifaceId = iface.id;
      existing.ageSimTime = this.t;
    } else {
      device.runtime.arpTable.push({
        ip: arp.senderIp,
        mac: arp.senderMac,
        ifaceId: iface.id,
        ageSimTime: this.t,
      });
    }

    if (arp.op === "request" && this.deviceOwnsIp(device, arp.targetIp)) {
      const owner =
        findInterfaceOwningIp(device, arp.targetIp) ?? iface;
      const reply: Packet = {
        id: this.nextPacketId(),
        createdAt: this.t,
        layers: {
          eth: {
            dstMac: arp.senderMac,
            srcMac: iface.macAddress,
            ethertype: ETHertype.ARP,
          },
          arp: {
            op: "reply",
            senderMac: owner.macAddress,
            senderIp: arp.targetIp,
            targetMac: arp.senderMac,
            targetIp: arp.senderIp,
          },
        },
        meta: packet.meta.vlanId ? { vlanId: packet.meta.vlanId } : {},
      };
      this.ensureTrace(reply, "ARP", `${arp.targetIp} is-at ${owner.macAddress}`);
      this.noteHop(reply, device.id, "arp-reply");
      this.transmit(device, owner, reply);
    }

    if (arp.op === "reply") {
      const pending = device.runtime.pendingArp.get(arp.senderIp);
      if (pending) {
        device.runtime.pendingArp.delete(arp.senderIp);
        for (const pid of pending) {
          const waiting = this.packets.get(pid);
          if (!waiting?.layers.ipv4) continue;
          if (packet.meta.vlanId) {
            waiting.meta.vlanId = packet.meta.vlanId;
          }
          const outIface =
            device.interfaces.find((i) => i.id === iface.id) ??
            this.pickEgressInterface(device, waiting.layers.ipv4.dst);
          if (!outIface) continue;
          waiting.layers.eth = {
            dstMac: arp.senderMac,
            srcMac: outIface.macAddress,
            ethertype: ETHertype.IPV4,
          };
          this.transmit(device, outIface, waiting);
        }
      }
    }
  }

  private handleIpv4(
    device: NetworkDevice,
    iface: NetworkInterface,
    packet: Packet,
  ): void {
    const ipv4 = packet.layers.ipv4!;
    this.noteHop(packet, device.id, `ipv4 ${ipv4.src}→${ipv4.dst}`);

    if (!this.aclPermits(device, iface, "in", packet)) {
      packet.meta.dropReason = "ACL deny";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      this.noteHop(packet, device.id, `ACL deny ingress on ${iface.name}`);
      return;
    }

    const natInbound = applyInboundNat(device, iface, packet, this.t);
    if (natInbound) {
      this.noteHop(packet, device.id, "NAT reverse");
    }

    if (this.deviceOwnsIp(device, ipv4.dst)) {
      this.deliverLocal(device, packet);
      return;
    }

    // Hosts don't forward; switches need ip routing
    if (device.type === "host" || device.type === "server") {
      packet.meta.dropReason = "host not destined";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      return;
    }
    if (device.type === "switch" && !device.ipRouting) {
      packet.meta.dropReason = "switch not routing";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      return;
    }

    // Router / L3 switch forward
    if (ipv4.ttl <= 1) {
      packet.meta.dropReason = "TTL exceeded";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      return;
    }
    ipv4.ttl -= 1;

    const outIface = this.pickEgressInterface(device, ipv4.dst);
    if (!outIface || outIface.id === iface.id) {
      // allow hairpin only if different path — if same, still try ARP path
    }
    if (!outIface) {
      packet.meta.dropReason = "no route";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      return;
    }

    if (!this.aclPermits(device, outIface, "out", packet)) {
      packet.meta.dropReason = "ACL deny";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      this.noteHop(packet, device.id, `ACL deny egress on ${outIface.name}`);
      return;
    }

    if (applyOutboundNat(device, iface, outIface, packet, this.t)) {
      this.noteHop(packet, device.id, "NAT overload");
    }

    // Clear eth for re-ARP on egress
    delete packet.layers.eth;
    this.l3Send(device, outIface, packet);
  }

  private deliverLocal(device: NetworkDevice, packet: Packet): void {
    const ipv4 = packet.layers.ipv4;
    const icmp = packet.layers.icmp;
    if (ipv4 && icmp && icmp.type === ICMP.ECHO_REQUEST) {
      this.noteHop(packet, device.id, `deliver echo-request seq=${icmp.sequence}`);
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "delivered";

      // Find iface that owns dst
      const iface =
        device.interfaces.find((i) =>
          i.ipv4.some((a) => a.address === ipv4.dst),
        ) ?? device.interfaces[0];
      if (!iface) return;

      const reply: Packet = {
        id: this.nextPacketId(),
        createdAt: this.t,
        layers: {
          ipv4: {
            src: ipv4.dst,
            dst: ipv4.src,
            ttl: 64,
            protocol: 1,
          },
          icmp: {
            type: ICMP.ECHO_REPLY,
            code: 0,
            identifier: icmp.identifier,
            sequence: icmp.sequence,
            data: icmp.data,
          },
        },
        meta: packet.meta.vlanId ? { vlanId: packet.meta.vlanId } : {},
      };
      this.ensureTrace(
        reply,
        "ICMP",
        `echo-reply from ${ipv4.dst} → ${ipv4.src} seq=${icmp.sequence}`,
      );
      this.noteHop(reply, device.id, "originate echo-reply");
      this.l3Send(device, iface, reply);
      return;
    }

    if (ipv4 && icmp && icmp.type === ICMP.ECHO_REPLY) {
      this.noteHop(
        packet,
        device.id,
        `deliver echo-reply seq=${icmp.sequence}`,
      );
      const tr = this.traces.get(packet.id);
      if (tr) {
        tr.outcome = "delivered";
        tr.summary = `echo-reply from ${ipv4.src} → ${ipv4.dst} seq=${icmp.sequence}`;
      }
      return;
    }

    const tr = this.traces.get(packet.id);
    if (tr) tr.outcome = "delivered";
    this.noteHop(packet, device.id, "deliver local");
  }
}

function clonePacket(packet: Packet, newId: string): Packet {
  return {
    id: newId,
    createdAt: packet.createdAt,
    layers: structuredClone(packet.layers),
    meta: structuredClone(packet.meta),
  };
}

export function prefixToMask(prefix: number): string {
  if (prefix <= 0) return "0.0.0.0";
  if (prefix >= 32) return "255.255.255.255";
  const mask = (~0 << (32 - prefix)) >>> 0;
  return [
    (mask >>> 24) & 255,
    (mask >>> 16) & 255,
    (mask >>> 8) & 255,
    mask & 255,
  ].join(".");
}

function summarizePingPath(traces: PacketTrace[]): string {
  const icmp = traces.find((t) => t.protocol === "ICMP" && t.summary.includes("echo-request"));
  if (!icmp?.hops.length) return "";
  const steps = icmp.hops.map((h) => `${h.deviceId}: ${h.action}`);
  const arp = traces.find((t) => t.protocol === "ARP" && t.summary.includes("who-has"));
  if (arp?.hops.length) {
    steps.unshift(...arp.hops.map((h) => `${h.deviceId}: ${h.action}`));
  }
  const reply = traces.find(
    (t) => t.protocol === "ICMP" && t.summary.includes("echo-reply") && t.outcome === "delivered",
  );
  if (reply?.hops.length) {
    steps.push(...reply.hops.map((h) => `${h.deviceId}: ${h.action}`));
  }
  const unique = [...new Set(steps)];
  if (!unique.length) return "";
  return `\n  Path: ${unique.join(" → ")}`;
}

export function maskToPrefix(mask: string): number | null {
  const n = parseIpv4(mask);
  if (n === null) return null;
  // count leading ones
  let bits = 0;
  let v = n;
  for (let i = 0; i < 32; i++) {
    if (v & 0x80000000) {
      bits++;
      v = (v << 1) >>> 0;
    } else {
      // rest must be zero
      if (v !== 0) return null;
      break;
    }
  }
  return bits;
}
