import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { BRAND } from "@/config/branding";
import { AppProviders } from "@/modules/app-shell/providers/app-providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: BRAND.name,
    template: `%s | ${BRAND.name}`,
  },
  applicationName: BRAND.name,
  description: BRAND.description,
  icons: {
    icon: BRAND.assets.favicon,
    shortcut: BRAND.assets.favicon,
    apple: BRAND.assets.favicon,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
