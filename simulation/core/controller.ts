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
      session = { mode: "user", ifaceName: null };
      this.cliSessions.set(deviceId, session);
    }
    return executeCliLine(this, device, session, line);
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
    this.appendConfig(device, admin === "up" ? " no shutdown" : " shutdown");
    return null;
  }

  setHostname(deviceId: string, name: string): void {
    const device = this.devices.get(deviceId);
    if (!device) return;
    device.hostname = name;
    device.name = name;
    this.appendConfig(device, `hostname ${name}`);
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
    const output = success
      ? `Ping to ${destIp}: ${successCount}/${count} success`
      : `Ping to ${destIp}: ${successCount}/${count} success — destination unreachable or timed out`;

    return {
      success,
      output,
      events: allEvents,
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
    // Longest-prefix match
    let best: RouteEntry | null = null;
    for (const route of device.runtime.routingTable) {
      if (!ipv4InSubnet(destIp, route.network, route.prefixLength)) continue;
      if (!best || route.prefixLength > best.prefixLength) best = route;
    }
    if (best) {
      return device.interfaces.find((i) => i.id === best!.ifaceId) ?? null;
    }
    // Hosts: use first iface with IP if dest on-link
    for (const iface of device.interfaces) {
      for (const ip of iface.ipv4) {
        if (ipv4InSubnet(destIp, ip.address, ip.prefixLength)) return iface;
      }
    }
    return device.interfaces.find((i) => i.ipv4.length > 0) ?? null;
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
      if (!best || route.prefixLength > best.prefixLength) best = route;
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

  private transmit(
    device: NetworkDevice,
    iface: NetworkInterface,
    packet: Packet,
  ): void {
    if (iface.operationalStatus !== "up") {
      packet.meta.dropReason = "interface down";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      iface.counters.drops++;
      return;
    }
    const peer = peerFor(this.links, device.id, iface.id);
    if (!peer) {
      packet.meta.dropReason = "no link";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      return;
    }
    iface.counters.outPackets++;
    packet.meta.egressIface = iface.id;
    const delay = peer.link.latencyMs;
    this.scheduleArrive(this.t + delay, peer.peerDeviceId, peer.peerIfaceId, packet);
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
      this.switchForward(device, iface, packet);
      return;
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
      this.handleArp(device, iface, packet);
      return;
    }

    if (eth.ethertype === ETHertype.IPV4 && packet.layers.ipv4) {
      this.handleIpv4(device, iface, packet);
      return;
    }
  }

  private switchForward(
    device: NetworkDevice,
    inIface: NetworkInterface,
    packet: Packet,
  ): void {
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
    const known = device.runtime.macTable.find(
      (m) => macEqual(m.mac, eth.dstMac) && m.vlan === ingressVlan,
    );

    const egressIfaces = device.interfaces.filter((i) => {
      if (i.id === inIface.id) return false;
      if (i.operationalStatus !== "up") return false;
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
            senderMac: iface.macAddress,
            senderIp: arp.targetIp,
            targetMac: arp.senderMac,
            targetIp: arp.senderIp,
          },
        },
        meta: {},
      };
      this.ensureTrace(reply, "ARP", `${arp.targetIp} is-at ${iface.macAddress}`);
      this.noteHop(reply, device.id, "arp-reply");
      this.transmit(device, iface, reply);
    }

    if (arp.op === "reply") {
      const pending = device.runtime.pendingArp.get(arp.senderIp);
      if (pending) {
        device.runtime.pendingArp.delete(arp.senderIp);
        for (const pid of pending) {
          const waiting = this.packets.get(pid);
          if (!waiting?.layers.ipv4) continue;
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

    if (this.deviceOwnsIp(device, ipv4.dst)) {
      this.deliverLocal(device, packet);
      return;
    }

    // Hosts don't forward
    if (device.type === "host" || device.type === "server") {
      packet.meta.dropReason = "host not destined";
      const tr = this.traces.get(packet.id);
      if (tr) tr.outcome = "dropped";
      return;
    }

    // Router forward
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
        meta: {},
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
