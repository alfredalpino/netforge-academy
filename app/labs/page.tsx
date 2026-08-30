"use client";

import Link from "next/link";
import { LAB_STACK } from "@/lib/curriculum";
import { LAB_LIST } from "@/content/labs";
import { getWeekLabRunbooks } from "@/lib/lab-runbooks";
import { useProgress } from "@/lib/progress";
import { LabSetupChecklist } from "@/components/LabSetupChecklist";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const LAB_BLURBS: Record<string, string> = {
  "basic-lan":
    "Address a router and host through a switch, then grade a live ping — runs entirely in your browser.",
  "vlan-segment":
    "Access VLANs, trunk ports, and isolation — see why same-switch hosts still fail across VLANs.",
  "arp-icmp":
    "Two hosts on one subnet — configure IPs and ping; trace ARP resolution and ICMP in the Packets tab.",
  "trunk-vlan":
    "802.1Q trunk between two switches — extend VLAN 10 so hosts on different switches can reach each other.",
  "static-route":
    "Two routers, two LANs — static routes on both sides for end-to-end connectivity across subnets.",
  "ospf-basic":
    "Two routers, two LANs — OSPF process 1 area 0 on both sides; verify neighbors FULL and ping across subnets.",
  "dhcp-basic":
    "Router DHCP pool on a switched LAN — configure pool + `ip address dhcp` on PC1; watch DORA in Capture.",
  "stp-loop":
    "Three switches in a triangle — STP blocks one redundant link; address PCs and ping across the spanning tree.",
  "acl-standard":
    "Two LANs on one router — standard ACL denies one subnet; verify one-way ping block with `show access-lists`.",
  "inter-vlan-routing":
    "Router-on-a-stick — dot1Q subinterfaces on R1 route between VLAN 10 and VLAN 20 through a trunk.",
  "acl-extended":
    "Extended ACL 100 — deny ICMP between subnets on R1; verify ping block with `show access-lists` hit counts.",
  "inter-vlan-svi":
    "Multilayer switch SVIs — Vlan10/Vlan20 gateways + `ip routing` route between access VLANs without a router.",
  "nat-basic":
    "PAT overload on R1 — inside/outside NAT, ACL 1, and ping from private PC to outside server via translated source IP.",
  "acl-tcp":
    "Extended ACL 101 — deny TCP dst eq 80 from PC1 subnet to PC2; permit ip any any. Probe ports 80 vs 443; ping still works.",
};

export default function LabsPage() {
  const { progress, loaded, isSimulatorLabComplete } = useProgress();
  const weekRunbooks = loaded ? getWeekLabRunbooks(progress.currentWeek) : [];
  const passedCount = loaded
    ? LAB_LIST.filter((l) => isSimulatorLabComplete(l.id)).length
    : 0;

  return (
    <PageShell testId="labs-page">
      <PageHeader
        eyebrow="Lab Environment"
        title="Lab Stack"
        description="Browser labs grade in NetForge — install local tools when you need Packet Tracer or Wireshark."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/simulator?lab=basic-lan">
              <Button variant="primary">Open Simulator</Button>
            </Link>
            <Link href="/today">
              <Button variant="secondary">Continue today</Button>
            </Link>
          </div>
        }
      />

      <section className="mb-10">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-medium">Browser labs (zero install)</h2>
          {loaded && (
            <Badge tone={passedCount === LAB_LIST.length ? "success" : "default"}>
              {passedCount}/{LAB_LIST.length} passed
            </Badge>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {LAB_LIST.map((lab) => (
            <Card key={lab.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{lab.title}</h3>
                <div className="flex shrink-0 flex-wrap gap-1">
                  {loaded && isSimulatorLabComplete(lab.id) && (
                    <Badge tone="success">Passed</Badge>
                  )}
                  <Badge tone="default">{lab.difficulty}</Badge>
                </div>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                {LAB_BLURBS[lab.id] ?? lab.objectives[0]}
              </p>
              <Link href={`/simulator?lab=${lab.id}`} className="mt-4">
                <Button size="sm" variant="secondary">
                  Launch lab
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-medium">Required Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {LAB_STACK.map((tool) => (
            <Card key={tool.name} className="flex flex-col">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-medium">{tool.name}</h3>
                <Badge tone={tool.tier === "essential" ? "success" : "warning"}>
                  {tool.tier}
                </Badge>
              </div>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{tool.use}</p>
            </Card>
          ))}
        </div>
      </section>

      {weekRunbooks.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-medium">
            This week&apos;s lab runbooks
            <span className="ml-2 text-muted">(Week {progress.currentWeek})</span>
          </h2>
          <div className="grid gap-4">
            {weekRunbooks.map((runbook) => (
              <Card key={`w${runbook.week}-d${runbook.day}`}>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium">{runbook.title}</h3>
                  <Badge tone="default">Day {runbook.day}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted">
                  <span className="font-medium text-foreground">Topology:</span>{" "}
                  {runbook.topology}
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-wide text-muted">
                      Steps
                    </h4>
                    <ol className="mt-2 list-inside list-decimal space-y-1.5 text-sm leading-relaxed text-muted">
                      {runbook.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-wide text-muted">
                      Verify
                    </h4>
                    <ul className="mt-2 list-inside list-disc space-y-1.5 text-sm leading-relaxed text-muted">
                      {runbook.verify.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}

      <LabSetupChecklist />

      <Card className="mt-10 border-accent/30">
        <h2 className="text-sm font-medium">Distraction-Free Workflow</h2>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-relaxed text-muted">
          <li>Open NetForge in one browser window — Today page for your plan</li>
          <li>Run labs in Packet Tracer / EVE-NG / VMs — not YouTube</li>
          <li>Wireshark on second monitor for packet analysis blocks</li>
          <li>Phone in another room during deep work blocks</li>
          <li>Saturday = assessment day; Sunday = light review only</li>
        </ol>
        <Link href="/today" className="mt-4 inline-block">
          <Button variant="ghost" className="px-0">
            Open Today&apos;s Plan →
          </Button>
        </Link>
      </Card>
    </PageShell>
  );
}
