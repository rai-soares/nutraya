"use client";

import { Box } from "@mui/material";

import { AppHeader } from "@/modules/app-shell/components/app-header";
import { AppShell } from "@/modules/app-shell/components/app-shell";
import type { UserRole } from "@/modules/shared/types/api";

export function AppLayout({
  role,
  title,
  children,
}: {
  role: UserRole;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <AppHeader role={role} title={title} />
      <Box component="main">{children}</Box>
    </AppShell>
  );
}
