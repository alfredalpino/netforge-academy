# 09 — CLI / Parser Architecture

## Product rule

Devices run **NetForgeOS** with **Cisco IOS-style** educational CLI. Do not claim to distribute Cisco IOS.

## Mode machine

```text
User EXEC (>) → Privileged EXEC (#) → Global Config (config)#
  → Interface / Router / Line / VLAN config modes
```

## Pipeline

```text
raw line → tokenize → mode-aware parse → validate → execute → mutate running-config + schedule side effects → render output
```

Execution runs **inside the Worker** so UI stays responsive.

## Features (priority)

| Feature | Priority |
|---------|----------|
| Mode prompts | P0 |
| `enable`, `configure terminal`, `interface`, `ip address`, `no shutdown` | P0 |
| `show ip interface brief`, `show running-config`, `show arp`, `show mac address-table`, `show ip route` | P0 |
| Abbreviation + unique prefix | P0 |
| `?` context help | P1 |
| Tab completion | P1 |
| History / Ctrl-P | P1 |
| `copy run start`, startup restore on reload | P1 |
| OSPF / VLAN / ACL command sets | as protocols land |

## Command tree

Declarative registry per mode:

```typescript
interface CommandNode {
  name: string;
  aliases?: string[];
  help: string;
  children?: CommandNode[];
  run?: (ctx: CliContext, args: string[]) => CliResult;
}
```

**Tradeoff — giant switch vs tree:** Tree enables `?` and completion; switch is faster to hack. Prefer tree from day one (avoid cisco-real-sim executor sprawl).

## Host CLI (optional profile)

PC/Server may expose a **Linux-like** mini-shell (`ping`, `ip addr`) as a separate profile — PackeTTrino concept, clean-room. Not P0 for routers/switches.

## Safety

- No eval of user strings
- Command length limits
- Rate-limit flood commands in labs
