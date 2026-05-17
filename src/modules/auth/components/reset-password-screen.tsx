"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
import { submitPasswordReset } from "@/modules/auth/auth.api";
import { BrandLogoTagline } from "@/modules/shared/components/brand-logo";

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

const INVALID_LINK_MESSAGE =
  "Link inválido ou expirado. Solicite uma nova redefinição de senha.";

export function ResetPasswordScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const token = searchParams.get("token")?.trim() ?? "";
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const password = useWatch({
    control,
    name: "password",
  });

  return (
    <Box className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <Box className="w-full max-w-md">
        <AppCard>
          <Stack spacing={3}>
            <div>
              <BrandLogoTagline size={40} clickable href="/" alt="Nutraya" />
              <Typography variant="h2" sx={{ mt: 1 }}>
                Redefinir senha
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Defina uma nova senha para continuar acessando sua conta.
              </Typography>
            </div>

            {!token ? <Alert severity="error">{INVALID_LINK_MESSAGE}</Alert> : null}

            <Stack
              component="form"
              spacing={2}
              onSubmit={handleSubmit(async (values) => {
                setSubmitError(null);

                if (!token) {
                  setSubmitError(INVALID_LINK_MESSAGE);
                  return;
                }

                try {
                  await submitPasswordReset(token, values.password);
                  router.replace("/");
                } catch {
                  setSubmitError(INVALID_LINK_MESSAGE);
                }
              })}
            >
              {submitError ? <Alert severity="error">{submitError}</Alert> : null}

              <TextField
                label="Nova senha"
                type="password"
                autoComplete="new-password"
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

              <TextField
                label="Confirmar senha"
                type="password"
                autoComplete="new-password"
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: "Campo obrigatório",
                  validate: (value) => value === password || "As senhas não coincidem",
                })}
              />

              <Button type="submit" variant="contained" size="large" disabled={isSubmitting || !token}>
                {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
              </Button>
            </Stack>

            <Typography color="text.secondary" variant="body2">
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
