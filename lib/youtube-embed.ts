/** Privacy-enhanced YouTube embed URL (youtube-nocookie.com). */
export function youtubeEmbedUrl(videoId: string, playlistId?: string): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
  });
  if (playlistId) params.set("list", playlistId);
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function youtubeThumbnailUrl(videoId: string, quality: "hq" | "mq" = "hq"): string {
  const file = quality === "hq" ? "hqdefault.jpg" : "mqdefault.jpg";
  return `https://i.ytimg.com/vi/${videoId}/${file}`;
}
