import { describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY } from "./theme";

describe("theme helpers", () => {
  it("exports stable storage key", () => {
    expect(THEME_STORAGE_KEY).toBe("netforge-theme");
  });
});
