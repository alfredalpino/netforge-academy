import { describe, expect, it } from "vitest";
import { parseStoredProgress, validateProgressImport } from "./progress-schema";
import { DEFAULT_PROGRESS } from "./types";

describe("progress schema", () => {
  it("falls back to defaults for invalid JSON", () => {
    expect(parseStoredProgress("{bad json")).toEqual(DEFAULT_PROGRESS);
  });

  it("merges valid stored progress", () => {
    const stored = JSON.stringify({
      ...DEFAULT_PROGRESS,
      currentWeek: 2,
      streak: 3,
    });
    const parsed = parseStoredProgress(stored);
    expect(parsed.currentWeek).toBe(2);
    expect(parsed.streak).toBe(3);
    expect(parsed.focusChecklists).toEqual({});
  });

  it("rejects invalid import payloads", () => {
    const result = validateProgressImport({ currentWeek: 99 });
    expect(result.success).toBe(false);
  });
});
