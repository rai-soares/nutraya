"use client";

import {
  Alert,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import type { MealSubstitution } from "@/modules/shared/types/api";
import { formatFriendlyDate } from "@/modules/shared/utils/date";
import {
  AI_ESTIMATION_DISCLAIMER,
  getConfidenceLabel,
} from "@/modules/shared/utils/pt-br";

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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <div>
          <Typography variant="subtitle2">Macros estimados</Typography>
          <Typography color="text.secondary">
            Estimativa aproximada com base apenas no que aparece na imagem.
          </Typography>
        </div>
      </Stack>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {estimationAvailable ? (
        <>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
            <Chip label={`${substitution.estimatedCalories} kcal`} size="small" />
            <Chip label={`${substitution.estimatedProtein}g proteína`} size="small" />
            <Chip label={`${substitution.estimatedCarbs}g carboidratos`} size="small" />
            <Chip label={`${substitution.estimatedFat}g gorduras`} size="small" />
            <Chip
              label={`Confiança ${getConfidenceLabel(substitution.confidence)}`}
              size="small"
              color={
                substitution.confidence === "HIGH"
                  ? "success"
                  : substitution.confidence === "MEDIUM"
                    ? "warning"
                    : "default"
              }
              variant={substitution.confidence === "LOW" ? "outlined" : "filled"}
            />
          </Stack>

          <Divider />

          <div>
            <Typography variant="subtitle2">Alimentos identificados</Typography>
            <Typography color="text.secondary">
              {substitution.estimatedFoods?.length
                ? substitution.estimatedFoods.join(", ")
                : "Nenhum alimento identificado com confiança."}
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2">Estimativa de porção</Typography>
            <Typography color="text.secondary">
              {substitution.portionEstimate || "Nenhuma estimativa de porção disponível."}
            </Typography>
          </div>

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
