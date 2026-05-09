"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
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
} from "@mui/material";

import { useAuth } from "@/modules/auth/auth-context";
import type { UserRole } from "@/modules/shared/types/api";

type NavItem = {
  href: string;
  label: string;
};

const navItemsByRole: Record<UserRole, NavItem[]> = {
  PATIENT: [
    { href: "/patient", label: "Progresso" },
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
  const { signOut, session } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [firstName = "Usuário"] = session?.user.name?.split(" ") ?? [];
  const navItems = navItemsByRole[role];

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
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexGrow: 1 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "18px",
              display: "grid",
              placeItems: "center",
              background:
                "linear-gradient(135deg, rgba(18,116,107,1) 0%, rgba(108,167,196,1) 100%)",
              color: "white",
              boxShadow: "0 12px 22px rgba(18, 116, 107, 0.18)",
            }}
          >
            <RestaurantRoundedIcon fontSize="small" />
          </Box>
          <div>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              Nutraya
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </div>
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
              borderRadius: 999,
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
            <div>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {firstName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {role === "PATIENT" ? "Paciente" : "Nutricionista"}
              </Typography>
            </div>
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
          <Typography variant="h3">Navegação</Typography>
          {navigation}
        </Stack>
      </Drawer>
    </AppBar>
  );
}
