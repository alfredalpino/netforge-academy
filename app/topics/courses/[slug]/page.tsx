import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCoursePlaylists, getCoursePlaylist } from "@/lib/playlists";
import { getModule } from "@/lib/curriculum";
import { PageShell } from "@/components/ui/PageShell";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Card } from "@/components/ui/Card";
import { CoursePlayer, CourseTagRow } from "@/components/CoursePlayer";

export function generateStaticParams() {
  return getAllCoursePlaylists().map((course) => ({ slug: course.slug }));
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = getCoursePlaylist(slug);
  if (!course) notFound();

  const primaryModule = course.moduleIds[0] ? getModule(course.moduleIds[0]) : undefined;

  return (
    <PageShell testId="course-page">
      <Breadcrumb href="/topics" label="Topic Videos" />

      <header className="mt-4 mb-6 border-b border-border/60 pb-6">
        <CourseTagRow tags={course.tags} />
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{course.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted">{course.summary}</p>
        {primaryModule && (
          <p className="mt-3 text-xs text-muted">
            Aligns with{" "}
            <Link
              href={`/curriculum/${primaryModule.phase.id}`}
              className="text-accent hover:underline"
            >
              Phase {primaryModule.phase.number}: {primaryModule.module.title}
            </Link>
          </p>
        )}
      </header>

      <CoursePlayer course={course} />

      <Card className="mt-8 border-border/60 bg-surface/50">
        <p className="text-xs leading-relaxed text-muted">
          Video content © {course.channel}. Embedded for educational use under YouTube&apos;s
          embed terms. Full playlists stay on YouTube — this page is a study-friendly player.
        </p>
      </Card>
    </PageShell>
  );
}
