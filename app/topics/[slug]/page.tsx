import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllTopics,
  getRelatedTopics,
  getTopicBySlug,
} from "@/lib/topic-videos";
import { getCoursePlaylistsForModule } from "@/lib/playlists";
import { getModule } from "@/lib/curriculum";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export function generateStaticParams() {
  return getAllTopics().map((topic) => ({ slug: topic.slug }));
}

export default async function TopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) notFound();

  const related = getRelatedTopics(topic.relatedSlugs);
  const relatedCourses = topic.moduleIds.flatMap((id) => getCoursePlaylistsForModule(id));
  const uniqueCourses = relatedCourses.filter(
    (c, i, arr) => arr.findIndex((x) => x.slug === c.slug) === i,
  );
  const primaryModule = topic.moduleIds[0] ? getModule(topic.moduleIds[0]) : undefined;
  const youtubeUrl = `https://www.youtube.com/watch?v=${topic.youtubeId}`;

  return (
    <PageShell narrow>
      <Breadcrumb href="/topics" label="Topic Videos" />

      <header className="mt-4 mb-6 border-b border-border/60 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          {topic.tags?.map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{topic.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">{topic.summary}</p>
        {primaryModule && (
          <p className="mt-3 text-xs text-muted">
            Part of{" "}
            <Link
              href={`/curriculum/${primaryModule.phase.id}`}
              className="text-accent hover:underline"
            >
              Phase {primaryModule.phase.number}: {primaryModule.module.title}
            </Link>
          </p>
        )}
      </header>

      <YouTubeEmbed videoId={topic.youtubeId} title={topic.videoTitle} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span>
          {topic.videoTitle} ·{" "}
          <a
            href={topic.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            {topic.channel}
          </a>
        </span>
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-accent hover:underline"
        >
          Open on YouTube <span aria-hidden="true">↗</span>
        </a>
      </div>

      {related.length > 0 && (
        <Card className="mt-8 border-border/60 bg-surface/50">
          <h2 className="text-sm font-medium">Continue this topic</h2>
          <p className="mt-1 text-xs text-muted">
            Single-concept follow-ups in the same series — one video per page.
          </p>
          <ul className="mt-4 space-y-2">
            {related.map((r) => (
              <li key={r.slug}>
                <Link
                  href={`/topics/${r.slug}`}
                  className="text-sm text-accent hover:underline"
                >
                  {r.title}
                </Link>
                <span className="ml-2 text-xs text-muted">— {r.channel}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {uniqueCourses.length > 0 && (
        <Card className="mt-6 border-border/60 bg-surface/50">
          <h2 className="text-sm font-medium">Full courses for this module</h2>
          <ul className="mt-4 space-y-2">
            {uniqueCourses.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/topics/courses/${c.slug}`}
                  className="text-sm text-accent hover:underline"
                >
                  {c.title}
                </Link>
                <span className="ml-2 text-xs text-muted">
                  — {c.channel} · {c.videos.length} videos
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="mt-6 border-border/60 bg-surface/50">
        <p className="text-xs leading-relaxed text-muted">
          Video content © respective creators. Embedded for educational use under YouTube&apos;s
          embed terms. Primary CCNA lectures courtesy of{" "}
          <a
            href="https://www.youtube.com/@JeremysITLab"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Jeremy&apos;s IT Lab
          </a>
          .
        </p>
      </Card>
    </PageShell>
  );
}
