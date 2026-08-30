"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import {
  getModuleAcademyResources,
  getSimulatorLabHref,
} from "@/lib/academy-resources";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface AcademyPracticeSectionProps {
  /** dashboard = full section; today = compact card; journey = inline links */
  variant?: "dashboard" | "today" | "journey";
}

export function AcademyPracticeSection({ variant = "dashboard" }: AcademyPracticeSectionProps) {
  const { progress, loaded } = useProgress();
  if (!loaded) return null;

  const { topic, topics, simulatorLab } = getModuleAcademyResources(progress.currentModuleId);
  const hasTopics = topics.length > 0;
  const hasLab = Boolean(simulatorLab);

  if (variant === "journey") {
    if (!hasTopics && !hasLab) return null;
    return (
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-4">
        <span className="text-xs text-muted">Reinforce:</span>
        {topic && (
          <Link
            href={`/topics/${topic.slug}`}
            className="rounded-md border border-border/70 bg-background px-2.5 py-1 text-xs text-accent hover:border-accent/40 hover:bg-accent/5"
          >
            Watch · {topic.title}
          </Link>
        )}
        {!topic && hasTopics && (
          <Link
            href="/topics"
            className="rounded-md border border-border/70 bg-background px-2.5 py-1 text-xs text-accent hover:border-accent/40 hover:bg-accent/5"
          >
            Topic Videos
          </Link>
        )}
        {simulatorLab && (
          <Link
            href={getSimulatorLabHref(simulatorLab.id)}
            className="rounded-md border border-border/70 bg-background px-2.5 py-1 text-xs text-accent hover:border-accent/40 hover:bg-accent/5"
          >
            Practice · {simulatorLab.title}
          </Link>
        )}
        {!hasLab && (
          <Link
            href="/simulator"
            className="rounded-md border border-border/70 bg-background px-2.5 py-1 text-xs text-muted hover:text-accent"
          >
            Simulator
          </Link>
        )}
      </div>
    );
  }

  if (variant === "today") {
    if (!hasTopics && !hasLab) return null;
    return (
      <Card className="mb-6 border-accent/20 bg-accent/[0.03] py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs text-muted">Reinforce today&apos;s module</p>
            <p className="mt-1 text-sm font-medium">
              {hasTopics ? "Watch a topic video, then practice in the browser lab." : "Practice in the browser simulator."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {topic ? (
              <Link href={`/topics/${topic.slug}`}>
                <Button size="sm" variant="secondary">
                  Watch · {topic.title}
                </Button>
              </Link>
            ) : hasTopics ? (
              <Link href="/topics">
                <Button size="sm" variant="secondary">
                  Topic Videos
                </Button>
              </Link>
            ) : null}
            {simulatorLab ? (
              <Link href={getSimulatorLabHref(simulatorLab.id)}>
                <Button size="sm" variant="secondary">
                  Lab · {simulatorLab.title}
                </Button>
              </Link>
            ) : (
              <Link href="/simulator">
                <Button size="sm" variant="ghost">
                  Open Simulator
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card variant="elevated" data-tour="practice" className="!p-0 overflow-hidden">
      <div className="grid lg:grid-cols-2">
        <div className="border-b border-border/60 p-6 lg:border-b-0 lg:border-r lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <p className="section-label">Watch</p>
            {hasTopics && <Badge>{topics.length} for your module</Badge>}
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">Topic Videos</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            One concept per page — curated CCNA lectures aligned to your current curriculum module.
            Watch before config blocks; no autoplay on the dashboard.
          </p>
          {topic ? (
            <p className="mt-4 text-sm">
              <span className="text-muted">Suggested: </span>
              <Link href={`/topics/${topic.slug}`} className="text-accent hover:underline">
                {topic.title}
              </Link>
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Browse lectures by phase — subnetting, VLANs, OSPF, and more.
            </p>
          )}
          <Link href={topic ? `/topics/${topic.slug}` : "/topics"} className="mt-6 inline-block">
            <Button variant="secondary" size="sm">
              {topic ? `Watch ${topic.title}` : "Browse Topic Videos"}
            </Button>
          </Link>
        </div>

        <div className="bg-background/25 p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <p className="section-label">Practice</p>
            {hasLab && <Badge tone="success">Browser lab</Badge>}
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold tracking-tight">Simulator</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Graded topology labs in your browser — configure devices, run ping, and see packet flow.
            Zero install for quick reps between Packet Tracer sessions.
          </p>
          {simulatorLab ? (
            <p className="mt-4 text-sm">
              <span className="text-muted">Matched lab: </span>
              <span className="text-foreground">{simulatorLab.title}</span>
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">
              Free-play sandbox or pick a lab from the Lab Stack page.
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={simulatorLab ? getSimulatorLabHref(simulatorLab.id) : "/simulator"}>
              <Button size="sm">
                {simulatorLab ? `Launch ${simulatorLab.title}` : "Open Simulator"}
              </Button>
            </Link>
            <Link href="/labs">
              <Button size="sm" variant="ghost">
                Lab Stack →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
