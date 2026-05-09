"use client";

import Link from "next/link";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { Button, Chip, Stack, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
import type { NutritionistPatient } from "@/modules/shared/types/api";

export function PatientCard({ patient }: { patient: NutritionistPatient }) {
  return (
    <AppCard>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", sm: "center" } }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <PersonRoundedIcon color="primary" />
            <div>
              <Typography variant="h3">{patient.patient.name}</Typography>
              <Typography color="text.secondary">{patient.patient.email}</Typography>
            </div>
          </Stack>
          <Chip label="Paciente vinculado" color="primary" variant="outlined" />
        </Stack>

        <Button
          component={Link}
          href={`/nutritionist/patients/${patient.userId}`}
          variant="contained"
          endIcon={<ChevronRightRoundedIcon />}
          sx={{ alignSelf: "flex-start" }}
        >
          Ver paciente
        </Button>
      </Stack>
    </AppCard>
  );
}
