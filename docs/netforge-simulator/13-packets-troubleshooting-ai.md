# 13 — Packets, Troubleshooting & AI Tutor

## Packet visualization

Defining feature (PRD §21–25).

Flow:

```text
Worker emits PacketTrace { packetId, hops: [{deviceId, iface, t, action}] }
  → Packets pane list
  → Animator draws hop path on canvas
  → Inspector shows dissected layers
```

Controls: play / pause / step / speed. Reduced motion → jump to end + highlight path.

Colors via `--sim-packet-*` tokens.

## Capture & PCAP

- Ring buffer of recent packets (configurable size)
- Filter by device / proto / IP
- Export `.pcap` (joxo concept; implement clean-room writer)
- Store large blobs in IDB `captures`

## Failure injection (P1+)

Link down, interface err-disable, ACL drop, wrong VLAN, bad gateway — first-class for challenges.

## Root-cause engine (rule-based first)

```text
Symptom (ping fail)
  → gather evidence (ARP miss? L2? route? ACL? NAT?)
  → ordered hypotheses with confidence
  → structured Explanation object
```

Never invent packet facts — only cite engine evidence.

## AI tutor architecture (PRD §31–32)

```text
Simulation state + CheckResult[] + Explanation
        ↓
Diagnostic engine (deterministic)
        ↓
Structured brief
        ↓
LLM narrator (optional) — paraphrases; cannot override facts
```

### AI safety

- Model must not claim Cisco certification authority falsely
- Must not exfiltrate other users’ labs (future multi-tenant)
- Prefer on-device / gateway with tight prompt: “explain these JSON facts”
- Offline: show structured explanation without LLM

**Tradeoff — LLM from day one:** High polish risk of hallucination. **P0:** structured tutor only. **P2:** LLM narration behind flag.

## Troubleshooting mode UX

Guided “Break it / Fix it” challenges with Score tab showing remaining hypotheses revealed gradually (pedagogy).
