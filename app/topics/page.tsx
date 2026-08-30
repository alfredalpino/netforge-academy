import Link from "next/link";
import { PHASES } from "@/lib/curriculum";
import { getAllTopics } from "@/lib/topic-videos";
import { getAllCoursePlaylists } from "@/lib/playlists";
import { PageShell } from "@/components/ui/PageShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export default function TopicsIndexPage() {
  const topics = getAllTopics();
  const courses = getAllCoursePlaylists();

  const byPhase = PHASES.map((phase) => ({
    phase,
    topics: topics.filter((t) => t.phaseIds.includes(phase.id)),
  })).filter((g) => g.topics.length > 0);

  return (
    <PageShell testId="topics-page">
      <PageHeader
        eyebrow="Curated Lectures"
        title="Topic Videos"
        description={`${topics.length} single-concept lectures plus ${courses.length} full courses — watch one idea, or play a whole playlist.`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/today">
              <Button variant="secondary">Continue today</Button>
            </Link>
            <Link href="/drills">
              <Button variant="ghost">Open drills</Button>
            </Link>
          </div>
        }
      />

      <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted">
        Multi-part topics (OSPF, VLANs, subnetting) stay one idea per page. Full courses (CCNA
        practical, Security+, Bash) play as playlists when you want a longer path.
      </p>

      <section className="mb-12" data-testid="full-courses">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-medium">Full courses</h2>
          <Badge>{courses.length}</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.slug}
              href={`/topics/courses/${course.slug}`}
              className="group flex flex-col rounded-xl border border-accent/25 bg-surface p-5 transition hover:border-accent/50 hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <h3 className="text-sm font-medium transition-colors group-hover:text-accent">
                {course.title}
              </h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-muted line-clamp-3">
                {course.summary}
              </p>
              <p className="mt-3 text-xs text-muted">
                {course.channel} · {course.videos.length} videos
              </p>
            </Link>
          ))}
        </div>
      </section>

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
