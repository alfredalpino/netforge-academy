# 07 — Simulation Engine & Discrete-Event Model

## Separation (PRD §15)

```text
UI → Application State → Simulation API → Simulation Engine → Protocol Modules → Network State
```

Never put forwarding logic in React components.

## Discrete-event simulation (DES)

Min-heap / priority queue ordered by simulation time `t`.

Event kinds (initial set):

- `LINK_TRANSMIT`
- `PACKET_ARRIVE`
- `TIMER` (ARP age, OSPF hello, DHCP lease, …)
- `CLI_COMMIT` (config applied)
- `INTERFACE_STATE`

### Execution API

```typescript
interface SimulationController {
  loadTopology(t: TopologySpec): void;
  step(maxEvents?: number): SimulationEvent[];
  runUntil(predicate | t | idle): SimulationEvent[];
  pause(): void;
  reset(seed?: number): void;
  snapshot(): EngineSnapshot;
  restore(s: EngineSnapshot): void;
  executeCommand(deviceId: string, line: string): CliResult;
  injectFault(fault: FaultSpec): void;
}
```

## Determinism

Inputs: topology + configs + RNG seed + injected events.  
Outputs: identical event stream and final tables.

Use seeded PRNG for MAC generation / tie-breaks only when needed; prefer deterministic IDs in labs.

## Event caps & safety

| Guard | Purpose |
|-------|---------|
| `MAX_EVENTS_PER_RUN` | Prevent infinite floods |
| `MAX_PACKETS_IN_FLIGHT` | Memory bound |
| TTL on IP | Loop prevention |
| Broadcast storm detector | Lab pedagogy + safety |

**Tradeoff — hard caps vs realism:** Educational labs rarely need >10k events per action. Cap with clear UI message (“Simulation stopped: event limit — check loop”).

## Decouple animation

Worker runs to completion (or step N); returns `PacketTrace[]`. UI animates optionally. Correctness never waits on `requestAnimationFrame` (PackeTTrino anti-pattern).

## Testing

- Golden fixtures: ARP miss → request → reply → ping success
- Property: no event processed twice; heap monotonic timestamps
- Snapshot serialize/roundtrip
