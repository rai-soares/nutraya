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
        label="Título do plano"
        error={Boolean(errors.title)}
        helperText={errors.title?.message}
        {...register("title", {
          required: "Campo obrigatório",
        })}
      />

      <TextField
        label="Descrição"
        multiline
        minRows={3}
        {...register("description")}
      />

      <FormControlLabel
        control={<Checkbox {...register("isActive")} />}
        label="Ativar agora"
      />

      <Button type="submit" variant="contained" disabled={isSubmitting} sx={{ alignSelf: "flex-start" }}>
        {isSubmitting ? "Salvando..." : "Criar plano alimentar"}
      </Button>
    </Stack>
  );
}
