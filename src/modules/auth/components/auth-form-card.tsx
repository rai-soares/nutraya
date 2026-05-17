"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
import { getErrorMessage } from "@/modules/shared/utils/pt-br";
import type { AuthResponse } from "@/modules/shared/types/api";

type FormMode = "login" | "register";

type FormValues = {
  name: string;
  email: string;
  password: string;
};

export function AuthFormCard({
  mode,
  showRegisterLink = true,
  onSubmit,
}: {
  mode: FormMode;
  showRegisterLink?: boolean;
  onSubmit: (values: FormValues) => Promise<void>;
}) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const isRegister = mode === "register";

  return (
    <Box className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <Box className="w-full max-w-md">
        <AppCard>
          <Stack spacing={3}>
            <div>
              <Typography variant="overline" color="primary.main">
                Nutraya
              </Typography>
              <Typography variant="h2" sx={{ mt: 1 }}>
                {isRegister ? "Criar conta de nutricionista" : "Entrar"}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {isRegister
                  ? "O cadastro público está disponível apenas para nutricionistas. Pacientes são criados pelo painel do nutricionista."
                  : "Entre para acessar seu acompanhamento nutricional."}
              </Typography>
            </div>

            <Stack
              component="form"
              spacing={2}
              onSubmit={handleSubmit(async (values) => {
                try {
                  await onSubmit(values);
                } catch (error) {
                  setError("root", {
                    message: getErrorMessage(
                      error,
                      "Não foi possível continuar. Tente novamente.",
                    ),
                  });
                }
              })}
            >
              {errors.root?.message ? <Alert severity="error">{errors.root.message}</Alert> : null}

              {isRegister ? (
                <TextField
                  label="Nome"
                  autoComplete="name"
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                  {...register("name", {
                    required: "Campo obrigatório",
                  })}
                />
              ) : null}

              <TextField
                label="E-mail"
                type="email"
                autoComplete="email"
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
                label="Senha"
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                {...register("password", {
                  required: "Campo obrigatório",
                  minLength: {
                    value: 6,
                    message: "A senha deve ter pelo menos 6 caracteres",
                  },
                })}
              />

              <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                {isSubmitting
                  ? isRegister
                    ? "Criando conta..."
                    : "Entrando..."
                  : isRegister
                    ? "Criar conta"
                    : "Entrar"}
              </Button>
            </Stack>

            {isRegister || showRegisterLink ? (
              <Typography color="text.secondary" variant="body2">
                {isRegister ? "Já tem uma conta?" : "Precisa de uma conta?"}{" "}
                <Typography
                  component={Link}
                  href={isRegister ? "/login" : "/register"}
                  color="primary.main"
                  sx={{ fontWeight: 700 }}
                >
                  {isRegister ? "Entrar" : "Criar conta"}
                </Typography>
              </Typography>
            ) : null}
          </Stack>
        </AppCard>
      </Box>
    </Box>
  );
}

export type { FormValues as AuthFormValues, AuthResponse };
