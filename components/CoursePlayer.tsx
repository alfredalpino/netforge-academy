"use client";

import { useState } from "react";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { Badge } from "@/components/ui/Badge";
import type { CoursePlaylist } from "@/lib/playlists";
import { youtubePlaylistUrl } from "@/lib/playlists";

export function CoursePlayer({ course }: { course: CoursePlaylist }) {
  const [activeId, setActiveId] = useState(course.videos[0]?.videoId ?? "");
  const active = course.videos.find((v) => v.videoId === activeId) ?? course.videos[0];

  if (!active) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
      <div>
        <YouTubeEmbed
          videoId={active.videoId}
          playlistId={course.playlistId}
          title={active.title}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <span>
            {active.index}. {active.title} ·{" "}
            <a
              href={course.channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {course.channel}
            </a>
          </span>
          <a
            href={youtubePlaylistUrl(course.playlistId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent hover:underline"
          >
            Open playlist on YouTube <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div
        className="max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-surface/70"
        data-testid="course-episode-list"
      >
        <p className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-3 text-xs font-medium text-muted">
          {course.videos.length} videos
        </p>
        <ol>
          {course.videos.map((video) => {
            const selected = video.videoId === active.videoId;
            return (
              <li key={video.videoId}>
                <button
                  type="button"
                  onClick={() => setActiveId(video.videoId)}
                  className={`w-full border-b border-border/50 px-4 py-3 text-left text-sm transition hover:bg-surface-hover ${
                    selected ? "bg-accent/10 text-foreground" : "text-muted"
                  }`}
                >
                  <span className="font-mono text-[0.65rem] text-accent">{video.index}</span>
                  <span className="mt-0.5 block leading-snug">{video.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export function CourseTagRow({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge key={tag}>{tag}</Badge>
      ))}
    </div>
  );
}
