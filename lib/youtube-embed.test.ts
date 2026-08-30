import { describe, expect, it } from "vitest";
import { youtubeEmbedUrl, youtubeThumbnailUrl } from "./youtube-embed";

describe("youtube embed helpers", () => {
  it("builds privacy-enhanced embed URL", () => {
    const url = youtubeEmbedUrl("H8W9oMNSuwo");
    expect(url).toContain("youtube-nocookie.com/embed/H8W9oMNSuwo");
    expect(url).toContain("rel=0");
  });

  it("builds thumbnail URL", () => {
    expect(youtubeThumbnailUrl("H8W9oMNSuwo")).toBe(
      "https://i.ytimg.com/vi/H8W9oMNSuwo/hqdefault.jpg",
    );
  });

  it("appends playlist id when provided", () => {
    const url = youtubeEmbedUrl("H8W9oMNSuwo", "PLw6kwOJVj3MbMZ8B72ZgUryj8OSETC0ds");
    expect(url).toContain("list=PLw6kwOJVj3MbMZ8B72ZgUryj8OSETC0ds");
  });
});
