# 12 — Lab Schema, Lab-as-Code & Grading

## Lab-as-code (NetForge-native)

Inspired by Containerlab nodes/links and joxo validate blocks — **own schema**.

```yaml
# content/labs/basic-lan.nlab.yaml
id: basic-lan
title: Basic LAN Connectivity
difficulty: beginner
estimatedMinutes: 15
objectives:
  - Assign IP addresses
  - Verify PC1 can ping R1
nodes:
  R1: { type: router }
  SW1: { type: switch }
  PC1: { type: host }
links:
  - endpoints: [R1:Gi0/0, SW1:Gi0/1]
  - endpoints: [SW1:Gi0/2, PC1:eth0]
startupConfig:
  R1: |
    hostname R1
checks:
  - type: interface_up
    device: R1
    interface: Gi0/0
  - type: ping
    from: PC1
    to: 10.0.0.1
    expect: success
grading:
  passScore: 80
  weights: { checks: 1 }
```

JSON Schema to be added under `simulation/lab-schema/` during implementation.

**Tradeoff — full clab compatibility vs native:** Native is simpler for DES; offer **export to `.clab.yml`** later for Tier B.

## Grading engine

```typescript
interface CheckResult {
  id: string;
  type: string;
  pass: boolean;
  detail: string;
  evidence?: unknown; // for AI tutor
}

function grade(lab: LabSpec, engine: SimulationController): GradeReport;
```

### Check types (P0–P1)

- `interface_up` / `interface_ip`
- `ping` / `traceroute_path`
- `route_present`
- `vlan_exists` / `mac_learned`
- `config_contains` (last resort — prefer behavioral)

**Tradeoff — live vs answer-key:** Live teaches truth of the sim; answer-key easier to author for complex OSPF. Use **live first**; add snapshot keys for advanced labs.

### Submission flow

1. Student clicks Submit  
2. Worker runs checks deterministically  
3. Store attempt in IDB  
4. Optionally update academy gate criterion when integrated  
5. Future: POST to server for audit

## Catalog

Bundle YAML under `content/labs/`. Explore page reads static import / FS at build time.
