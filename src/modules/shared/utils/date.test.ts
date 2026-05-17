import { describe, expect, it } from "vitest";

import {
  getTodayIsoDate,
  isValidIsoDate,
  resolveSelectableIsoDate,
} from "@/modules/shared/utils/date";

describe("date utils", () => {
  it("returns a valid ISO date for today", () => {
    expect(isValidIsoDate(getTodayIsoDate())).toBe(true);
  });

  it("accepts a valid past ISO date", () => {
    expect(resolveSelectableIsoDate("2026-05-09", "2026-05-17")).toBe("2026-05-09");
  });

  it("falls back to today for an invalid ISO date", () => {
    expect(resolveSelectableIsoDate("09-05-2026", "2026-05-17")).toBe("2026-05-17");
  });

  it("clamps future dates to today", () => {
    expect(resolveSelectableIsoDate("2026-05-18", "2026-05-17")).toBe("2026-05-17");
  });

  it("falls back to today when the date is missing", () => {
    expect(resolveSelectableIsoDate(null, "2026-05-17")).toBe("2026-05-17");
  });
});
