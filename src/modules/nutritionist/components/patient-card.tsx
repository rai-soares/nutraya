"use client";

import Link from "next/link";
import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { Button, Stack, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
import { MetricPill } from "@/modules/app-shell/components/metric-pill";
import type { NutritionistPatient } from "@/modules/shared/types/api";

export function PatientCard({ patient }: { patient: NutritionistPatient }) {
  return (
    <AppCard sx={{ height: "100%" }}>
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Stack
            sx={{
              width: 52,
              height: 52,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(18, 116, 107, 0.12)",
              color: "primary.main",
            }}
          >
            <PersonRoundedIcon />
          </Stack>
          <div>
            <Typography variant="h3">{patient.patient.name}</Typography>
            <Typography color="text.secondary">{patient.patient.email}</Typography>
          </div>
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          <MetricPill label="Paciente vinculado" tone="primary" />
        </Stack>

        <Button
          component={Link}
          href={`/nutritionist/patients/${patient.userId}`}
          variant="contained"
          aria-label="Ver paciente"
          endIcon={<ArrowOutwardRoundedIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          Abrir paciente
        </Button>
      </Stack>
    </AppCard>
  );
}
