"use client";

import { useForm } from "react-hook-form";
import {
  Alert,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
} from "@mui/material";

export type MealPlanFormValues = {
  title: string;
  description: string;
  isActive: boolean;
};

export function MealPlanForm({
  errorMessage,
  isSubmitting,
  onSubmit,
}: {
  errorMessage?: string | null;
  isSubmitting: boolean;
  onSubmit: (values: MealPlanFormValues) => Promise<void>;
}) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<MealPlanFormValues>({
    defaultValues: {
      title: "",
      description: "",
      isActive: false,
    },
  });

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
        reset({
          title: "",
          description: "",
          isActive: false,
        });
      })}
    >
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <TextField
        label="Plan title"
        error={Boolean(errors.title)}
        helperText={errors.title?.message}
        {...register("title", {
          required: "Title is required.",
        })}
      />

      <TextField
        label="Description"
        multiline
        minRows={3}
        {...register("description")}
      />

      <FormControlLabel
        control={<Checkbox {...register("isActive")} />}
        label="Make active now"
      />

      <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ alignSelf: "flex-start" }}>
        {isSubmitting ? "Saving..." : "Create meal plan"}
      </Button>
    </Stack>
  );
}
