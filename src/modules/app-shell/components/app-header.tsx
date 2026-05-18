"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { useAuth } from "@/modules/auth/auth-context";
import { getPatientProfileSummary } from "@/modules/patient-profile/patient-profile.api";
import { BrandLogo, BrandLogoIcon } from "@/modules/shared/components/brand-logo";
import type { UserRole } from "@/modules/shared/types/api";

type NavItem = {
  href: string;
  label: string;
};

const navItemsByRole: Record<UserRole, NavItem[]> = {
  PATIENT: [
    { href: "/patient", label: "Progresso" },
    { href: "/patient/history", label: "Histórico" },
    { href: "/patient/chat", label: "Chat" },
  ],
  NUTRI: [
    { href: "/nutritionist/patients", label: "Pacientes" },
    { href: "/nutritionist/substitutions", label: "Substituições" },
    { href: "/nutritionist/chat", label: "Chat" },
  ],
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeader({
  role,
  title,
}: {
  role: UserRole;
  title: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("sm"));
  const { signOut, session } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [firstName = "Usuário"] = session?.user.name?.split(" ") ?? [];
  const navItems = navItemsByRole[role];
  const patientProfileQuery = useQuery({
    queryKey: ["patient-profile-summary", session?.user.id],
    enabled: role === "PATIENT" && Boolean(session?.token && session?.user.id),
    queryFn: () => getPatientProfileSummary({ token: session?.token ?? "" }),
  });
  const nutritionistName =
    role === "PATIENT" ? patientProfileQuery.data?.nutritionist?.name ?? null : null;

  const navigation = (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={1}
      sx={{ width: { xs: "100%", md: "auto" } }}
    >
      {navItems.map((item) => {
        const active = isActivePath(pathname, item.href);

        return (
          <Button
            key={item.href}
            component={Link}
            href={item.href}
            color="inherit"
            onClick={() => setMobileOpen(false)}
            sx={{
              justifyContent: "flex-start",
              px: 1.75,
              color: active ? "primary.dark" : "text.secondary",
              backgroundColor: active ? "rgba(18, 116, 107, 0.12)" : "transparent",
              "&:hover": {
                backgroundColor: active
                  ? "rgba(18, 116, 107, 0.16)"
                  : "rgba(18, 116, 107, 0.06)",
              },
            }}
          >
            {item.label}
          </Button>
        );
      })}
    </Stack>
  );
  const homeHref = role === "PATIENT" ? "/patient" : "/nutritionist";

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        top: 0,
        borderBottom: "1px solid rgba(18, 116, 107, 0.10)",
        backdropFilter: "blur(18px)",
        backgroundColor: "rgba(250, 247, 242, 0.78)",
      }}
    >
      <Toolbar
        sx={{
          gap: 2,
          minHeight: 80,
          px: { xs: 2, sm: 3.5, lg: 5 },
          py: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexGrow: 1 }}>
          <Stack spacing={0.5}>
            {isCompact ? (
              <BrandLogoIcon size={24} clickable href={homeHref} alt="Nutraya" />
            ) : (
              <BrandLogo
                variant="horizontal"
                size={30}
                clickable
                href={homeHref}
                alt="Nutraya"
              />
            )}
            {!isCompact && (
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
            )}
          </Stack>
        </Stack>

        <Box sx={{ display: { xs: "none", md: "block" } }}>{navigation}</Box>

        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
          <Stack
            direction="row"
            spacing={1.25}
            sx={{
              alignItems: "center",
              px: 1.25,
              py: 0.75,
              borderRadius: 1,
              border: "1px solid rgba(18, 116, 107, 0.10)",
              backgroundColor: "rgba(255,255,255,0.76)",
              display: { xs: "none", sm: "flex" },
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "rgba(18, 116, 107, 0.14)",
                color: "primary.dark",
                fontWeight: 700,
              }}
            >
              {firstName.slice(0, 1).toUpperCase()}
            </Avatar>
            <Stack spacing={0.25} sx={{ lineHeight: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {firstName}
              </Typography>
              {nutritionistName ? (
                <Typography variant="caption" color="text.secondary">
                  <b>Nutricionista:</b> {nutritionistName}
                </Typography>
              ) : null}
            </Stack>
          </Stack>

          <IconButton
            aria-label="Abrir navegação"
            sx={{ display: { xs: "inline-flex", md: "none" } }}
            onClick={() => setMobileOpen(true)}
          >
            <MenuRoundedIcon />
          </IconButton>

          <IconButton
            aria-label="Sair"
            onClick={() => {
              signOut();
              router.replace("/login");
            }}
          >
            <LogoutRoundedIcon />
          </IconButton>
        </Stack>
      </Toolbar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 280,
              p: 2.5,
              backgroundColor: "rgba(250, 247, 242, 0.98)",
            },
          },
        }}
      >
        <Stack spacing={2.5}>
          <Typography variant="h3">Menu</Typography>
          {navigation}
        </Stack>
      </Drawer>
    </AppBar>
  );
}
