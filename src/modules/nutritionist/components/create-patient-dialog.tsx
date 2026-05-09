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
      <DialogTitle>Create or link patient</DialogTitle>
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
              label="Patient name"
              error={Boolean(errors.name)}
              helperText={errors.name?.message}
              {...register("name", {
                required: "Name is required.",
              })}
            />

            <TextField
              label="Email"
              type="email"
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
              label="Temporary password"
              error={Boolean(errors.password)}
              helperText={errors.password?.message ?? "Share this with the patient for first access."}
              {...register("password", {
                required: "Temporary password is required.",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters.",
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
              Generate password
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save patient"}
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
}

export type { CreatePatientValues };
