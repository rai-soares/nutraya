"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert, Button, DialogActions, Grid, Stack, TextField } from "@mui/material";

import type { Meal } from "@/modules/shared/types/api";

export type MealFormValues = {
  name: string;
  description: string;
  scheduledTime: string;
  order: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

function getDefaultValues(meal?: Meal | null): MealFormValues {
  return {
    name: meal?.name ?? "",
    description: meal?.description ?? "",
    scheduledTime: meal?.scheduledTime ?? "",
    order: meal?.order ?? 0,
    calories: meal?.calories ?? 0,
    protein: meal?.protein ?? 0,
    carbs: meal?.carbs ?? 0,
    fat: meal?.fat ?? 0,
  };
}

export function MealForm({
  errorMessage,
  isSubmitting,
  meal,
  onCancel,
  onSubmit,
}: {
  errorMessage?: string | null;
  isSubmitting: boolean;
  meal?: Meal | null;
  onCancel?: () => void;
  onSubmit: (values: MealFormValues) => Promise<void>;
}) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<MealFormValues>({
    defaultValues: getDefaultValues(meal),
  });

  useEffect(() => {
    reset(getDefaultValues(meal));
  }, [meal, reset]);

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <TextField
        label="Meal name"
        error={Boolean(errors.name)}
        helperText={errors.name?.message}
        {...register("name", {
          required: "Meal name is required.",
        })}
      />

      <TextField label="Description" multiline minRows={3} {...register("description")} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Scheduled time"
            type="time"
            fullWidth
            slotProps={{
              inputLabel: {
                shrink: true,
              },
            }}
            error={Boolean(errors.scheduledTime)}
            helperText={errors.scheduledTime?.message ?? "Optional"}
            {...register("scheduledTime", {
              pattern: {
                value: /^$|^([01]\d|2[0-3]):[0-5]\d$/,
                message: "Scheduled time must be in HH:MM format.",
              },
            })}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Order"
            type="number"
            fullWidth
            error={Boolean(errors.order)}
            helperText={errors.order?.message}
            {...register("order", {
              required: "Order is required.",
              min: {
                value: 0,
                message: "Order must be non-negative.",
              },
              valueAsNumber: true,
            })}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {[
          { field: "calories", label: "Calories" },
          { field: "protein", label: "Protein" },
          { field: "carbs", label: "Carbs" },
          { field: "fat", label: "Fat" },
        ].map((item) => (
          <Grid key={item.field} size={{ xs: 12, sm: 6 }}>
            <TextField
              label={item.label}
              type="number"
              fullWidth
              error={Boolean(errors[item.field as keyof MealFormValues])}
              helperText={errors[item.field as keyof MealFormValues]?.message}
              {...register(item.field as keyof MealFormValues, {
                required: `${item.label} is required.`,
                min: {
                  value: 0,
                  message: `${item.label} must be non-negative.`,
                },
                valueAsNumber: true,
              })}
            />
          </Grid>
        ))}
      </Grid>

      <DialogActions sx={{ px: 0 }}>
        {onCancel ? (
          <Button onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : meal ? "Update meal" : "Create meal"}
        </Button>
      </DialogActions>
    </Stack>
  );
}
