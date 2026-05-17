// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { describe, expect, it } from "vitest";

import { BRAND } from "@/config/branding";
import {
  BrandLogo,
  BrandLogoIcon,
  BrandLogoTagline,
} from "@/modules/shared/components/brand-logo";
import { appTheme } from "@/theme/app-theme";

describe("BrandLogo", () => {
  it("renders the tagline asset for auth and welcome contexts", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <BrandLogoTagline />
      </ThemeProvider>,
    );

    const logo = screen.getByRole("img", { name: /nutraya logo with tagline/i });
    expect(logo).toHaveAttribute("src", BRAND.assets.tagline);
  });

  it("renders the icon-only asset when requested", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <BrandLogoIcon size={40} />
      </ThemeProvider>,
    );

    const logo = screen.getByRole("img", { name: /nutraya icon/i });
    expect(logo).toHaveAttribute("src", BRAND.assets.icon);
    expect(logo).toHaveStyle({
      width: "40px",
      height: "40px",
    });
  });

  it("wraps the logo in a link when clickable", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <BrandLogo clickable href="/patient" alt="Nutraya" />
      </ThemeProvider>,
    );

    expect(screen.getByRole("link", { name: "Nutraya" })).toHaveAttribute("href", "/patient");
  });

  it("supports decorative usage without announcing the image", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <BrandLogo decorative />
      </ThemeProvider>,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
