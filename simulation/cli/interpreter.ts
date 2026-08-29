import type { SimulationController } from "../core/controller";
import { maskToPrefix, prefixToMask } from "../core/controller";
import type { CliResult, NetworkDevice } from "../core/types";

export type CliMode = "user" | "privileged" | "config" | "interface";

export interface CliSession {
  mode: CliMode;
  ifaceName: string | null;
}

function promptFor(device: NetworkDevice, session: CliSession): string {
  const host = device.hostname || device.name;
  if (session.mode === "user") return `${host}>`;
  if (session.mode === "privileged") return `${host}#`;
  if (session.mode === "config") return `${host}(config)#`;
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

  if (head === "disable" || (head === "exit" && session.mode === "privileged")) {
    if (session.mode === "privileged") {
      session.mode = "user";
      return result(device, session, "");
    }
  }

  if (head === "exit" || head === "end") {
    if (session.mode === "interface") {
      session.mode = "config";
      session.ifaceName = null;
      return result(device, session, "");
    }
    if (session.mode === "config") {
      session.mode = "privileged";
      return result(device, session, "");
    }
    if (head === "end" && session.mode !== "user") {
      session.mode = "privileged";
      session.ifaceName = null;
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
    if (head === "interface" || head === "int") {
      const name = tokens[1];
      if (!name) return result(device, session, "", "Usage: interface <name>");
      const live = sim.getDevice(device.id);
      const iface = live?.interfaces.find(
        (i) => i.name.toLowerCase() === name.toLowerCase(),
      );
      if (!iface) return result(device, session, "", `% Invalid interface ${name}`);
      session.mode = "interface";
      session.ifaceName = iface.name;
      return result(device, session, "");
    }
  }

  if (session.mode === "interface" && session.ifaceName) {
    if (head === "ip" && tokens[1]?.toLowerCase() === "address") {
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
    const rows = live.runtime.arpTable
      .map((e) => `${e.ip.padEnd(16)} ${e.mac}  ${e.ifaceId}`)
      .join("\n");
    return result(
      device,
      session,
      rows || "ARP table is empty",
    );
  }

  if (a0 === "mac" || (a0 === "mac-address-table") || (a0 === "mac" && a1 === "address-table")) {
    const rows = live.runtime.macTable
      .map((e) => `${e.mac}  vlan ${e.vlan}  ${e.ifaceId}`)
      .join("\n");
    return result(device, session, rows || "MAC table is empty");
  }

  if (a0 === "vlan" || (a0 === "vlan" && a1 === "brief") || (a0 === "vlan" && a1.startsWith("br"))) {
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
      .map(([v, ifaces]) => `${String(v).padEnd(6)} ${ifaces.join(", ")}`)
      .join("\n");
    return result(
      device,
      session,
      rows ? `VLAN   Interfaces\n${rows}` : "No VLAN information",
    );
  }

  if (a0 === "ip" && (a1 === "route" || a1 === "ro")) {
    const rows = live.runtime.routingTable
      .map((r) => {
        const via = r.nextHop ? `via ${r.nextHop}` : "connected";
        return `${r.network}/${r.prefixLength} ${via} ${r.kind}`;
      })
      .join("\n");
    return result(device, session, rows || "No routes");
  }

  if (
    a0 === "ip" &&
    (a1 === "interface" || a1 === "int") &&
    (a2 === "brief" || a2 === "br" || a2 === "")
  ) {
    const header = "Interface             IP-Address      Status";
    const rows = live.interfaces.map((i) => {
      const ip = i.ipv4[0]?.address ?? "unassigned";
      const st = `${i.adminStatus}/${i.operationalStatus}`;
      return `${i.name.padEnd(22)} ${ip.padEnd(15)} ${st}`;
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
