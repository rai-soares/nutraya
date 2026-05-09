"use client";

import {
  Alert,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import type { MealSubstitution } from "@/modules/shared/types/api";

function hasEstimation(substitution: MealSubstitution) {
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
  const estimationAvailable = hasEstimation(substitution);

  return (
    <Stack spacing={1.5}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <div>
          <Typography variant="subtitle2">AI macro estimate</Typography>
          <Typography color="text.secondary">
            Approximate estimate from the visible meal photo only.
          </Typography>
        </div>
      </Stack>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {estimationAvailable ? (
        <>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
            <Chip label={`${substitution.estimatedCalories} kcal`} size="small" />
            <Chip label={`${substitution.estimatedProtein}g protein`} size="small" />
            <Chip label={`${substitution.estimatedCarbs}g carbs`} size="small" />
            <Chip label={`${substitution.estimatedFat}g fat`} size="small" />
            <Chip
              label={`Confidence ${substitution.confidence?.toLowerCase()}`}
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
            <Typography variant="subtitle2">Identified foods</Typography>
            <Typography color="text.secondary">
              {substitution.estimatedFoods?.length
                ? substitution.estimatedFoods.join(", ")
                : "No foods confidently identified."}
            </Typography>
          </div>

          <div>
            <Typography variant="subtitle2">Portion estimate</Typography>
            <Typography color="text.secondary">
              {substitution.portionEstimate || "No portion estimate available."}
            </Typography>
          </div>

          <Alert severity="info">{substitution.aiNotes}</Alert>
        </>
      ) : (
        <Alert severity="info">
          The estimate is still unavailable for this request. Daily progress is not
          updated automatically from this result.
        </Alert>
      )}
    </Stack>
  );
}
