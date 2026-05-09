"use client";

import { Alert, Divider, Stack, Typography } from "@mui/material";

import { MetricPill } from "@/modules/app-shell/components/metric-pill";
import { SectionCard } from "@/modules/app-shell/components/section-card";
import { StatusChip } from "@/modules/app-shell/components/status-chip";
import type { MealSubstitution } from "@/modules/shared/types/api";
import { formatFriendlyDate } from "@/modules/shared/utils/date";
import { AI_ESTIMATION_DISCLAIMER } from "@/modules/shared/utils/pt-br";

export function hasMealSubstitutionEstimation(substitution: MealSubstitution) {
  return Boolean(
    substitution.estimatedAt &&
      substitution.estimatedCalories !== null &&
      substitution.estimatedProtein !== null &&
      substitution.estimatedCarbs !== null &&
      substitution.estimatedFat !== null &&
      substitution.confidence &&
      substitution.aiNotes,
  );
}

export function MealSubstitutionEstimationPanel({
  substitution,
  errorMessage = null,
}: {
  substitution: MealSubstitution;
  errorMessage?: string | null;
}) {
  const estimationAvailable = hasMealSubstitutionEstimation(substitution);

  return (
    <Stack spacing={1.5}>
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {estimationAvailable ? (
        <>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
            <MetricPill label={`${substitution.estimatedCalories} kcal`} tone="default" />
            <MetricPill label={`${substitution.estimatedProtein}g proteína`} tone="primary" />
            <MetricPill label={`${substitution.estimatedCarbs}g carboidratos`} tone="default" />
            <MetricPill label={`${substitution.estimatedFat}g gorduras`} tone="warning" />
            <StatusChip type="confidence" value={substitution.confidence!} />
          </Stack>

          <SectionCard title="Alimentos identificados" variant="outlined">
            <Typography color="text.secondary">
              {substitution.estimatedFoods?.length
                ? substitution.estimatedFoods.join(", ")
                : "Nenhum alimento identificado com confiança suficiente."}
            </Typography>
          </SectionCard>

          <SectionCard title="Estimativa de porção" variant="outlined">
            <Typography color="text.secondary">
              {substitution.portionEstimate || "Nenhuma estimativa de porção disponível."}
            </Typography>
          </SectionCard>

          <Alert severity="info">{AI_ESTIMATION_DISCLAIMER}</Alert>

          <Divider />

          <div>
            <Typography variant="subtitle2">Aplicação no progresso</Typography>
            <Typography color="text.secondary">
              {substitution.appliedToDailyLog
                ? `Aplicado ao progresso do paciente em ${formatFriendlyDate(
                    substitution.applicationDate ?? "",
                  )}.`
                : "Ainda não aplicado ao progresso do paciente."}
            </Typography>
          </div>
        </>
      ) : (
        <Alert severity="info">
          A estimativa ainda não está disponível para esta solicitação. O progresso diário não é atualizado automaticamente a partir deste resultado.
        </Alert>
      )}
    </Stack>
  );
}
