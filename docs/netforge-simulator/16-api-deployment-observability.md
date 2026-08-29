# 16 — API Contracts, Deployment, Scalability & Observability

## In-process API (P0 — required)

`SimulationController` interface (see `07-simulation-engine.md` and PRD §89). This is the stable contract between UI and Worker.

No HTTP required for simulation.

## Future HTTP API (P2+ with auth)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/labs` | Catalog (or stay static) |
| `POST /api/lab-attempts` | Authoritative grade audit |
| `GET/PUT /api/user/labs` | Cloud save |
| `POST /api/tutor` | LLM narration with evidence payload |

**Tradeoff — API early:** Delays P0; unnecessary without auth. Prefer static catalog + IDB until product asks for sync.

## Deployment

- Same Vercel Next.js app (`vercel.json`)
- Code-split simulator
- SW cache: network-first for sim chunks; precache catalog YAML carefully (size)
- Headers: adjust CSP for Worker/`blob:` as needed; keep HSTS/frame deny

## Scalability

| Dimension | Approach |
|-----------|----------|
| Users | Client-side sim scales with user devices |
| Lab catalog | Static CDN / git content |
| Server grades | Stateless functions; queue if heavy |
| Tier B clab | Separate lab hosts; never on Vercel serverless Docker |

## Observability

Client (optional):

- Anonymous funnel: sim open → first ping → first submit (respect privacy; existing install analytics patterns in `lib/pwa/install-analytics.ts`)
- Error boundary already exists — extend for Worker crashes
- Performance marks around `run` / `grade`

Server (future): attempt success rates, popular labs, tutor latency.

No PII in logs by default.
