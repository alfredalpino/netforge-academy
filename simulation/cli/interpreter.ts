import type { SimulationController } from "../core/controller";
import { maskToPrefix, prefixToMask } from "../core/controller";
import { parseSubinterfaceName } from "../core/subinterface";
import { parseVlanInterfaceName } from "../core/svi";
import { parseAclEndpoint, parseAclPortEq } from "../core/acl";
import type { CliResult, NetworkDevice } from "../core/types";

export type CliMode = "user" | "privileged" | "config" | "interface" | "router" | "dhcp-pool";

export interface CliSession {
  mode: CliMode;
  ifaceName: string | null;
  routerProcessId: number | null;
  dhcpPoolName: string | null;
}

function promptFor(device: NetworkDevice, session: CliSession): string {
  const host = device.hostname || device.name;
  if (session.mode === "user") return `${host}>`;
  if (session.mode === "privileged") return `${host}#`;
  if (session.mode === "config") return `${host}(config)#`;
  if (session.mode === "router") {
    return `${host}(config-router)#`;
  }
  if (session.mode === "dhcp-pool") {
    return `${host}(dhcp-config)#`;
  }
  if (session.mode === "interface") {
    return `${host}(config-if)#`;
  }
  return `${host}>`;
}

function result(
  device: NetworkDevice,
  session: CliSession,
  output: string,
  error?: string,
): CliResult {
  return {
    output,
    error,
    prompt: promptFor(device, session),
    mode: session.mode,
  };
}

/** Match command token allowing unique abbreviations. */
export function matchToken(input: string, candidates: string[]): string | null {
  const q = input.toLowerCase();
  const hits = candidates.filter((c) => c.toLowerCase().startsWith(q));
  if (hits.length === 1) return hits[0];
  if (hits.includes(q)) return hits.find((h) => h.toLowerCase() === q) ?? null;
  return null;
}

function tokenize(line: string): string[] {
  return line.trim().split(/\s+/).filter(Boolean);
}

export function executeCliLine(
  sim: SimulationController,
  device: NetworkDevice,
  session: CliSession,
  rawLine: string,
): CliResult {
  const line = rawLine.trim();
  if (!line) return result(device, session, "");

  // Host-friendly: allow ping at user/privileged
  const tokens = tokenize(line);
  const head = tokens[0]?.toLowerCase() ?? "";

  if (head === "enable" || head === "en") {
    if (session.mode === "user") session.mode = "privileged";
    return result(device, session, "");
  }

  if (head === "disable") {
    if (session.mode === "privileged") {
      session.mode = "user";
      return result(device, session, "");
    }
  }

  if (head === "exit" || head === "end") {
    if (head === "end" && session.mode !== "user") {
      session.mode = "privileged";
      session.ifaceName = null;
      session.routerProcessId = null;
      session.dhcpPoolName = null;
      return result(device, session, "");
    }
    if (session.mode === "router") {
      session.mode = "config";
      session.routerProcessId = null;
      return result(device, session, "");
    }
    if (session.mode === "dhcp-pool") {
      session.mode = "config";
      session.dhcpPoolName = null;
      return result(device, session, "");
    }
    if (session.mode === "interface") {
      session.mode = "config";
      session.ifaceName = null;
      return result(device, session, "");
    }
    if (session.mode === "config") {
      session.mode = "privileged";
      return result(device, session, "");
    }
    if (head === "exit" && session.mode === "privileged") {
      session.mode = "user";
      return result(device, session, "");
    }
    return result(device, session, "");
  }

  if (
    (session.mode === "user" || session.mode === "privileged") &&
    (head === "ping")
  ) {
    const dest = tokens[1];
    if (!dest) return result(device, session, "", "Usage: ping <ip>");
    const ping = sim.ping(device.id, dest, 1);
    return result(device, session, ping.output);
  }

  if (session.mode === "privileged" || session.mode === "user") {
    if (head === "show" || head === "sh") {
      return handleShow(sim, device, session, tokens.slice(1));
    }
  }

  if (session.mode === "privileged") {
    const conf = matchToken(tokens[0] ?? "", ["configure"]);
    if (conf && (tokens[1] === undefined || matchToken(tokens[1], ["terminal", "t"]))) {
      session.mode = "config";
      return result(device, session, "Enter configuration commands, one per line. End with CNTL/Z.");
    }
  }

  if (session.mode === "config") {
    if (head === "hostname") {
      const name = tokens[1];
      if (!name) return result(device, session, "", "Usage: hostname <name>");
      sim.setHostname(device.id, name);
      return result(device, session, "");
    }
    if (head === "ip" && tokens[1]?.toLowerCase() === "route") {
      if (device.type !== "router") {
        return result(device, session, "", "% Static routes only on routers");
      }
      const net = tokens[2];
      const mask = tokens[3];
      const nextHop = tokens[4];
      if (!net || !mask || !nextHop) {
        return result(device, session, "", "Usage: ip route <network> <mask> <next-hop>");
      }
      const prefix = mask.includes(".") ? maskToPrefix(mask) : Number(mask);
      if (prefix === null || Number.isNaN(prefix)) {
        return result(device, session, "", "% Invalid mask");
      }
      const err = sim.addStaticRoute(device.id, net, prefix, nextHop);
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
    if (head === "ip" && tokens[1]?.toLowerCase() === "default-gateway") {
      const gw = tokens[2];
      if (!gw) {
        return result(device, session, "", "Usage: ip default-gateway <ip>");
      }
      const err = sim.setDefaultGateway(device.id, gw);
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
    if (head === "interface" || head === "int") {
      const name = tokens[1];
      if (!name) return result(device, session, "", "Usage: interface <name>");
      if (parseSubinterfaceName(name)) {
        const err = sim.ensureSubinterface(device.id, name);
        if (err) return result(device, session, "", err);
      }
      if (parseVlanInterfaceName(name)) {
        const err = sim.ensureSvi(device.id, name);
        if (err) return result(device, session, "", err);
      }
      const live = sim.getDevice(device.id);
      const iface = live?.interfaces.find(
        (i) => i.name.toLowerCase() === name.toLowerCase(),
      );
      if (!iface) return result(device, session, "", `% Invalid interface ${name}`);
      session.mode = "interface";
      session.ifaceName = iface.name;
      session.routerProcessId = null;
      return result(device, session, "");
    }
    const routerTok = matchToken(tokens[0] ?? "", ["router"]);
    if (routerTok && tokens[1]?.toLowerCase() === "ospf") {
      if (device.type !== "router") {
        return result(device, session, "", "% OSPF only on routers");
      }
      const pid = Number(tokens[2]);
      if (!pid) return result(device, session, "", "Usage: router ospf <process-id>");
      session.mode = "router";
      session.routerProcessId = pid;
      session.dhcpPoolName = null;
      sim.ensureOspfProcess(device.id, pid);
      return result(device, session, "");
    }
    if (head === "ip" && tokens[1]?.toLowerCase() === "routing") {
      if (device.type !== "switch") {
        return result(device, session, "", "% ip routing only on switches");
      }
      const err = sim.setIpRouting(device.id, true);
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
    if (head === "no" && tokens[1]?.toLowerCase() === "ip" && tokens[2]?.toLowerCase() === "routing") {
      if (device.type !== "switch") {
        return result(device, session, "", "% ip routing only on switches");
      }
      const err = sim.setIpRouting(device.id, false);
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
    if (head === "access-list") {
      if (device.type !== "router") {
        return result(device, session, "", "% ACLs only on routers");
      }
      const listNum = Number(tokens[1]);
      const action = tokens[2]?.toLowerCase();
      if (!listNum || (action !== "permit" && action !== "deny")) {
        return result(
          device,
          session,
          "",
          "Usage: access-list <1-99|100-199> {permit|deny} …",
        );
      }
      if (listNum >= 100 && listNum <= 199) {
        const protocol = tokens[3]?.toLowerCase() as "ip" | "icmp" | "tcp" | "udp" | undefined;
        if (!protocol || !["ip", "icmp", "tcp", "udp"].includes(protocol)) {
          return result(
            device,
            session,
            "",
            "Usage: access-list <100-199> {permit|deny} {ip|icmp|tcp|udp} <src> <dst>",
          );
        }
        const src = parseAclEndpoint(tokens, 4);
        if (!src) {
          return result(device, session, "", "% Invalid extended ACL source/destination");
        }
        const srcPort = parseAclPortEq(tokens, src.next);
        const dst = parseAclEndpoint(tokens, srcPort.next);
        if (!dst) {
          return result(device, session, "", "% Invalid extended ACL source/destination");
        }
        const dstPort = parseAclPortEq(tokens, dst.next);
        const err = sim.addExtendedAclEntry(
          device.id,
          listNum,
          action,
          protocol,
          src.ip,
          src.wildcard,
          dst.ip,
          dst.wildcard,
          srcPort.port,
          dstPort.port,
        );
        if (err) return result(device, session, "", err);
        return result(device, session, "");
      }
      let source = tokens[3] ?? "";
      let wildcard = tokens[4] ?? "0.0.0.0";
      if (source.toLowerCase() === "any") {
        source = "0.0.0.0";
        wildcard = "255.255.255.255";
      } else if (source.toLowerCase() === "host") {
        source = tokens[4] ?? "";
        wildcard = "0.0.0.0";
        if (!source) {
          return result(device, session, "", "Usage: access-list <n> {permit|deny} host <ip>");
        }
      } else if (!tokens[4]) {
        wildcard = "0.0.0.0";
      }
      const err = sim.addStandardAclEntry(device.id, listNum, action, source, wildcard);
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
    if (head === "ip" && tokens[1]?.toLowerCase() === "dhcp" && tokens[2]?.toLowerCase() === "pool") {
      if (device.type !== "router") {
        return result(device, session, "", "% DHCP pools only on routers");
      }
      const poolName = tokens[3];
      if (!poolName) return result(device, session, "", "Usage: ip dhcp pool <name>");
      session.mode = "dhcp-pool";
      session.dhcpPoolName = poolName;
      session.routerProcessId = null;
      sim.ensureDhcpPool(device.id, poolName);
      return result(device, session, "");
    }
    if (
      head === "ip" &&
      tokens[1]?.toLowerCase() === "nat" &&
      tokens[2]?.toLowerCase() === "inside" &&
      tokens[3]?.toLowerCase() === "source" &&
      tokens[4]?.toLowerCase() === "list"
    ) {
      if (device.type !== "router") {
        return result(device, session, "", "% NAT only on routers");
      }
      const aclNum = Number(tokens[5]);
      const ifaceTok = tokens[6]?.toLowerCase();
      const outsideName = tokens[7];
      const overload = tokens[8]?.toLowerCase() === "overload";
      if (
        !aclNum ||
        ifaceTok !== "interface" ||
        !outsideName ||
        !overload
      ) {
        return result(
          device,
          session,
          "",
          "Usage: ip nat inside source list <1-99> interface <if> overload",
        );
      }
      const err = sim.addNatInsideSourcePat(device.id, aclNum, outsideName);
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
  }

  if (session.mode === "router" && session.routerProcessId) {
    const pid = session.routerProcessId;
    if (head === "router-id") {
      const rid = tokens[1];
      if (!rid) return result(device, session, "", "Usage: router-id <ip>");
      const err = sim.setOspfRouterId(device.id, pid, rid);
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
    if (head === "network") {
      const net = tokens[1];
      const wild = tokens[2];
      const areaTok = tokens[3]?.toLowerCase();
      const areaNum = Number(tokens[4]);
      if (!net || !wild || areaTok !== "area" || Number.isNaN(areaNum)) {
        return result(device, session, "", "Usage: network <ip> <wildcard> area <id>");
      }
      const err = sim.addOspfNetwork(device.id, pid, net, wild, areaNum);
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
  }

  if (session.mode === "dhcp-pool" && session.dhcpPoolName) {
    const poolName = session.dhcpPoolName;
    if (head === "network") {
      const net = tokens[1];
      const mask = tokens[2];
      if (!net || !mask) {
        return result(device, session, "", "Usage: network <ip> <mask>");
      }
      const err = sim.configureDhcpPoolNetwork(device.id, poolName, net, mask);
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
    if (head === "default-router") {
      const gw = tokens[1];
      if (!gw) return result(device, session, "", "Usage: default-router <ip>");
      const err = sim.configureDhcpPoolDefaultRouter(device.id, poolName, gw);
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
  }

  if (session.mode === "interface" && session.ifaceName) {
    if (head === "ip" && tokens[1]?.toLowerCase() === "address") {
      if (tokens[2]?.toLowerCase() === "dhcp") {
        const err = sim.requestDhcpLease(device.id, session.ifaceName);
        if (err) return result(device, session, "", err);
        return result(device, session, "");
      }
      const addr = tokens[2];
      const mask = tokens[3];
      if (!addr || !mask) {
        return result(device, session, "", "Usage: ip address <addr> <mask>");
      }
      const prefix = mask.includes(".") ? maskToPrefix(mask) : Number(mask);
      if (prefix === null || Number.isNaN(prefix)) {
        return result(device, session, "", "% Invalid mask");
      }
      const err = sim.setInterfaceIpv4(device.id, session.ifaceName, addr, prefix);
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
    if (head === "ip" && tokens[1]?.toLowerCase() === "access-group") {
      if (device.type !== "router") {
        return result(device, session, "", "% ACLs only on routers");
      }
      const listNum = Number(tokens[2]);
      const dir = tokens[3]?.toLowerCase();
      if (!listNum || (dir !== "in" && dir !== "out")) {
        return result(device, session, "", "Usage: ip access-group <1-99> {in|out}");
      }
      const err = sim.setAccessGroup(device.id, session.ifaceName, listNum, dir);
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
    if (head === "ip" && tokens[1]?.toLowerCase() === "nat") {
      if (device.type !== "router") {
        return result(device, session, "", "% NAT only on routers");
      }
      const role = tokens[2]?.toLowerCase();
      if (role === "inside" || role === "outside") {
        const err = sim.setNatDirection(device.id, session.ifaceName, role);
        if (err) return result(device, session, "", err);
        return result(device, session, "");
      }
      return result(device, session, "", "Usage: ip nat {inside|outside}");
    }
    if (head === "encapsulation" || head === "enc") {
      const enc = tokens[1]?.toLowerCase() ?? "";
      const vlan = Number(tokens[2]);
      if (enc !== "dot1q" || Number.isNaN(vlan)) {
        return result(device, session, "", "Usage: encapsulation dot1Q <vlan-id>");
      }
      const err = sim.setSubinterfaceEncap(device.id, session.ifaceName, vlan);
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
    if (head === "no" && tokens[1]?.toLowerCase() === "shutdown") {
      const err = sim.setInterfaceAdmin(device.id, session.ifaceName, "up");
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
    if (head === "shutdown") {
      const err = sim.setInterfaceAdmin(device.id, session.ifaceName, "down");
      if (err) return result(device, session, "", err);
      return result(device, session, "");
    }
    if (head === "switchport" || head === "sw") {
      const sub = tokens[1]?.toLowerCase() ?? "";
      if (sub === "mode") {
        const mode = tokens[2]?.toLowerCase();
        if (mode !== "access" && mode !== "trunk") {
          return result(device, session, "", "Usage: switchport mode {access|trunk}");
        }
        const err = sim.setSwitchport(device.id, session.ifaceName, {
          mode,
          allowedVlans: mode === "trunk" ? [1, 10, 20, 30] : undefined,
        });
        if (err) return result(device, session, "", err);
        return result(device, session, "");
      }
      if (sub === "access" && tokens[2]?.toLowerCase() === "vlan") {
        const vlan = Number(tokens[3]);
        if (!vlan) return result(device, session, "", "Usage: switchport access vlan <id>");
        const err = sim.setSwitchport(device.id, session.ifaceName, {
          mode: "access",
          accessVlan: vlan,
        });
        if (err) return result(device, session, "", err);
        return result(device, session, "");
      }
      if (sub === "trunk" && tokens[2]?.toLowerCase() === "allowed" && tokens[3]?.toLowerCase() === "vlan") {
        const list = (tokens[4] ?? "1")
          .split(",")
          .map((v) => Number(v.trim()))
          .filter((n) => n > 0);
        const err = sim.setSwitchport(device.id, session.ifaceName, {
          mode: "trunk",
          allowedVlans: list.length ? list : [1],
        });
        if (err) return result(device, session, "", err);
        return result(device, session, "");
      }
      return result(
        device,
        session,
        "",
        "Usage: switchport mode … | switchport access vlan … | switchport trunk allowed vlan …",
      );
    }
  }

  return result(device, session, "", `% Invalid input detected at '^' marker: ${line}`);
}

function ifaceNameFor(device: NetworkDevice, ifaceId: string): string {
  return device.interfaces.find((i) => i.id === ifaceId)?.name ?? ifaceId;
}

function handleShow(
  sim: SimulationController,
  device: NetworkDevice,
  session: CliSession,
  args: string[],
): CliResult {
  const live = sim.getDevice(device.id);
  if (!live) return result(device, session, "", "Device gone");

  const a0 = args[0]?.toLowerCase() ?? "";
  const a1 = args[1]?.toLowerCase() ?? "";
  const a2 = args[2]?.toLowerCase() ?? "";

  if (a0 === "running-config" || a0 === "run" || (a0 === "running" && a1 === "config")) {
    return result(device, session, live.runningConfigLines.join("\n"));
  }

  if (a0 === "arp") {
    const header = "Protocol  Address         Age (min)  Hardware Addr   Interface";
    const rows = live.runtime.arpTable.map(
      (e) =>
        `Internet  ${e.ip.padEnd(15)} -          ${e.mac.padEnd(15)} ${ifaceNameFor(live, e.ifaceId)}`,
    );
    return result(
      device,
      session,
      rows.length ? [header, ...rows].join("\n") : "ARP table is empty",
    );
  }

  if (
    a0 === "mac" ||
    (a0 === "mac" && a1 === "address-table") ||
    (a0 === "mac" && a1 === "address" && a2 === "table")
  ) {
    const header = "Vlan    Mac Address       Type        Ports";
    const rows = live.runtime.macTable.map(
      (e) =>
        `${String(e.vlan).padEnd(8)}${e.mac.padEnd(18)}dynamic     ${ifaceNameFor(live, e.ifaceId)}`,
    );
    return result(device, session, rows.length ? [header, ...rows].join("\n") : "MAC table is empty");
  }

  if (a0 === "spanning-tree" || a0 === "spanning" || (a0 === "span" && a1?.startsWith("t"))) {
    const text = sim.getSpanningTreeText(device.id);
    if (!text) return result(device, session, "", "% STP only on switches");
    return result(device, session, text);
  }

  if (a0 === "access-lists" || a0 === "access-list" || (a0 === "access" && a1 === "lists")) {
    return result(device, session, sim.getAccessListsText(device.id));
  }

  if (a0 === "ip" && a1 === "nat" && (a2 === "translations" || a2 === "translation")) {
    return result(device, session, sim.getNatTranslationsText(device.id));
  }

  if (a0 === "vlan" && (a1 === "brief" || a1.startsWith("br") || a1 === "")) {
    const vlanMap = new Map<number, string[]>();
    for (const iface of live.interfaces) {
      const sp = iface.switchport;
      if (!sp) continue;
      if (sp.mode === "access") {
        const list = vlanMap.get(sp.accessVlan) ?? [];
        list.push(iface.name);
        vlanMap.set(sp.accessVlan, list);
      } else {
        for (const v of sp.allowedVlans) {
          const list = vlanMap.get(v) ?? [];
          list.push(`${iface.name}(t)`);
          vlanMap.set(v, list);
        }
      }
    }
    const rows = [...vlanMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([v, ifaces]) => `${String(v).padEnd(6)}${ifaces.join(", ")}`)
      .join("\n");
    return result(
      device,
      session,
      rows ? `VLAN Name                             Status    Ports\n${rows}` : "No VLAN information",
    );
  }

  if (a0 === "interfaces" || a0 === "int") {
    if (a1 === "trunk" || a1.startsWith("tr")) {
      const header = "Port        Mode         Encapsulation  Status        Native vlan  Allowed vlans";
      const rows = live.interfaces
        .filter((i) => i.switchport?.mode === "trunk")
        .map((i) => {
          const sp = i.switchport!;
          const st = `${i.adminStatus}/${i.operationalStatus}`;
          return `${i.name.padEnd(12)}on           802.1q         ${st.padEnd(14)}${String(sp.nativeVlan).padEnd(13)}${sp.allowedVlans.join(",")}`;
        });
      return result(
        device,
        session,
        rows.length ? [header, ...rows].join("\n") : "No trunk interfaces configured",
      );
    }
  }

  if (a0 === "ip" && (a1 === "route" || a1 === "ro")) {
    const header = "Codes: C - connected, S - static, O - OSPF";
    const rows = live.runtime.routingTable.map((r) => {
      const code = r.kind === "connected" ? "C" : r.kind === "static" ? "S" : "O";
      const via = r.nextHop ? ` via ${r.nextHop}` : " is directly connected";
      const iface = ifaceNameFor(live, r.ifaceId);
      return `${code}    ${r.network}/${r.prefixLength}${via}, ${iface}`;
    });
    return result(device, session, rows.length ? [header, ...rows].join("\n") : "No routes");
  }

  if (a0 === "ip" && (a1 === "ospf" || a1 === "os")) {
    if (a2 === "neighbor" || a2 === "ne") {
      const header =
        "Neighbor ID     Pri   State           Dead Time   Address         Interface";
      const rows = (live.ospfNeighbors ?? []).map((n) => {
        return `${n.neighborId.padEnd(16)}0    ${n.state.padEnd(16)}00:00:35   ${n.address.padEnd(16)}${n.interfaceName}`;
      });
      return result(
        device,
        session,
        rows.length ? [header, ...rows].join("\n") : "No OSPF neighbors",
      );
    }
  }

  if (
    a0 === "ip" &&
    (a1 === "interface" || a1 === "int") &&
    (a2 === "brief" || a2 === "br" || a2 === "")
  ) {
    const header = "Interface              IP-Address      OK? Method Status                Protocol";
    const rows = live.interfaces.map((i) => {
      const ip = i.ipv4[0]?.address ?? "unassigned";
      const ok = i.ipv4.length > 0 ? "YES" : "NO ";
      const st = i.adminStatus === "up" && i.operationalStatus === "up" ? "up" : "down";
      return `${i.name.padEnd(23)}${ip.padEnd(16)}${ok} manual  ${st.padEnd(23)}${st}`;
    });
    return result(device, session, [header, ...rows].join("\n"));
  }

  // show ip int brief abbreviation: sh ip int br
  if (a0 === "ip" && (a1.startsWith("int") || a1 === "i") && (a2.startsWith("br") || a2 === "")) {
    return handleShow(sim, device, session, ["ip", "interface", "brief"]);
  }

  return result(device, session, "", `% Incomplete or unknown show command`);
}

export { prefixToMask };
