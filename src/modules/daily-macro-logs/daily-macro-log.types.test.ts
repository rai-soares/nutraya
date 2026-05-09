import { describe, expect, it } from "vitest";

import {
  dailyMacroLogDateQuerySchema,
  upsertTodayDailyMacroLogSchema,
} from "@/modules/daily-macro-logs/daily-macro-log.types";

describe("daily macro log types", () => {
  it("accepts a valid upsert payload", () => {
    const result = upsertTodayDailyMacroLogSchema.parse({
      caloriesConsumed: 1200,
      proteinConsumed: 80,
      carbsConsumed: 130,
      fatConsumed: 35,
    });

    expect(result.caloriesConsumed).toBe(1200);
  });

  it("rejects negative consumed macros", () => {
    expect(() =>
      upsertTodayDailyMacroLogSchema.parse({
        caloriesConsumed: -1,
        proteinConsumed: 80,
        carbsConsumed: 130,
        fatConsumed: 35,
      }),
    ).toThrow();
  });

  it("accepts a valid YYYY-MM-DD date query", () => {
    const result = dailyMacroLogDateQuerySchema.parse({
      date: "2026-05-09",
    });

    expect(result.date).toBe("2026-05-09");
  });

  it("rejects invalid date query formats", () => {
    expect(() =>
      dailyMacroLogDateQuerySchema.parse({
        date: "09-05-2026",
      }),
    ).toThrow();
  });
});
