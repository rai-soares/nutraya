"use client";

import Link from "next/link";
import { Box, Button, Stack, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
import { getLoginPath } from "@/modules/auth/auth-storage";

const entryOptions = [
  {
    title: "Sou paciente",
    description:
      "Entre para acompanhar suas metas, registrar refeicoes e conversar com sua nutricionista.",
    cta: "Entrar como paciente",
    href: getLoginPath("PATIENT"),
  },
  {
    title: "Sou nutricionista",
    description:
      "Acesse seu painel para acompanhar pacientes, ajustar planos alimentares e revisar substituicoes.",
    cta: "Entrar como nutricionista",
    href: getLoginPath("NUTRI"),
  },
] as const;

export function RoleEntryScreen() {
  return (
    <Box className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <Box className="w-full max-w-5xl">
        <Stack spacing={3}>
          <Stack spacing={1.5} className="max-w-2xl">
            <Typography variant="overline" color="primary.main">
              Nutraya
            </Typography>
            <Typography variant="h1">Seu acesso comeca por aqui.</Typography>
            <Typography color="text.secondary">
              Escolha como deseja entrar para continuar com um fluxo pensado para sua rotina.
            </Typography>
          </Stack>

          <Box className="grid gap-4 md:grid-cols-2">
            {entryOptions.map((option) => (
              <AppCard key={option.title} className="h-full">
                <Stack spacing={3} className="h-full">
                  <div>
                    <Typography variant="h2">{option.title}</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      {option.description}
                    </Typography>
                  </div>

                  <Box className="mt-auto">
                    <Button
                      component={Link}
                      href={option.href}
                      variant="contained"
                      size="large"
                      fullWidth
                    >
                      {option.cta}
                    </Button>
                  </Box>
                </Stack>
              </AppCard>
            ))}
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}
