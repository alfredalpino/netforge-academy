import Link from "next/link";
import { LAB_STACK } from "@/lib/curriculum";
import { LabSetupChecklist } from "@/components/LabSetupChecklist";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function LabsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Lab Environment"
        title="Lab Stack"
        description="Tools to install locally — NetForge tracks setup progress; labs run on your machine."
        actions={
          <Link href="/resources">
            <Button variant="secondary">Browse resources</Button>
          </Link>
        }
      />

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

      <LabSetupChecklist />

      <Card className="mt-10 border-accent/30">
        <h2 className="text-sm font-medium">Distraction-Free Workflow</h2>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm leading-relaxed text-muted">
          <li>Open NetForge in one browser window — Focus Mode only</li>
          <li>Run labs in Packet Tracer / EVE-NG / VMs — not YouTube</li>
          <li>Wireshark on second monitor for packet analysis blocks</li>
          <li>Phone in another room during deep work blocks</li>
          <li>Saturday = assessment day; Sunday = light review only</li>
        </ol>
        <Link href="/focus" className="mt-4 inline-block">
          <Button variant="ghost" className="px-0">
            Enter Focus Mode →
          </Button>
        </Link>
      </Card>
    </PageShell>
  );
}
