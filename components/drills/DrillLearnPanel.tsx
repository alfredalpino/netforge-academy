"use client";

import Link from "next/link";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { SubnetWorkedExample, VlsmWorkedExample } from "@/lib/drill-examples";

interface VideoLink {
  href: string;
  label: string;
}

interface DrillLearnPanelProps {
  examples: SubnetWorkedExample[] | VlsmWorkedExample[];
  videoLinks: readonly VideoLink[];
  kind: "subnet" | "vlsm";
}

function isSubnetExample(
  ex: SubnetWorkedExample | VlsmWorkedExample,
): ex is SubnetWorkedExample {
  return "answer" in ex;
}

export function DrillLearnPanel({ examples, videoLinks, kind }: DrillLearnPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 space-y-3" data-testid="drill-learn-panel">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setOpen((v) => !v)}
          data-testid="drill-examples-toggle"
          aria-expanded={open}
        >
          {open ? "Hide examples" : "Learn / Examples"}
        </Button>
        {videoLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Button size="sm" variant="ghost" data-testid={`drill-video-${link.href}`}>
              Video · {link.label} ↗
            </Button>
          </Link>
        ))}
      </div>

      {open && (
        <Card className="space-y-5 py-5" data-testid="drill-examples-content">
          <p className="text-sm text-muted">
            Worked {kind === "subnet" ? "subnetting" : "VLSM"} examples — study these, then
            start the timer and try a new question.
          </p>
          {examples.map((ex) => (
            <div key={ex.id} className="border-t border-border/60 pt-4 first:border-t-0 first:pt-0">
              <h3 className="text-sm font-medium">{ex.title}</h3>
              <p className="mt-1 font-mono text-sm text-accent">{ex.given}</p>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-muted">
                {ex.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              {isSubnetExample(ex) ? (
                <dl className="mt-3 grid gap-1 font-mono text-xs sm:grid-cols-2">
                  <div className="flex justify-between gap-2 sm:block">
                    <dt className="text-muted">Network</dt>
                    <dd>{ex.answer.network}</dd>
                  </div>
                  <div className="flex justify-between gap-2 sm:block">
                    <dt className="text-muted">Broadcast</dt>
                    <dd>{ex.answer.broadcast}</dd>
                  </div>
                  <div className="flex justify-between gap-2 sm:block">
                    <dt className="text-muted">First / Last</dt>
                    <dd>
                      {ex.answer.firstHost} – {ex.answer.lastHost}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2 sm:block">
                    <dt className="text-muted">Usable</dt>
                    <dd>{ex.answer.usableHosts}</dd>
                  </div>
                </dl>
              ) : (
                <dl className="mt-3 space-y-1 font-mono text-xs">
                  {ex.allocations.map((a) => (
                    <div key={a.name} className="flex justify-between gap-4">
                      <dt>{a.name}</dt>
                      <dd>
                        {a.network}/{a.prefix} ({a.usableHosts} usable)
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
