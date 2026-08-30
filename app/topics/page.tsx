import Link from "next/link";
import { PHASES } from "@/lib/curriculum";
import { getAllTopics } from "@/lib/topic-videos";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";

export default function TopicsIndexPage() {
  const topics = getAllTopics();

  const byPhase = PHASES.map((phase) => ({
    phase,
    topics: topics.filter((t) => t.phaseIds.includes(phase.id)),
  })).filter((g) => g.topics.length > 0);

  return (
    <PageShell testId="topics-page">
      <PageHeader
        eyebrow="Curated Lectures"
        title="Topic Videos"
        description={`${topics.length} single-concept explanation videos — Jeremy's IT Lab CCNA lectures and selected supplements, one topic per page.`}
      />

      <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted">
        Each page embeds one focused lecture. Multi-part topics (OSPF, VLANs, subnetting) are
        split into separate pages so you learn one idea at a time — LAN on the LAN page, STP on
        the STP page, and so on.
      </p>

      <div className="space-y-10">
        {byPhase.map(({ phase, topics: phaseTopics }) => (
          <section key={phase.id}>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-medium">
                Phase {phase.number}: {phase.title}
              </h2>
              <Badge>{phaseTopics.length}</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {phaseTopics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className="group flex flex-col rounded-xl border border-border bg-surface p-5 transition hover:border-accent/40 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <h3 className="text-sm font-medium transition-colors group-hover:text-accent">
                    {topic.title}
                  </h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-muted line-clamp-2">
                    {topic.summary}
                  </p>
                  <p className="mt-3 text-xs text-muted">{topic.channel}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
