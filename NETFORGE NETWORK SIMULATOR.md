# NETFORGE NETWORK SIMULATOR
## Product Requirements & Technical Implementation Document

**Product:** NetForge — Network Engineering Academy  
**Feature:** NetForge Network Simulator / Virtual Network Lab  
**Document Type:** Product Requirements + UX + Technical Architecture + Implementation Plan  
**Status:** Build Specification  
**Target:** Existing `netforge-academy.vercel.app` application  
**Primary Goal:** Build a browser-native, zero-install network engineering simulator that becomes the practical core of NetForge Academy.

---

# 1. EXECUTIVE VISION

NetForge should not become "another Packet Tracer clone."

The objective is to build a **browser-native network engineering laboratory** where users can:

- Design network topologies.
- Add routers, switches, PCs, servers, firewalls and network services.
- Connect devices visually.
- Configure devices through realistic CLI interfaces.
- Observe packets moving through the topology.
- Inspect Ethernet/IP/TCP/UDP/ARP/ICMP/etc. headers.
- Configure VLANs, trunks, STP, routing, DHCP, NAT, ACLs and other networking technologies.
- Break networks intentionally.
- Troubleshoot failures.
- Receive deterministic explanations of why traffic failed.
- Complete guided certification labs.
- Be automatically graded.
- Export/share labs.
- Save progress.
- Replay packet flows.
- Capture traffic.
- Export PCAP.
- Learn networking concepts while actively manipulating the network.
- Eventually practice automation with Python, REST, NETCONF/RESTCONF, Ansible and Jinja.
- Eventually collaborate on labs with instructors or other learners.

The fundamental product principle is:

> **Do not simulate a network merely to show that it works. Simulate it well enough to teach the user why it works, why it fails, and how to fix it.**

---

# 2. PRODUCT POSITIONING

## Existing tools

### Cisco Packet Tracer

Excellent for:

- CCNA learning
- beginner topology building
- Cisco-oriented exercises
- visual packet simulation

Weaknesses:

- desktop installation
- Cisco ecosystem dependency
- limited extensibility
- limited modern web experience
- limited professional workflow
- limited automation/DevOps integration

### GNS3

Excellent for:

- realistic network labs
- actual network OS images
- advanced network engineering
- multi-vendor environments

Weaknesses:

- installation
- VM/runtime complexity
- device-image management
- higher resource consumption
- not designed primarily as an educational platform

### EVE-NG

Excellent for:

- advanced multi-vendor labs
- enterprise/network-security environments

Weaknesses:

- infrastructure-heavy
- VM-based
- configuration overhead
- less approachable for beginners

---

# 3. NETFORGE'S DIFFERENTIATOR

NetForge should optimize for:

> **Learning + Simulation + Troubleshooting + Assessment + Automation**

rather than pure device emulation.

The target experience:

```text
Open NetForge
      ↓
Create Lab
      ↓
Drag Router
      ↓
Drag Switch
      ↓
Drag PC
      ↓
Connect them
      ↓
Open Router CLI
      ↓
Configure interface
      ↓
Configure routing
      ↓
Run ping
      ↓
Watch packet travel
      ↓
Inspect packet
      ↓
Break configuration
      ↓
Troubleshoot
      ↓
AI explains the failure
      ↓
Fix it
      ↓
Submit Lab
      ↓
Receive score
      ↓
Earn certification progress
```

No downloads.

No VM.

No device-image installation.

No special hardware.

No complicated setup.

---

# 4. IMPORTANT TECHNICAL PRINCIPLE

Do NOT attempt to run actual proprietary Cisco IOS images in the public browser simulator.

Cisco IOS and many commercial network operating systems are proprietary.

NetForge should implement:

> **Cisco IOS-style educational semantics and CLI compatibility**

using its own simulation engine.

The simulated device should be:

```text
NetForge Router
OS: NetForgeOS
CLI compatibility: Cisco IOS-style
```

rather than pretending to distribute Cisco software.

This allows NetForge to remain:

- open
- browser-native
- scalable
- legally cleaner
- deterministic
- educational
- extensible

---

# 5. INSPIRATION REPOSITORY WORKSPACE

Before implementing the simulator, create one isolated development directory.

Suggested:

```text
/netforge-simulator-inspiration/
```

Clone the reference repositories into this directory.

DO NOT blindly merge them into the NetForge production codebase.

They are research/reference implementations.

Suggested structure:

```text
netforge-simulator-inspiration/
│
├── netsim-python/
│   └── joxorsayan/netsim
│
├── netsim-rust-wasm/
│   └── Alechiis/netsim
│
├── cisco-real-sim/
│   └── NETWORKERS-HOME-123/cisco-real-sim
│
├── broadcast-studio/
│   └── lukaudev/broadcast-studio
│
├── containerlab/
│   └── srl-labs/containerlab
│
├── containerlab-app/
│   └── srl-labs/containerlab-app
│
├── packettrino/
│   └── EvilPrime98/PackeTTrino
│
├── network-simulator/
│   └── relevant browser simulator repositories
│
└── README.md
```

Reference repositories:

### 1. NetSim — primary simulation reference

https://github.com/joxorsayan/netsim

This project is especially valuable because it already demonstrates:

- browser-based networking
- Cisco-style CLI
- topology editor
- switching
- routing
- ARP
- ICMP
- DHCP
- STP
- OSPF
- EIGRP
- RIP
- BGP
- NAT/PAT
- ACL
- IPv6
- FHRP
- EtherChannel
- packet capture
- PCAP export
- AI troubleshooting
- labs-as-code
- auto-grading

Use this repository heavily for **simulation-domain research**, not as the final product.

---

### 2. Alechiis/netsim — WASM research

https://github.com/Alechiis/netsim

Use this repository to study:

- Rust
- WebAssembly
- browser-side simulation
- performance-oriented architecture
- separation between UI and simulation engine

Its browser/WASM direction is particularly relevant to NetForge's long-term architecture.

---

### 3. Cisco Real Sim

https://github.com/NETWORKERS-HOME-123/cisco-real-sim

Study its:

- React architecture
- topology engine
- simulation engine
- CLI executor
- Web Worker architecture
- Zustand state management
- Konva-based rendering

The repository explicitly describes a browser-side architecture containing topology, simulation and CLI components communicating through a Web Worker.

This is one of the most directly relevant references for the implementation.

---

### 4. Broadcast Studio

https://github.com/lukaudev/broadcast-studio

Study:

- Next.js
- React
- React Flow
- TypeScript
- topology UI
- terminal
- real-time simulation UX
- AI integration

It is explicitly positioned as an open-source GNS3/Packet Tracer alternative and uses React Flow for topology editing.

---

### 5. Containerlab

https://github.com/srl-labs/containerlab

Study:

- topology definitions
- node abstraction
- links
- network-device modeling
- infrastructure-as-code
- lab lifecycle
- multi-vendor architecture
- topology schemas

Containerlab's topology model separates nodes, links and node kinds. That conceptual model should influence NetForge's internal lab schema.

Do NOT attempt to run Containerlab itself inside the public browser simulator.

Use it as an architectural reference.

---

### 6. Containerlab App

https://github.com/srl-labs/containerlab-app

Study:

- topology UI
- graph interaction
- lab visualization
- API architecture
- browser workspace
- topology-as-code workflows

Its browser sandbox already demonstrates that topology editing/visualization can happen entirely in-browser, while actual container deployment requires a backend lab host.

NetForge should take the browser-native portion and replace the real container runtime with its own deterministic simulation engine.

---

### 7. PackeTTrino

https://github.com/EvilPrime98/PackeTTrino

Study:

- browser-native network simulation
- packet visualization
- ARP
- DNS
- DHCP
- TCP/IP
- firewall
- packet analyzer
- routing state
- browser terminal

It is particularly useful as a reference for lightweight browser-native simulation.

---

# 6. REPOSITORY ANALYSIS REQUIREMENT

Before writing production code, create:

```text
docs/simulator/research/
```

and produce:

```text
docs/simulator/research/
├── netsim-python.md
├── netsim-wasm.md
├── cisco-real-sim.md
├── broadcast-studio.md
├── containerlab.md
├── containerlab-app.md
├── packettrino.md
└── architecture-comparison.md
```

Each document should answer:

1. What does the project do?
2. What architecture does it use?
3. What should NetForge learn from it?
4. What should NetForge NOT copy?
5. What features are worth implementing?
6. What protocol implementations are reusable conceptually?
7. What UX patterns are superior?
8. What licensing constraints exist?
9. What technical limitations exist?
10. What should be rewritten from first principles?

DO NOT copy code without reviewing its license and compatibility with the NetForge project's licensing model.

---

# 7. NETFORGE SIMULATOR INFORMATION ARCHITECTURE

The simulator should become a major application inside the existing NetForge Academy.

Current navigation:

```text
Study
  Dashboard
  Focus Mode
  Today
  Accountability

Practice
  Drills
  Lab Stack
  Cert Gates

Academy
  Curriculum
  Resources
  How to Use
```

Extend this to:

```text
Practice
  ├── Drills
  ├── Network Simulator
  ├── Lab Stack
  └── Cert Gates
```

Optionally:

```text
Network Simulator
  ├── Workspace
  ├── My Labs
  ├── Explore Labs
  ├── Challenges
  ├── Packet Analyzer
  └── Templates
```

---

# 8. MAIN SIMULATOR UI

The simulator should have a professional IDE-style interface.

Think:

```text
┌───────────────────────────────────────────────────────────────┐
│ NetForge │ Lab: OSPF Enterprise │ Save │ Run │ Submit │ ... │
├─────────────┬─────────────────────────────────────┬───────────┤
│             │                                     │           │
│ DEVICE      │                                     │ INSPECTOR │
│ PALETTE     │          TOPOLOGY CANVAS            │           │
│             │                                     │           │
│ Router      │                                     │ Device    │
│ Switch      │                                     │ Interface │
│ L3 Switch   │                                     │ Config    │
│ PC          │                                     │ Routes    │
│ Server      │                                     │ ARP       │
│ Firewall    │                                     │ MAC       │
│ AP          │                                     │ Logs      │
│ Cloud       │                                     │           │
│             │                                     │           │
├─────────────┴─────────────────────────────────────┴───────────┤
│ TERMINAL / PACKETS / LOGS / EVENTS / SCORE / AI TROUBLESHOOT │
└───────────────────────────────────────────────────────────────┘
```

The UI should feel like:

- modern developer IDE
- professional network-management console
- polished SaaS
- not an old-school educational desktop application

---

# 9. VISUAL DESIGN SYSTEM

The simulator must inherit the existing NetForge visual language.

Do not create a disconnected application.

Use:

- existing typography
- existing spacing system
- existing cards
- existing border treatment
- existing dark/light behavior
- existing accent system
- existing navigation
- existing icon system

But introduce a dedicated **lab/workspace visual mode**.

The simulator should feel denser than the Academy dashboard.

Recommended visual characteristics:

- dark network canvas
- subtle grid
- thin topology lines
- clear device silhouettes
- restrained glow
- high information density
- strong monospace typography for CLI
- green/amber/red status indicators
- smooth packet animation
- minimal visual noise

Avoid:

- cartoon networking icons
- excessive gradients
- oversized cards
- excessive glassmorphism
- childish colors
- fake 3D hardware
- clutter

The product should feel like:

> **Linear + Vercel + modern network engineering console**

rather than:

> "college networking project."

---

# 10. TOPOLOGY CANVAS

Use a graph-based rendering system.

Recommended candidate:

React Flow / XYFlow.

Reference:

https://github.com/100le/react-flow

Required features:

- pan
- zoom
- minimap
- grid
- snap-to-grid
- multi-select
- box selection
- keyboard shortcuts
- undo/redo
- copy/paste
- duplicate
- auto-layout
- alignment
- grouping
- labels
- link creation
- link deletion
- device status
- interface status
- packet animation

---

# 11. DEVICE PALETTE

Initial device catalog:

## End devices

- PC
- Laptop
- Server
- Printer
- IoT device

## Network devices

- Router
- Layer-2 Switch
- Layer-3 Switch
- Firewall
- Wireless AP
- Wireless Router

## Services

- DHCP Server
- DNS Server
- Web Server
- NTP Server
- Syslog Server
- AAA Server

## Infrastructure

- Internet
- Cloud
- ISP
- WAN
- VPN gateway

---

# 12. DEVICE MODEL

Every device should have a normalized internal representation.

Example:

```typescript
interface NetworkDevice {
  id: string;
  name: string;
  type: DeviceType;
  vendor: DeviceVendor;
  os: string;
  interfaces: Interface[];
  configuration: DeviceConfiguration;
  state: DeviceRuntimeState;
  position: CanvasPosition;
}
```

Example:

```typescript
type DeviceType =
  | "router"
  | "switch"
  | "l3-switch"
  | "host"
  | "server"
  | "firewall"
  | "access-point"
  | "cloud";
```

---

# 13. INTERFACE MODEL

Each interface must contain:

```typescript
interface NetworkInterface {
  id: string;
  name: string;
  type: "ethernet" | "fiber" | "serial" | "wireless";
  macAddress: string;
  adminStatus: "up" | "down";
  operationalStatus: "up" | "down";
  speed: number;
  duplex: "full" | "half";
  mtu: number;

  ipv4?: IPv4Config[];
  ipv6?: IPv6Config[];

  vlan?: number;
  mode?: "access" | "trunk";

  counters: InterfaceCounters;
}
```

---

# 14. LINK MODEL

Links must be first-class simulation objects.

```typescript
interface NetworkLink {
  id: string;
  sourceDevice: string;
  sourceInterface: string;
  destinationDevice: string;
  destinationInterface: string;

  state: "up" | "down";
  bandwidth: number;
  latency: number;
  jitter: number;
  packetLoss: number;
  mtu: number;
}
```

This enables future failure injection.

---

# 15. SIMULATION ENGINE

The simulation engine is the heart of the product.

Do not place simulation logic directly inside React components.

Use a strict separation:

```text
UI
 ↓
Application State
 ↓
Simulation API
 ↓
Simulation Engine
 ↓
Protocol Modules
 ↓
Network State
```

The engine must be deterministic.

Given:

```text
topology
+
configuration
+
seed
+
events
```

the simulation should produce the same result.

This is essential for:

- grading
- debugging
- replay
- tests
- labs
- AI explanations

---

# 16. ENGINE EXECUTION MODEL

Use a discrete-event simulation architecture.

Conceptually:

```text
Event Queue

t=0
  PC1 generates ARP

t=1
  SW1 receives frame

t=2
  SW1 learns MAC

t=3
  SW1 forwards broadcast

t=4
  R1 receives ARP

...
```

Each event should be inspectable.

Example:

```typescript
interface SimulationEvent {
  id: string;
  timestamp: number;
  type: SimulationEventType;
  sourceDevice: string;
  destinationDevice?: string;
  packetId?: string;
  metadata: Record<string, unknown>;
}
```

---

# 17. PROTOCOL ROADMAP

Do NOT attempt every networking protocol simultaneously.

Implement in layers.

## Phase 1 — Ethernet foundation

- Ethernet frame
- MAC address
- MAC learning
- flooding
- unicast
- broadcast
- collision-domain concepts
- link state

## Phase 2 — ARP

- ARP request
- ARP reply
- ARP cache
- cache expiration
- duplicate IP detection

## Phase 3 — IPv4

- IPv4
- subnetting
- routing table
- longest-prefix match
- TTL
- ICMP

## Phase 4 — Basic switching

- VLAN
- access ports
- trunk ports
- 802.1Q
- native VLAN
- MAC tables

## Phase 5 — STP

- STP
- root bridge election
- root port
- designated port
- blocked port
- RSTP

## Phase 6 — Routing

- connected routes
- static routes
- default routes
- administrative distance
- route selection

## Phase 7 — DHCP

- DHCP Discover
- Offer
- Request
- ACK
- relay

## Phase 8 — NAT

- static NAT
- dynamic NAT
- PAT

## Phase 9 — OSPF

- neighbors
- areas
- hello/dead timers
- LSDB
- SPF
- route installation
- passive interfaces
- cost

## Phase 10 — Advanced routing

- RIP
- EIGRP
- BGP
- route redistribution
- route filtering

## Phase 11 — IPv6

- IPv6 addressing
- NDP
- ICMPv6
- SLAAC
- static routing
- OSPFv3

## Phase 12 — Services

- DNS
- HTTP
- NTP
- Syslog
- SSH
- FTP

## Phase 13 — Security

- ACL
- stateful firewall
- port security
- DHCP snooping
- Dynamic ARP Inspection
- IP Source Guard
- segmentation

## Phase 14 — Enterprise

- EtherChannel
- FHRP
- VRRP
- HSRP-like behavior
- QoS concepts
- multicast concepts

## Phase 15 — Modern networking

- VXLAN concepts
- EVPN concepts
- SD-WAN concepts
- network telemetry
- intent-based networking

---

# 18. CLI ENGINE

This is a flagship feature.

The CLI should feel realistic.

Example:

```text
R1> enable

R1# configure terminal

R1(config)# interface gigabitEthernet 0/0

R1(config-if)# ip address 10.0.0.1 255.255.255.252

R1(config-if)# no shutdown

R1(config-if)# exit

R1(config)# router ospf 1

R1(config-router)# network 10.0.0.0 0.0.0.3 area 0
```

Required:

- command history
- tab completion
- `?`
- abbreviated commands
- context-sensitive grammar
- errors
- command modes
- running configuration
- startup configuration
- show commands
- configuration persistence

---

# 19. CLI MODES

Implement:

```text
User EXEC
Privileged EXEC
Global Configuration
Interface Configuration
Router Configuration
Line Configuration
VLAN Configuration
```

Example:

```text
R1>
R1#
R1(config)#
R1(config-if)#
R1(config-router)#
R1(config-line)#
```

---

# 20. SHOW COMMAND ENGINE

Priority commands:

```text
show running-config
show startup-config
show interfaces
show ip interface brief
show ip route
show arp
show mac address-table
show vlan brief
show spanning-tree
show cdp neighbors
show lldp neighbors
show ip ospf neighbor
show ip ospf database
show ip protocols
show access-lists
show ip nat translations
show ip bgp
show version
```

The output should be generated from the actual simulation state.

Never hard-code fake output.

---

# 21. PACKET VISUALIZATION

This should become one of NetForge's defining features.

When a packet moves:

```text
PC1
  │
  │ ARP Request
  ▼
SW1
  │
  │ VLAN 10
  ▼
R1
  │
  │ Route lookup
  ▼
R2
  │
  │ ICMP Echo
  ▼
PC2
```

Animate the packet along the actual links.

Packet colors should be configurable by packet type:

```text
ARP
ICMP
TCP
UDP
DNS
DHCP
STP
OSPF
BGP
```

But never make the UI visually chaotic.

---

# 22. PACKET INSPECTOR

Click a packet.

Open:

```text
PACKET INSPECTOR
────────────────────

Packet #184

Ethernet II
Source MAC
Destination MAC
EtherType

802.1Q
VLAN ID
Priority
DEI

IPv4
Source
Destination
TTL
Protocol

TCP
Source Port
Destination Port
Sequence
ACK
Flags

Payload
```

Allow:

- raw values
- decoded values
- binary
- hexadecimal
- explanation

Example:

```text
Why did TTL change?

TTL decreased from 64 → 63 because
the packet crossed one Layer-3 hop.
```

---

# 23. PACKET REPLAY

Every simulation should have an event history.

Controls:

```text
⏮
Step Back
Play
Pause
Step Forward
⏭
Speed: 1x / 2x / 5x / 10x
```

Users should be able to replay:

- ARP
- routing
- STP
- DHCP
- OSPF
- TCP handshake
- DNS
- NAT

---

# 24. PACKET CAPTURE

Create an integrated packet capture panel.

Columns:

```text
No.
Time
Source
Destination
Protocol
Length
Info
```

Filters:

```text
arp
icmp
tcp
udp
dns
dhcp
ospf
bgp
stp
vlan
```

Allow:

- pause
- clear
- search
- filter
- inspect
- export

---

# 25. PCAP EXPORT

The simulator should eventually support:

```text
Download capture.pcap
```

compatible with Wireshark.

The NetSim reference project already demonstrates this architecture, including libpcap serialization.

---

# 26. DEVICE INSPECTOR

Clicking a device opens a right-side inspector.

Tabs:

```text
Overview
Interfaces
Configuration
Routing
ARP
MAC
VLAN
STP
Neighbors
Logs
Traffic
Performance
```

Example:

```text
R1

Status       ONLINE
CPU          31%
Memory       42%

Interfaces

G0/0     UP     10.0.0.1/30
G0/1     UP     192.168.10.1/24
G0/2     DOWN   -

Routing

Connected       2
Static          3
OSPF            7
BGP             12
```

---

# 27. NETWORK HEALTH

Add a global network-health panel.

Example:

```text
NETWORK HEALTH

Devices          14
Links            18
Interfaces       37

Healthy          31
Warnings          4
Critical          2

Packet Loss      0.8%
Avg Latency      3.2 ms
```

---

# 28. FAILURE INJECTION

This is essential.

Users/instructors should be able to intentionally break networks.

Failure types:

```text
Interface down
Link down
Packet loss
Latency
Jitter
CRC errors
MTU mismatch
Wrong VLAN
Wrong subnet
Duplicate IP
Route withdrawal
OSPF neighbor failure
BGP session failure
DHCP failure
DNS failure
ACL block
Firewall block
High CPU
High congestion
```

Example:

```text
Inject Failure

Target:
R2 Gi0/1

Failure:
Packet loss

Value:
30%

Duration:
60 seconds
```

---

# 29. TROUBLESHOOTING MODE

Create a dedicated mode:

# BREAK IT

The user receives a functioning topology.

NetForge intentionally introduces one or more faults.

Example:

```text
ENTERPRISE OSPF INCIDENT

Something is wrong with the network.

Users in VLAN 20 cannot reach
the application server.

You have access to:

✓ CLI
✓ Packet Capture
✓ Routing Tables
✓ Interface State
✓ Logs

Objective:

Find and fix the root cause.

Time:
18:42
```

---

# 30. ROOT-CAUSE ENGINE

Do not use AI as the source of truth.

The deterministic simulation engine should identify the actual state.

Example:

```text
Detected:

R2 Gi0/1 = administratively down

Traffic path:
PC1 → SW1 → R1 → R2

Failure occurs at:
R2 Gi0/1

Root cause:
Interface shutdown

Confidence:
100%
```

AI can then explain this.

---

# 31. AI NETWORK TUTOR

The AI tutor should have access to structured simulation state.

Do NOT send arbitrary raw application state blindly.

Create a structured diagnostic context:

```json
{
  "topology": {},
  "devices": {},
  "interfaces": {},
  "routes": {},
  "arp": {},
  "mac": {},
  "events": {},
  "failed_packets": [],
  "known_faults": [],
  "user_commands": []
}
```

The AI should answer:

> Why can't PC1 ping PC2?

with:

1. what happened
2. where it failed
3. why it failed
4. evidence
5. recommended command
6. underlying networking concept

Example:

```text
The packet reaches R1 but is dropped there.

Evidence:
R1 has no route for 10.20.0.0/24.

Your routing table contains:
10.10.0.0/24 connected

but no route to:
10.20.0.0/24

Try:

ip route 10.20.0.0 255.255.255.0 10.0.0.2

Concept:
Static routing
```

---

# 32. AI SAFETY RULE

The AI must NEVER fabricate network state.

Bad:

```text
"Your OSPF neighbor is probably down."
```

Good:

```text
"R1 has no OSPF neighbor on Gi0/1.
The interface is UP, but OSPF is not enabled on the interface."
```

The deterministic engine supplies facts.

The AI explains those facts.

This architecture is inspired by the strongest part of the NetSim approach.

---

# 33. LAB SYSTEM

Every simulator environment should be a Lab.

Lab object:

```typescript
interface Lab {
  id: string;
  title: string;
  description: string;

  topology: Topology;
  devices: NetworkDevice[];

  objective?: LabObjective;

  difficulty:
    | "beginner"
    | "intermediate"
    | "advanced"
    | "expert";

  category:
    | "switching"
    | "routing"
    | "security"
    | "automation"
    | "troubleshooting";

  grading: GradingSpecification;

  metadata: LabMetadata;
}
```

---

# 34. LAB CATEGORIES

Create:

```text
Fundamentals
Switching
Routing
IPv6
Services
Security
Troubleshooting
Wireless
Enterprise
Automation
Network Design
Interview Labs
Certification Labs
```

---

# 35. LAB DIFFICULTY

```text
Level 1 — Fundamentals
Level 2 — Beginner
Level 3 — Intermediate
Level 4 — Advanced
Level 5 — Professional
Level 6 — Expert
```

---

# 36. LAB OBJECTIVES

Every guided lab should have explicit objectives.

Example:

```text
OSPF Single Area

Objectives

□ Configure IP addressing
□ Enable OSPF
□ Establish neighbors
□ Advertise networks
□ Verify routes
□ Test end-to-end connectivity
□ Diagnose one intentionally broken link
```

---

# 37. AUTO-GRADING

Create a deterministic grading engine.

Possible assertions:

```text
interface_up
interface_ip
ping
route_exists
route_absent
ospf_neighbor
vlan_exists
vlan_assignment
trunk_enabled
stp_root
acl_rule
nat_translation
dhcp_lease
dns_resolution
http_reachable
```

Example:

```json
{
  "checks": [
    {
      "type": "interface_up",
      "device": "R1",
      "interface": "G0/0",
      "points": 10
    },
    {
      "type": "route_exists",
      "device": "R1",
      "network": "10.20.0.0/24",
      "points": 20
    },
    {
      "type": "ping",
      "source": "PC1",
      "destination": "PC2",
      "points": 20
    }
  ]
}
```

Score:

```text
0–49     Needs work
50–69    Developing
70–84    Good
85–94    Strong
95–100   Mastery
```

---

# 38. CERTIFICATION INTEGRATION

This is where NetForge Academy becomes much more powerful.

Existing:

```text
Cert Gates
```

should be connected directly to simulator labs.

Example:

```text
CCNA CERT GATE

Switching

✓ VLAN Fundamentals
✓ Access Ports
✓ Trunking
✓ Inter-VLAN Routing
✓ STP
○ EtherChannel

Routing

✓ Static Routing
○ OSPF
○ IPv6 Routing
```

Each completed lab contributes to certification readiness.

---

# 39. LAB STACK INTEGRATION

Existing Lab Stack should become the user's personal lab queue.

Example:

```text
MY LAB STACK

01  VLAN Troubleshooting       82%
02  OSPF Single Area           94%
03  ACL Troubleshooting        68%
04  NAT/PAT                    100%
05  BGP Fundamentals           Locked
```

---

# 40. DRILLS INTEGRATION

Drills should be micro-labs.

Example:

```text
DRILL

A PC cannot reach its gateway.

You have 90 seconds.

What do you check first?

[Open CLI]
```

Then directly open the simulator.

This makes Drills and Simulator part of the same learning loop.

---

# 41. CURRICULUM INTEGRATION

Each curriculum lesson should have:

```text
LEARN
  ↓
VISUALIZE
  ↓
SIMULATE
  ↓
PRACTICE
  ↓
TROUBLESHOOT
  ↓
ASSESS
```

Example:

```text
Lesson: VLANs

Theory
 ↓
Interactive VLAN visualization
 ↓
Open VLAN Lab
 ↓
Configure switch
 ↓
Break trunk
 ↓
Troubleshoot
 ↓
Pass assessment
```

---

# 42. NETWORK DESIGN MODE

Eventually add a dedicated design mode.

User requirements:

```text
Company:
250 employees

Requirements:
- 3 departments
- guest WiFi
- server VLAN
- management VLAN
- internet access
- redundancy
- firewall
```

User designs the network.

NetForge evaluates:

- IP plan
- segmentation
- redundancy
- routing
- security
- scalability
- failure domains

This becomes a professional-level feature.

---

# 43. AUTOMATION MODE

Future feature.

Add:

```text
Automation
```

with:

- Python
- Ansible
- Jinja2
- REST API
- NETCONF
- RESTCONF
- JSON
- YAML

Example:

```python
for device in devices:
    configure(device, template)
```

Then show:

```text
AUTOMATION RUN

R1    ✓
R2    ✓
R3    ✓
SW1   ✓
SW2   ✗

Reason:
Interface Gi0/24 not found.
```

This takes NetForge beyond traditional educational simulators into **NetDevOps training**.

---

# 44. LAB-AS-CODE

Every lab should have a machine-readable representation.

Example:

```yaml
name: enterprise-ospf

nodes:

  R1:
    type: router

  R2:
    type: router

  SW1:
    type: switch

  PC1:
    type: host

links:

  - R1:G0/0
    R2:G0/0

  - R1:G0/1
    SW1:G0/1

  - SW1:G0/2
    PC1:eth0
```

This concept should be inspired by Containerlab's declarative topology model.

But NetForge's schema should remain its own.

---

# 45. SHAREABLE LABS

Every lab can have:

```text
Share
```

Generate:

```text
netforge-academy/labs/abc123
```

A user can open the URL and immediately see:

```text
OSPF Troubleshooting Challenge

Difficulty:
Advanced

Estimated time:
20 min

Objective:
Restore connectivity between
Site A and Site B.
```

---

# 46. LAB TEMPLATES

Create templates:

```text
Basic LAN
Two Router WAN
Three Router OSPF
Enterprise VLAN
Inter-VLAN Routing
STP Failure
DHCP Failure
NAT Lab
ACL Lab
OSPF Troubleshooting
BGP Lab
Enterprise Security
Campus Network
Data Center
```

---

# 47. MULTIPLAYER — FUTURE

Do not build this in V1.

But architect for it.

Potential:

```text
Instructor
   │
   ├── Student A
   ├── Student B
   ├── Student C
   └── Student D
```

Instructor sees:

- topology
- commands
- progress
- score
- failures
- packet capture
- activity

---

# 48. COLLABORATIVE LABS — FUTURE

Multiple users can work on:

```text
same topology
```

with separate device ownership.

Example:

```text
Student A → R1
Student B → R2
Student C → SW1
```

Excellent for classroom training.

---

# 49. PERFORMANCE ARCHITECTURE

Do not execute simulation-heavy work directly on the main UI thread.

Recommended:

```text
Browser

Main Thread
   │
   ├── UI
   ├── Canvas
   └── Interaction

Web Worker
   │
   ├── Simulation Engine
   ├── Event Queue
   ├── Packet Engine
   ├── Routing
   └── Protocol State
```

The `cisco-real-sim` architecture is a useful reference here because it explicitly separates simulation and CLI execution into a Web Worker architecture.

Long-term:

```text
TypeScript UI
      ↓
Web Worker
      ↓
WASM
      ↓
Rust Simulation Engine
```

Use Rust/WASM only when the engine justifies it.

Do not rewrite everything in Rust prematurely.

---

# 50. RECOMMENDED INITIAL TECHNOLOGY STACK

Assuming the existing NetForge application is already modern React/Next.js-based:

## Frontend

```text
Next.js
React
TypeScript
Tailwind
existing NetForge design system
React Flow / XYFlow
Zustand
Monaco Editor or xterm.js
Framer Motion
```

## Simulation

V1:

```text
TypeScript
Web Worker
```

or:

```text
Python backend
```

only where necessary.

V2:

```text
Rust
WebAssembly
```

for the computational core.

## Persistence

Existing backend/database should be reused if appropriate.

Otherwise:

```text
Postgres
```

with:

```text
users
labs
lab_runs
topologies
devices
configurations
scores
events
packet_captures
certification_progress
```

---

# 51. STATE ARCHITECTURE

Separate:

```text
Persistent State
```

from:

```text
Runtime Simulation State
```

Persistent:

```text
Lab topology
User configuration
Saved checkpoints
Scores
Metadata
```

Runtime:

```text
ARP cache
MAC table
Routing table
OSPF LSDB
BGP state
Packet queue
TCP connections
DHCP leases
Timers
Counters
```

Runtime state can be recreated.

---

# 52. UNDO / REDO

Every configuration change should be represented as an action.

Examples:

```text
CONFIG_CHANGE
DEVICE_ADDED
DEVICE_REMOVED
LINK_ADDED
LINK_REMOVED
INTERFACE_CONFIGURED
ROUTE_ADDED
VLAN_CREATED
```

This enables:

- undo
- redo
- replay
- grading
- activity history

---

# 53. SNAPSHOTS

Allow:

```text
Save checkpoint
```

Example:

```text
Checkpoint 1
Initial topology

Checkpoint 2
IP addressing complete

Checkpoint 3
OSPF configured

Checkpoint 4
Troubleshooting state
```

Users can restore any checkpoint.

---

# 54. COMMAND HISTORY

Every device should retain:

```text
command history
```

Example:

```text
1  enable
2  conf t
3  int g0/0
4  ip address ...
5  no shutdown
6  router ospf 1
```

For labs, instructors should optionally be able to inspect this.

---

# 55. EVENT LOG

Global event stream:

```text
12:01:02 R1 Gi0/0 UP
12:01:04 R1 received ARP request
12:01:04 SW1 learned MAC AA:BB:CC
12:01:05 OSPF adjacency FULL
12:01:08 PC1 ICMP Echo Request
12:01:08 R2 dropped packet
```

Clicking an event should focus the relevant device/packet.

---

# 56. RESPONSIVE DESIGN

Desktop is the primary simulator target.

Tablet:

- supported
- simplified panels

Mobile:

- viewer
- terminal
- simple labs

Do not attempt to cram the full topology editor into a phone.

---

# 57. ACCESSIBILITY

Required:

- keyboard navigation
- keyboard shortcuts
- visible focus
- screen-reader labels
- high contrast
- reduced motion
- scalable text
- accessible terminal
- color not being the sole indicator

---

# 58. KEYBOARD SHORTCUTS

Suggested:

```text
Ctrl/Cmd + S     Save
Ctrl/Cmd + Z     Undo
Ctrl/Cmd + Shift + Z  Redo
Ctrl/Cmd + K     Command palette
Delete           Delete selected
Space            Pan
R                Run/Resume
P                Pause
T                Terminal
L                Logs
C                Packet capture
I                Inspector
```

---

# 59. COMMAND PALETTE

Add:

```text
⌘K
```

with commands:

```text
Add Router
Add Switch
Add PC
Connect Devices
Open Terminal
Show Packet Capture
Run Ping
Start Simulation
Pause Simulation
Reset Simulation
Save Lab
Submit Lab
Open AI Troubleshooter
Export Lab
```

---

# 60. RESET BEHAVIOR

Provide:

```text
Reset Simulation
```

and:

```text
Reset Configuration
```

These must be different.

Reset Simulation:

- clear runtime state
- preserve configuration

Reset Configuration:

- restore lab baseline

---

# 61. LAB SUBMISSION

When user clicks:

```text
Submit Lab
```

show:

```text
LAB COMPLETE

Score
92 / 100

Objectives

✓ VLAN configuration
✓ Trunk configuration
✓ Inter-VLAN routing
✓ Connectivity
✗ STP root configuration

Time
18:42

Attempts
2

Weak area
Spanning Tree
```

Then:

```text
Review mistakes
Retry
Continue curriculum
```

---

# 62. LEARNING ANALYTICS

Track:

- labs completed
- average score
- average time
- retry count
- common errors
- protocols practiced
- troubleshooting success
- CLI command usage
- certification readiness

Dashboard:

```text
NETWORKING PRACTICE

Labs completed       42
Average score        87%
Troubleshooting      79%
Routing              91%
Switching             88%
Security              72%

Weakest area:
ACL troubleshooting
```

---

# 63. AI PERSONALIZATION

Eventually the system should know:

```text
User repeatedly fails:
- OSPF
- subnetting
- ACLs
```

Then recommend:

```text
Your current weak area is ACL troubleshooting.

Recommended:

1. ACL Fundamentals
2. Extended ACL Drill
3. ACL Troubleshooting Lab
4. Security Cert Gate
```

This connects the simulator to the entire Academy.

---

# 64. SECURITY MODEL

Never trust client-side lab scores.

For competitive/certification labs:

```text
Client simulation
      ↓
Server validation
```

The server should independently validate important assertions.

Otherwise users can modify browser state and fake:

```text
score = 100
```

For casual labs, local grading is fine.

For official Cert Gates:

> server-authoritative grading.

---

# 65. FREE / GUEST MODE

User should be able to:

```text
Open NetForge
↓
Create lab
↓
Practice
```

without being blocked by registration.

Account unlocks:

- save cloud labs
- progress
- certification
- history
- AI personalization
- sharing
- analytics

---

# 66. OFFLINE / PWA

Eventually make the simulator installable as a PWA.

The user should be able to:

```text
Add NetForge to Desktop
```

without requiring a native installer.

Cache:

- simulation engine
- protocol modules
- UI
- selected labs
- documentation

Cloud features require connectivity.

---

# 67. TESTING REQUIREMENTS

The simulation engine requires aggressive automated testing.

Unit tests:

```text
ARP
IPv4
IPv6
MAC learning
VLAN
STP
Routing
DHCP
NAT
ACL
OSPF
BGP
```

Integration tests:

```text
PC → Switch → Router → Router → Switch → PC
```

Expected:

```text
ping succeeds
```

Failure tests:

```text
interface shutdown
```

Expected:

```text
ping fails
root cause = interface down
```

---

# 68. DETERMINISTIC TEST FIXTURES

Create:

```text
tests/fixtures/labs/
```

Examples:

```text
basic-lan.json
vlan.json
inter-vlan.json
ospf.json
dhcp.json
nat.json
acl.json
stp.json
bgp.json
```

Every protocol feature should have a reproducible lab.

---

# 69. VISUAL REGRESSION TESTING

Use Playwright.

Test:

- topology creation
- device drag
- link creation
- terminal opening
- CLI command
- packet animation
- inspector
- packet capture
- grading
- reset
- save
- share

---

# 70. PERFORMANCE TARGETS

Initial target:

```text
100 simulated devices
```

with:

```text
smooth UI
```

Target:

```text
60 FPS canvas interaction
```

Simulation should remain responsive under:

```text
thousands of events
```

For advanced labs:

Move computation into Web Worker/WASM.

---

# 71. OBSERVABILITY

Instrument the simulator itself.

Track:

```text
simulation startup time
simulation tick time
packet processing time
worker latency
render latency
lab load time
CLI response time
```

Do not collect sensitive command content unnecessarily.

---

# 72. ERROR HANDLING

Never let the simulation engine crash the entire application.

If a protocol implementation fails:

```text
Simulation Error

OSPF engine encountered an internal error.

Your lab has been checkpointed.

[Retry]
[Restore Checkpoint]
[Report Issue]
```

---

# 73. DEVICE STATUS SYSTEM

Each device should have:

```text
ONLINE
WARNING
ERROR
OFFLINE
```

Interfaces:

```text
UP
DOWN
ADMIN DOWN
BLOCKED
ERR-DISABLED
```

---

# 74. LINK STATUS

Visual states:

```text
UP
DOWN
DEGRADED
BLOCKED
CONGESTED
```

Packet animation should respect actual link state.

---

# 75. TOPOLOGY AUTO-LAYOUT

Provide:

```text
Auto Layout
```

with modes:

```text
Tree
Hierarchical
Force
Ring
Data Center
Campus
```

Do not rearrange user topology automatically unless explicitly requested.

---

# 76. NETWORK MAP LAYERS

Users can toggle:

```text
Physical
L2
L3
Routing
Security
Traffic
```

Example:

### Physical

Shows cables/interfaces.

### L2

Shows:

- VLAN
- STP
- MAC

### L3

Shows:

- IP
- routing
- OSPF

### Traffic

Shows:

- bandwidth
- packets
- errors

---

# 77. TRAFFIC HEATMAP

Optional advanced feature:

```text
Low traffic     ─
Medium          ──
High            ───
Congested       !!!
```

Useful for network-design labs.

---

# 78. NETWORK LATENCY SIMULATION

Links should support:

```text
latency
jitter
packet loss
bandwidth
MTU
```

Example:

```text
WAN

Latency: 80 ms
Jitter: 15 ms
Loss: 1%
Bandwidth: 50 Mbps
```

This enables realistic WAN troubleshooting.

---

# 79. TCP SIMULATION

Eventually implement:

```text
SYN
SYN-ACK
ACK
DATA
ACK
FIN
```

Allow users to inspect:

- sequence numbers
- acknowledgements
- retransmissions
- congestion effects

This makes networking fundamentals dramatically more visual.

---

# 80. DNS / DHCP / HTTP

Eventually users should be able to build:

```text
PC
 ↓
DHCP
 ↓
DNS
 ↓
HTTP
```

Then inspect:

```text
DHCP DORA
DNS query
TCP handshake
HTTP request
HTTP response
```

This transforms NetForge from a Cisco lab into a complete network-behavior simulator.

---

# 81. FIREWALL SIMULATION

Firewall UI:

```text
POLICY

Source       Destination     Service     Action

10.10.0.0/24 10.20.0.0/24    HTTP        ALLOW
10.10.0.0/24 10.20.0.0/24    SSH         DENY
ANY           ANY             ANY         DENY
```

When traffic is dropped:

```text
PACKET DROPPED

Matched rule:
#3

Action:
DENY

Reason:
No explicit allow rule.
```

---

# 82. SECURITY LABS

Create labs for:

```text
ACL
Firewall
VLAN segmentation
DHCP snooping
Port security
ARP spoofing concepts
DNS issues
MITM concepts
Network segmentation
VPN concepts
AAA
Logging
```

Do not implement offensive functionality beyond what is necessary for safe educational simulation.

---

# 83. INTERVIEW MODE

Add:

```text
Network Engineer Interview Lab
```

Example:

```text
Your company's branch office
has lost connectivity.

You have 12 minutes.

No hints.

Use:
CLI
Logs
Packet capture
Routing table

Find the root cause.
```

This would be extremely useful for job preparation.

---

# 84. REAL-WORLD SCENARIO LIBRARY

Eventually create:

```text
Branch Office
Enterprise Campus
Data Center
ISP Edge
Small Business
Cloud Network
Banking Network
Hospital Network
University Network
Call Center
Manufacturing
Hybrid Cloud
```

Each topology teaches multiple concepts.

---

# 85. DESIGN QUALITY BAR

Every simulator feature must pass this test:

### Does it look professional?

### Does it behave deterministically?

### Does it teach something?

### Can it be tested?

### Can it be graded?

### Can it be saved?

### Can it be replayed?

### Can AI explain it?

If the answer is no, reconsider the feature.

---

# 86. IMPLEMENTATION PHASES

## PHASE 0 — RESEARCH

Clone all reference repositories.

Analyze:

- architecture
- protocol implementation
- state model
- topology schema
- rendering
- CLI
- workers
- WASM
- grading
- packet visualization

Deliverables:

```text
docs/simulator/research/
```

---

# PHASE 1 — SIMULATOR SHELL

Build:

- simulator route
- workspace layout
- device palette
- topology canvas
- inspector
- terminal
- bottom panel
- save/reset controls

No complex protocols yet.

---

# PHASE 2 — CORE NETWORK MODEL

Implement:

- devices
- interfaces
- links
- MAC addresses
- link state
- event engine
- packet model

---

# PHASE 3 — ETHERNET / ARP / IP

Implement:

- Ethernet
- MAC learning
- ARP
- IPv4
- ICMP
- routing table
- static routes

---

# PHASE 4 — VLAN / SWITCHING

Implement:

- VLAN
- access
- trunk
- 802.1Q
- native VLAN
- MAC table
- STP

---

# PHASE 5 — CLI

Implement:

- modes
- parser
- command tree
- `?`
- tab completion
- history
- show commands
- config commands

---

# PHASE 6 — PACKET ENGINE UI

Implement:

- packet animation
- event stream
- packet inspector
- replay
- capture
- filtering

---

# PHASE 7 — ROUTING

Implement:

- OSPF
- DHCP
- NAT
- ACL
- IPv6

Then:

- EIGRP
- BGP
- route redistribution

---

# PHASE 8 — LABS

Implement:

- templates
- objectives
- checkpoints
- grading
- submission
- scoring

---

# PHASE 9 — AI

Implement:

```text
Simulation state
      ↓
Diagnostic engine
      ↓
Structured explanation
      ↓
AI tutor
```

---

# PHASE 10 — ACADEMY INTEGRATION

Connect:

```text
Simulator
   ↓
Drills
   ↓
Lab Stack
   ↓
Cert Gates
   ↓
Curriculum
   ↓
Dashboard
```

---

# PHASE 11 — ADVANCED NETWORKING

Add:

- BGP
- IPv6
- FHRP
- EtherChannel
- security
- services
- QoS concepts
- WAN
- VXLAN/EVPN concepts

---

# PHASE 12 — AUTOMATION

Add:

- Python
- Ansible
- Jinja
- REST
- NETCONF
- RESTCONF
- config-as-code

---

# PHASE 13 — COLLABORATION

Add:

- shared labs
- instructor mode
- multiplayer
- classroom mode

---

# 87. RECOMMENDED MONOREPO STRUCTURE

Do NOT dump everything into the existing frontend.

Create a clearly separated simulator domain.

Suggested:

```text
src/
├── app/
│
├── components/
│
├── features/
│
│   ├── simulator/
│   │
│   │   ├── canvas/
│   │   ├── devices/
│   │   ├── links/
│   │   ├── inspector/
│   │   ├── terminal/
│   │   ├── packets/
│   │   ├── capture/
│   │   ├── logs/
│   │   ├── grading/
│   │   ├── labs/
│   │   └── ai/
│
├── simulation/
│   │
│   ├── core/
│   ├── devices/
│   ├── packets/
│   ├── protocols/
│   ├── routing/
│   ├── switching/
│   ├── services/
│   └── workers/
│
├── academy/
│
└── shared/
```

Eventually:

```text
packages/
├── simulation-core/
├── simulation-protocols/
├── cli-engine/
├── lab-schema/
├── grading-engine/
├── packet-engine/
└── ui/
```

---

# 88. DOMAIN SEPARATION

The following must NOT depend directly on React:

```text
simulation-core
packet-engine
routing-engine
switching-engine
cli-parser
grading-engine
lab-schema
```

This allows:

```text
Browser UI
      ↓
Simulation Core
```

without coupling the engine to UI components.

---

# 89. API CONTRACT

Create a stable simulator API.

Example:

```typescript
interface SimulationController {
  createLab(spec: LabSpec): Promise<LabRuntime>;

  addDevice(device: DeviceSpec): void;

  removeDevice(id: string): void;

  connect(link: LinkSpec): void;

  executeCommand(
    deviceId: string,
    command: string
  ): CLIResult;

  sendPacket(packet: Packet): void;

  step(): SimulationEvent[];

  run(): void;

  pause(): void;

  reset(): void;

  snapshot(): Snapshot;

  restore(snapshot: Snapshot): void;

  inspectPacket(id: string): PacketDetails;

  grade(spec: GradingSpec): GradeResult;
}
```

---

# 90. DESIGN PRINCIPLE: EVENT SOURCING

Whenever something meaningful happens, generate an event.

Examples:

```text
DEVICE_ADDED
LINK_CREATED
INTERFACE_UP
INTERFACE_DOWN
ARP_REQUEST
ARP_REPLY
MAC_LEARNED
FRAME_FORWARDED
FRAME_DROPPED
ROUTE_ADDED
ROUTE_REMOVED
OSPF_NEIGHBOR_UP
OSPF_NEIGHBOR_DOWN
PACKET_SENT
PACKET_DROPPED
ACL_MATCH
NAT_TRANSLATION
DHCP_OFFER
DHCP_ACK
```

This single architecture powers:

- logs
- animations
- packet capture
- replay
- AI
- grading
- analytics

---

# 91. DON'T BUILD THE WHOLE THING AT ONCE

The first production milestone should be:

```text
Router
+
Switch
+
PC
+
Ethernet
+
ARP
+
IPv4
+
ICMP
+
CLI
+
Packet animation
+
Packet inspector
```

The user should be able to:

```text
Create topology
↓
Configure IPs
↓
Ping
↓
Watch packet
↓
Inspect ARP
↓
Inspect ICMP
↓
Break interface
↓
Understand failure
```

If this experience is excellent, the rest of the simulator can grow organically.

---

# 92. DEFINITION OF DONE — V1

V1 is complete when a user can:

### Topology

- create router
- create switch
- create PC
- connect devices
- move devices
- delete devices
- save topology

### CLI

- open device terminal
- configure interfaces
- configure IP
- run show commands
- run ping

### Simulation

- Ethernet works
- ARP works
- IPv4 works
- ICMP works
- routing works
- switch MAC learning works

### Visualization

- packets animate
- packets can be paused
- packets can be inspected
- event logs work

### Learning

- guided lab works
- grading works
- score works
- reset works
- checkpoint works

### Academy

- lab appears in Lab Stack
- lab completion updates progress
- Cert Gate can reference lab

---

# 93. DEFINITION OF DONE — V2

V2:

- VLAN
- trunking
- STP
- DHCP
- NAT
- ACL
- IPv6
- OSPF
- packet capture
- PCAP
- troubleshooting engine
- AI tutor
- lab sharing

---

# 94. DEFINITION OF DONE — V3

V3:

- BGP
- EIGRP
- FHRP
- EtherChannel
- DNS
- HTTP
- firewall
- network services
- automation
- Python
- Ansible
- Jinja
- API
- advanced observability

---

# 95. DEFINITION OF DONE — V4

V4:

- multiplayer
- classroom mode
- instructor dashboard
- enterprise network design
- advanced security
- VXLAN/EVPN
- network telemetry
- professional certification labs
- realistic WAN impairment
- advanced performance simulation

---

# 96. CURSOR / CODING AGENT INSTRUCTIONS

When starting implementation:

### STEP 1

Inspect the entire existing NetForge Academy repository.

Do NOT modify anything yet.

Understand:

- framework
- routes
- components
- state management
- database
- authentication
- design system
- existing Practice pages
- Lab Stack
- Cert Gates
- curriculum
- deployment
- existing tests

### STEP 2

Create:

```text
docs/simulator/
```

and write:

```text
architecture.md
research.md
domain-model.md
roadmap.md
protocol-roadmap.md
ui-spec.md
lab-schema.md
grading.md
```

### STEP 3

Clone the inspiration repositories into:

```text
./inspiration/
```

or outside the production source tree.

Never import their source code automatically.

### STEP 4

Analyze them.

Create a feature matrix:

```text
Feature
NetSim
Cisco Real Sim
Alechiis NetSim
Broadcast Studio
Containerlab
PackeTTrino
NetForge
```

### STEP 5

Design NetForge's own architecture.

### STEP 6

Build V1 vertically.

Do not create 50 unfinished features.

Make one complete networking experience excellent.

---

# 97. FEATURE PRIORITY MATRIX

## P0 — MUST HAVE

```text
Topology editor
Device model
Link model
Router
Switch
PC
CLI
Ethernet
ARP
IPv4
ICMP
Static routing
Packet animation
Packet inspector
Logs
Save
Reset
Lab system
```

## P1 — HIGH PRIORITY

```text
VLAN
802.1Q
STP
DHCP
NAT
ACL
OSPF
IPv6
Packet capture
PCAP
Auto-grading
Troubleshooting
AI tutor
```

## P2 — ADVANCED

```text
BGP
EIGRP
FHRP
EtherChannel
DNS
HTTP
Firewall
Automation
Python
Ansible
REST
NETCONF
RESTCONF
```

## P3 — PLATFORM

```text
Multiplayer
Classroom
Instructor mode
Network design
Telemetry
Advanced enterprise
VXLAN
EVPN
SD-WAN
```

---

# 98. PRODUCT QUALITY REQUIREMENT

Every new protocol must include:

```text
Implementation
+
Unit tests
+
Integration tests
+
CLI commands
+
Show commands
+
Packet/event representation
+
Visualization
+
Failure states
+
Lab
+
Grading assertions
+
Documentation
```

Do not implement "OSPF" as merely a button that changes a routing table.

OSPF should produce meaningful:

```text
neighbor states
hello events
LSDB
SPF computation
route installation
failures
timers
```

---

# 99. CORE PRODUCT PHILOSOPHY

NetForge should always answer three questions:

### What happened?

```text
PC1 sent an ARP request.
```

### Why did it happen?

```text
PC1 did not know PC2's MAC address.
```

### What should I learn?

```text
ARP resolves an IPv4 address to a MAC address
on a local Ethernet segment.
```

This is the educational advantage NetForge can have over traditional simulators.

---

# 100. FINAL PRODUCT VISION

The finished NetForge experience should look like:

```text
                    NETFORGE ACADEMY
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
        STUDY           PRACTICE          CERTIFY
          │                │                 │
      Curriculum       Simulator         Cert Gates
      Resources        Labs              Assessments
      Lessons          Drills             Progress
                           │
                           ▼
                 NETWORK SIMULATOR
                           │
        ┌──────────────────┼───────────────────┐
        │                  │                   │
     DESIGN             CONFIGURE          OBSERVE
        │                  │                   │
     Topology              CLI              Packets
     Devices               VLAN             Logs
     Links                 Routing          Capture
                           │
                           ▼
                    TROUBLESHOOT
                           │
                   Break the network
                           │
                           ▼
                    ROOT CAUSE
                           │
                           ▼
                      AI TUTOR
                           │
                           ▼
                       FIX IT
                           │
                           ▼
                      AUTO-GRADE
                           │
                           ▼
                   CERTIFICATION PROGRESS
```

The ultimate goal is not:

> "NetForge has a network simulator."

The goal is:

> **NetForge becomes the place where someone can learn networking theory, build the network, configure it, break it, troubleshoot it, understand every packet, automate it, and prove their competence — entirely from a browser.**

That is the product worth building.

---

# 101. IMMEDIATE IMPLEMENTATION ORDER

The development team should execute exactly this sequence:

```text
01. Audit existing NetForge
02. Clone inspiration repositories
03. Analyze architectures
04. Freeze NetForge simulator architecture
05. Create simulator domain modules
06. Build topology canvas
07. Build device model
08. Build link model
09. Build event engine
10. Build packet model
11. Build Ethernet
12. Build ARP
13. Build IPv4
14. Build ICMP
15. Build static routing
16. Build CLI
17. Connect CLI → simulation
18. Build packet animation
19. Build packet inspector
20. Build event timeline
21. Build save/load
22. Build lab schema
23. Build grading
24. Integrate Lab Stack
25. Integrate Cert Gates
26. Add VLAN
27. Add STP
28. Add DHCP
29. Add NAT
30. Add ACL
31. Add OSPF
32. Add packet capture
33. Add troubleshooting engine
34. Add AI tutor
35. Add IPv6
36. Add advanced routing
37. Add security
38. Add automation
39. Add advanced enterprise networking
40. Add multiplayer/classroom functionality
```

**Do not skip directly to BGP, AI, multiplayer, or fancy animations before the deterministic simulation core is correct.**

The simulation engine is the product.

Everything else is a layer on top of it.