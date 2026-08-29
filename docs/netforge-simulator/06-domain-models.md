# 06 — Domain Models (Device / Interface / Link / Packet)

## Device

```typescript
type DeviceType =
  | "router" | "switch" | "l3-switch" | "host" | "server"
  | "firewall" | "access-point" | "cloud";

interface NetworkDevice {
  id: string;
  name: string;
  type: DeviceType;
  vendor: "netforge";          // educational
  os: "NetForgeOS";
  interfaces: NetworkInterface[];
  configuration: DeviceConfiguration; // startup + running
  runtime: DeviceRuntimeState;        // tables, caches, neighbors
  meta: { labels?: string[] };
}
```

Canvas position is UI state (`{ x, y }`) keyed by `id`, not required inside engine for correctness.

## Interface

```typescript
interface NetworkInterface {
  id: string;
  name: string; // Gi0/0, Fa0/1, eth0
  type: "ethernet" | "fiber" | "serial" | "wireless";
  macAddress: string;
  adminStatus: "up" | "down";
  operationalStatus: "up" | "down";
  speedMbps: number;
  duplex: "full" | "half";
  mtu: number;
  ipv4?: IPv4Address[];
  ipv6?: IPv6Address[];
  switchport?: { mode: "access" | "trunk"; accessVlan?: number; allowedVlans?: number[]; nativeVlan?: number };
  counters: InterfaceCounters;
}
```

## Link

```typescript
interface NetworkLink {
  id: string;
  a: { deviceId: string; interfaceId: string };
  b: { deviceId: string; interfaceId: string };
  state: "up" | "down";
  bandwidthMbps: number;
  latencyMs: number;
  jitterMs: number;
  loss: number; // 0..1
  mtu: number;
}
```

Enables failure injection (PRD §28).

## Packet

```typescript
interface Packet {
  id: string;
  createdAt: number; // sim time
  layers: {
    eth?: EthernetHeader;
    vlan?: Dot1QHeader;
    arp?: ArpPayload;
    ipv4?: IPv4Header;
    ipv6?: IPv6Header;
    icmp?: IcmpPayload;
    udp?: UdpHeader;
    tcp?: TcpHeader;
    dhcp?: DhcpPayload;
    payload?: Uint8Array | { kind: string; data: unknown };
  };
  meta: { ingressIface?: string; egressIface?: string; dropReason?: string };
}
```

## Simulation event

```typescript
interface SimulationEvent {
  id: string;
  t: number;
  type: string;
  deviceId?: string;
  packetId?: string;
  data: Record<string, unknown>;
}
```

## Persistence vs runtime

| Persistent | Runtime (rebuildable) |
|------------|------------------------|
| Devices, links, running/startup config, positions, lab meta | ARP/MAC/routing/OSPF/DHCP leases, queues, TCP state, counters |

Schema version field on every saved lab: `schemaVersion: number`.
