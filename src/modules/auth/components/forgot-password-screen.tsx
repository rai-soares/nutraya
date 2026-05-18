"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
import { requestPasswordReset } from "@/modules/auth/auth.api";
import { FORGOT_PASSWORD_MESSAGE } from "@/modules/auth/password-reset.types";
import { BrandLogoTagline } from "@/modules/shared/components/brand-logo";

type ForgotPasswordFormValues = {
  email: string;
};

export function ForgotPasswordScreen() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: "",
    },
  });

  return (
    <Box className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <Box className="w-full max-w-md">
        <AppCard>
          <Stack spacing={3}>
            <div>
              <BrandLogoTagline size={40} clickable href="/" alt="Nutraya" />
              <Typography variant="h2" sx={{ mt: 1 }}>
                Esqueci minha senha
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Informe seu e-mail para receber o link de redefinição de senha.
              </Typography>
            </div>

            <Stack
              component="form"
              spacing={2}
              onSubmit={handleSubmit(async (values) => {
                setSubmitError(null);

                try {
                  const response = await requestPasswordReset(values.email);
                  setSuccessMessage(response.message);
                } catch {
                  setSubmitError(
                    "Não foi possível solicitar a redefinição de senha. Tente novamente.",
                  );
                }
              })}
            >
              {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}
              {submitError ? <Alert severity="error">{submitError}</Alert> : null}

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

              <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar instruções"}
              </Button>
            </Stack>

            <Typography color="text.secondary" variant="body2" sx={{ alignSelf: "center" }}>
              Lembrou sua senha?{" "}
              <Typography component={Link} href="/login" color="primary.main" sx={{ fontWeight: 700 }}>
                Voltar para entrar
              </Typography>
            </Typography>
          </Stack>
        </AppCard>
      </Box>
    </Box>
  );
}

export { FORGOT_PASSWORD_MESSAGE };
