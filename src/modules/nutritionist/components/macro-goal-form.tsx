"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert, Button, Grid, Stack, TextField } from "@mui/material";

import type { MacroGoal } from "@/modules/shared/types/api";

export type MacroGoalFormValues = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

function getDefaultValues(goal?: MacroGoal | null): MacroGoalFormValues {
  return {
    calories: goal?.calories ?? 0,
    protein: goal?.protein ?? 0,
    carbs: goal?.carbs ?? 0,
    fat: goal?.fat ?? 0,
  };
}

export function MacroGoalForm({
  errorMessage,
  goal,
  isSubmitting,
  onSubmit,
}: {
  errorMessage?: string | null;
  goal?: MacroGoal | null;
  isSubmitting: boolean;
  onSubmit: (values: MacroGoalFormValues) => Promise<void>;
}) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<MacroGoalFormValues>({
    defaultValues: getDefaultValues(goal),
  });

  useEffect(() => {
    reset(getDefaultValues(goal));
  }, [goal, reset]);

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Grid container spacing={2}>
        {[
          { field: "calories", label: "Calorias", unit: "kcal" },
          { field: "protein", label: "Proteína", unit: "g" },
          { field: "carbs", label: "Carboidratos", unit: "g" },
          { field: "fat", label: "Gorduras", unit: "g" },
        ].map((item) => (
          <Grid key={item.field} size={{ xs: 12, sm: 6 }}>
            <TextField
              label={`${item.label} (${item.unit})`}
              type="number"
              fullWidth
              error={Boolean(errors[item.field as keyof MacroGoalFormValues])}
              helperText={errors[item.field as keyof MacroGoalFormValues]?.message}
              {...register(item.field as keyof MacroGoalFormValues, {
                required: "Campo obrigatório",
                min: {
                  value: 0,
                  message: "Deve ser maior ou igual a 0",
                },
                valueAsNumber: true,
              })}
            />
          </Grid>
        ))}
      </Grid>

      <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ alignSelf: "flex-start" }}>
        {isSubmitting ? "Salvando..." : goal ? "Salvar metas de macros" : "Criar metas de macros"}
      </Button>
    </Stack>
  );
}
