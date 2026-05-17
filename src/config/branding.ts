export const BRAND = {
  name: "Nutraya",
  tagline: "Nutrição que transforma",
  description: "Acompanhamento nutricional para pacientes e nutricionistas.",
  assets: {
    favicon: "/branding/nutraya-favicon.ico",
    icon: "/branding/nutraya-logo-icon.png",
    horizontal: "/branding/nutraya-logo-horizontal.png",
    full: "/branding/nutraya-logo-full.png",
    tagline: "/branding/nutraya-logo-tagline.png",
  },
} as const;

export type BrandLogoVariant = keyof typeof BRAND.assets;
