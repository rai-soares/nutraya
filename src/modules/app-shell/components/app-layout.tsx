"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import {
  AppBar,
  Box,
  Button,
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
    { href: "/patient", label: "Home" },
    { href: "/patient/chat", label: "Chat" },
  ],
  NUTRI: [
    { href: "/nutritionist/patients", label: "Patients" },
    { href: "/nutritionist/substitutions", label: "Substitutions" },
    { href: "/nutritionist/chat", label: "Chat" },
  ],
};

export function AppLayout({
  role,
  title,
  children,
}: {
  role: UserRole;
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { signOut, session } = useAuth();

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
          backdropFilter: "blur(16px)",
          backgroundColor: "rgba(243, 247, 251, 0.86)",
        }}
      >
        <Toolbar sx={{ gap: 2, minHeight: 72 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexGrow: 1 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "16px",
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg, rgba(37,99,235,1) 0%, rgba(15,118,110,1) 100%)",
                color: "white",
              }}
            >
              <RestaurantRoundedIcon fontSize="small" />
            </Box>
            <div>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Nutraya
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
            </div>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ display: { xs: "none", sm: "flex" } }}>
            {navItemsByRole[role].map((item) => (
              <Button
                key={item.href}
                component={Link}
                href={item.href}
                color="inherit"
                variant="text"
              >
                {item.label}
              </Button>
            ))}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              {session?.user.name}
            </Typography>
            <IconButton
              aria-label="Sign out"
              onClick={() => {
                signOut();
                router.replace("/login");
              }}
            >
              <LogoutRoundedIcon />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>

      <main>{children}</main>
    </Box>
  );
}
