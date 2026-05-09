"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
import type { AuthResponse } from "@/modules/shared/types/api";

type FormMode = "login" | "register";

type FormValues = {
  name: string;
  email: string;
  password: string;
};

export function AuthFormCard({
  mode,
  onSubmit,
}: {
  mode: FormMode;
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
                {isRegister ? "Create your nutritionist account" : "Welcome back"}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {isRegister
                  ? "Public signup is available only for nutritionists. Patients are created from the nutritionist panel."
                  : "Sign in to access your nutrition workflow."}
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
                    message:
                      error instanceof Error ? error.message : "Unable to continue.",
                  });
                }
              })}
            >
              {errors.root?.message ? <Alert severity="error">{errors.root.message}</Alert> : null}

              {isRegister ? (
                <TextField
                  label="Name"
                  autoComplete="name"
                  error={Boolean(errors.name)}
                  helperText={errors.name?.message}
                  {...register("name", {
                    required: "Name is required.",
                  })}
                />
              ) : null}

              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                {...register("email", {
                  required: "Email is required.",
                  pattern: {
                    value: /\S+@\S+\.\S+/,
                    message: "Enter a valid email.",
                  },
                })}
              />

              <TextField
                label="Password"
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                {...register("password", {
                  required: "Password is required.",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters.",
                  },
                })}
              />

              <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                {isSubmitting
                  ? "Please wait..."
                  : isRegister
                    ? "Create nutritionist account"
                    : "Sign in"}
              </Button>
            </Stack>

            <Typography color="text.secondary" variant="body2">
              {isRegister ? "Already have an account?" : "Need an account?"}{" "}
              <Typography
                component={Link}
                href={isRegister ? "/login" : "/register"}
                color="primary.main"
                sx={{ fontWeight: 700 }}
              >
                {isRegister ? "Sign in" : "Register"}
              </Typography>
            </Typography>
          </Stack>
        </AppCard>
      </Box>
    </Box>
  );
}

export type { FormValues as AuthFormValues, AuthResponse };
