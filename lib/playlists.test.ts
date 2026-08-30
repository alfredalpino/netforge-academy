import { describe, expect, it } from "vitest";
import {
  COURSE_PLAYLISTS,
  getCoursePlaylist,
  getCoursePlaylistsForModule,
  youtubePlaylistUrl,
} from "./playlists";

describe("course playlists", () => {
  it("includes CCNA, Security+, and Bash courses with video catalogs", () => {
    expect(COURSE_PLAYLISTS.map((p) => p.slug).sort()).toEqual([
      "bash-scripting",
      "ccna-bombal",
      "security-plus",
    ]);
    expect(getCoursePlaylist("ccna-bombal")?.videos.length).toBeGreaterThan(30);
    expect(getCoursePlaylist("security-plus")?.videos.length).toBe(121);
    expect(getCoursePlaylist("bash-scripting")?.videos.length).toBe(62);
  });

  it("maps modules to the expected course", () => {
    expect(getCoursePlaylistsForModule("m13-security-fundamentals")[0]?.slug).toBe(
      "security-plus",
    );
    expect(getCoursePlaylistsForModule("m0-foundation")[0]?.slug).toBe("bash-scripting");
  });

  it("builds a YouTube playlist URL", () => {
    expect(youtubePlaylistUrl("PLw6kwOJVj3MbMZ8B72ZgUryj8OSETC0ds")).toContain(
      "list=PLw6kwOJVj3MbMZ8B72ZgUryj8OSETC0ds",
    );
  });
});
