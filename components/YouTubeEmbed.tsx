"use client";

import { useState } from "react";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "@/lib/youtube-embed";

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  className?: string;
}

export function YouTubeEmbed({ videoId, title, className = "" }: YouTubeEmbedProps) {
  const src = youtubeEmbedUrl(videoId);
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-black/40 ${className}`}
      data-testid="youtube-embed"
    >
      <div className="relative aspect-video w-full bg-black">
        {!loaded && (
          <img
            src={youtubeThumbnailUrl(videoId)}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-80"
          />
        )}
        <iframe
          src={src}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  );
}
