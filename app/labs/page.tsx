import Link from "next/link";
import { LAB_STACK } from "@/lib/curriculum";
import { LabSetupChecklist } from "@/components/LabSetupChecklist";

export default function LabsPage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Lab Stack</h1>
        <p className="mt-1 text-muted">
          Tools to install — the browser academy tracks progress; labs run on your machine
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-medium">Required Tools</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {LAB_STACK.map((tool) => (
            <div
              key={tool.name}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{tool.name}</h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    tool.tier === "essential"
                      ? "bg-success/15 text-success"
                      : "bg-warning/15 text-warning"
                  }`}
                >
                  {tool.tier}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{tool.use}</p>
            </div>
          ))}
        </div>
      </section>

      <LabSetupChecklist />

      <section className="mt-10 rounded-xl border border-accent/30 bg-surface p-6">
        <h2 className="text-sm font-medium">Distraction-Free Workflow</h2>
        <ol className="mt-3 list-inside list-decimal space-y-2 text-sm text-muted">
          <li>Open this academy in one browser window — Focus Mode only</li>
          <li>Run labs in Packet Tracer / EVE-NG / VMs — not YouTube</li>
          <li>Wireshark on second monitor for packet analysis blocks</li>
          <li>Phone in another room during Block 1–4 (08:00–17:00)</li>
          <li>Saturday = assessment day; Sunday = light review only</li>
        </ol>
        <Link href="/resources" className="mt-4 inline-block text-xs text-accent hover:underline">
          Browse learning resources →
        </Link>
      </section>
    </div>
  );
}
