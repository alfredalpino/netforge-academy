# 10 — Web Worker / WASM Strategy

## V1 decision: TypeScript Dedicated Worker

```text
Main thread: UI + canvas + xterm + animator
Worker: DES + protocols + CLI + capture buffer
```

Transport: structured-clone `postMessage` with versioned message protocol.

### Message protocol (sketch)

```typescript
type ToWorker =
  | { type: "init"; seed: number }
  | { type: "load"; topology: TopologySpec; configs: Record<string, string> }
  | { type: "cmd"; deviceId: string; line: string; requestId: string }
  | { type: "step"; n: number; requestId: string }
  | { type: "run"; until: "idle" | number; requestId: string }
  | { type: "snapshot"; requestId: string }
  | { type: "restore"; snapshot: EngineSnapshot; requestId: string };

type FromWorker =
  | { type: "ready" }
  | { type: "cli"; requestId: string; result: CliResult }
  | { type: "events"; requestId: string; events: SimulationEvent[]; traces: PacketTrace[] }
  | { type: "error"; requestId?: string; message: string };
```

## Shared module rule

Compile/import the **same** `simulation/*` sources into the worker bundle. Avoid duplicating CLI in `public/*.js` (cisco-real-sim smell).

**Next.js note:** Use worker via bundler (`new Worker(new URL("./worker.ts", import.meta.url))`) or static asset carefully; update CSP/`next.config.ts` as needed.

## WASM (V2+)

Consider Rust/WASM **only when**:

- Profiles show Worker JS CPU-bound on realistic labs, and
- Hotspots are isolatable (SPF, packet parse), and
- Team accepts toolchain cost

**Do not** start from Alechiis AGPL crate. Clean-room only.

| Approach | When |
|----------|------|
| TS Worker only | Default through P2 |
| WASM accel | P3 optional |
| Server sim | Never for default tier |

## Tradeoff summary

| | Latency | Offline | Complexity | Legal |
|--|---------|---------|------------|-------|
| TS Worker | Low–med | Yes | Med | Clean |
| WASM | Lower CPU | Yes | High | Clean if original |
| Python API | Network RTT | No | Med | Clean but wrong default |
