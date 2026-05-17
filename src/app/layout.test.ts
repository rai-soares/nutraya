import { beforeEach, describe, expect, it, vi } from "vitest";

import { BRAND } from "@/config/branding";

const { GeistMock, GeistMonoMock } = vi.hoisted(() => ({
  GeistMock: vi.fn(() => ({ variable: "--font-geist-sans" })),
  GeistMonoMock: vi.fn(() => ({ variable: "--font-geist-mono" })),
}));

vi.mock("next/font/google", () => ({
  Geist: GeistMock,
  Geist_Mono: GeistMonoMock,
}));

describe("layout metadata", () => {
  beforeEach(() => {
    GeistMock.mockClear();
    GeistMonoMock.mockClear();
  });

  it("uses the centralized brand metadata and icon", async () => {
    const { metadata } = await import("@/app/layout");

    expect(metadata.applicationName).toBe(BRAND.name);
    expect(metadata.description).toBe(BRAND.description);
    expect(metadata.icons).toMatchObject({
      icon: BRAND.assets.favicon,
      shortcut: BRAND.assets.favicon,
      apple: BRAND.assets.favicon,
    });
    expect(metadata.title).toMatchObject({
      default: BRAND.name,
      template: `%s | ${BRAND.name}`,
    });
  });
});
