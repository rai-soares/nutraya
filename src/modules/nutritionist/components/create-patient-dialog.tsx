"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

type CreatePatientValues = {
  name: string;
  email: string;
  password: string;
};

function generateTemporaryPassword() {
  return Math.random().toString(36).slice(-10);
}

export function CreatePatientDialog({
  errorMessage,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: {
  errorMessage?: string | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: CreatePatientValues) => Promise<void>;
}) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<CreatePatientValues>({
    defaultValues: {
      name: "",
      email: "",
      password: generateTemporaryPassword(),
    },
  });

  useEffect(() => {
    if (!isOpen) {
      reset({
        name: "",
        email: "",
        password: generateTemporaryPassword(),
      });
    }
  }, [isOpen, reset]);

  return (
    <Dialog open={isOpen} onClose={isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Criar paciente</DialogTitle>
      <Stack
        component="form"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
        })}
      >
        <DialogContent>
          <Stack spacing={2}>
            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

            <TextField
              label="Nome do paciente"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register("name", {
                required: "Campo obrigatório",
              })}
            />

            <TextField
              label="E-mail"
              type="email"
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register("email", {
                required: "Campo obrigatório",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "E-mail inválido",
                },
              })}
            />

            <TextField
              label="Senha temporária"
              error={Boolean(errors.password)}
              helperText={errors.password?.message ?? "Compartilhe esta senha com o paciente para o primeiro acesso."}
              {...register("password", {
                required: "Campo obrigatório",
                minLength: {
                  value: 6,
                  message: "A senha deve ter pelo menos 6 caracteres",
                },
              })}
            />

            <Button
              variant="text"
              onClick={() => {
                setValue("password", generateTemporaryPassword(), {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              sx={{ alignSelf: "flex-start" }}
            >
              Gerar senha
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar paciente"}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}

export type { CreatePatientValues };
