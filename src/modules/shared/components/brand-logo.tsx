"use client";

import Link from "next/link";
import { Box, type SxProps, type Theme } from "@mui/material";

import { BRAND, type BrandLogoVariant } from "@/config/branding";

type RenderableLogoVariant = Exclude<BrandLogoVariant, "favicon">;
type LogoVariant = Exclude<RenderableLogoVariant, "tagline">;

type BrandLogoProps = {
  variant?: LogoVariant;
  size?: number | string;
  width?: number | string;
  height?: number | string;
  clickable?: boolean;
  href?: string;
  alt?: string;
  decorative?: boolean;
  showTagline?: boolean;
  sx?: SxProps<Theme>;
  className?: string;
};

const defaultHeights: Record<RenderableLogoVariant, number> = {
  icon: 48,
  horizontal: 34,
  full: 56,
  tagline: 72,
};

function getResolvedVariant(
  variant: LogoVariant,
  showTagline: boolean | undefined,
): RenderableLogoVariant {
  if (showTagline && variant === "full") {
    return "tagline";
  }

  return variant;
}

function getLogoAlt(variant: RenderableLogoVariant) {
  if (variant === "icon") {
    return `${BRAND.name} icon`;
  }

  if (variant === "tagline") {
    return `${BRAND.name} logo with tagline`;
  }

  return `${BRAND.name} logo`;
}

function getDimensions({
  variant,
  size,
  width,
  height,
}: {
  variant: RenderableLogoVariant;
  size?: number | string;
  width?: number | string;
  height?: number | string;
}) {
  if (width || height) {
    return {
      width,
      height,
    };
  }

  if (variant === "icon") {
    return {
      width: size ?? defaultHeights.icon,
      height: size ?? defaultHeights.icon,
    };
  }

  return {
    width: "auto",
    height: size ?? defaultHeights[variant],
  };
}

export function BrandLogo({
  variant = "horizontal",
  size,
  width,
  height,
  clickable = false,
  href = "/",
  alt,
  decorative = false,
  showTagline = false,
  sx,
  className,
}: BrandLogoProps) {
  const resolvedVariant = getResolvedVariant(variant, showTagline);
  const dimensions = getDimensions({
    variant: resolvedVariant,
    size,
    width,
    height,
  });

  const image = (
    <Box
      component="img"
      src={BRAND.assets[resolvedVariant]}
      alt={decorative ? "" : (alt ?? getLogoAlt(resolvedVariant))}
      aria-hidden={decorative ? true : undefined}
      className={className}
      sx={{
        display: "block",
        width: dimensions.width,
        height: dimensions.height,
        maxWidth: "100%",
        objectFit: "contain",
        flexShrink: 0,
        ...sx,
      }}
    />
  );

  if (!clickable) {
    return image;
  }

  return (
    <Box
      component={Link}
      href={href}
      aria-label={alt ?? `${BRAND.name} home`}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        maxWidth: "100%",
      }}
    >
      {image}
    </Box>
  );
}

export function BrandLogoIcon(props: Omit<BrandLogoProps, "variant">) {
  return <BrandLogo variant="icon" {...props} />;
}

export function BrandLogoFull(props: Omit<BrandLogoProps, "variant" | "showTagline">) {
  return <BrandLogo variant="full" {...props} />;
}

export function BrandLogoTagline(
  props: Omit<BrandLogoProps, "variant" | "showTagline">,
) {
  return <BrandLogo variant="full" showTagline {...props} />;
}
