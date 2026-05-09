"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert, Button, Stack, TextField } from "@mui/material";

type ChatMessageFormValues = {
  text: string;
};

export function ChatMessageForm({
  errorMessage,
  isSubmitting,
  onSubmit,
}: {
  errorMessage?: string | null;
  isSubmitting: boolean;
  onSubmit: (values: ChatMessageFormValues) => Promise<void>;
}) {
  const {
    formState: { errors, isSubmitSuccessful },
    handleSubmit,
    register,
    reset,
  } = useForm<ChatMessageFormValues>({
    defaultValues: {
      text: "",
    },
  });

  useEffect(() => {
    if (isSubmitSuccessful && !isSubmitting) {
      reset({ text: "" });
    }
  }, [isSubmitSuccessful, isSubmitting, reset]);

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          text: values.text.trim(),
        });
      })}
    >
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <TextField
        label="Write a message"
        placeholder="Type your message here"
        multiline
        minRows={3}
        fullWidth
        error={Boolean(errors.text)}
        helperText={errors.text?.message}
        {...register("text", {
          required: "Message text is required.",
          validate: (value) =>
            value.trim().length > 0 || "Message text is required.",
          maxLength: {
            value: 2000,
            message: "Message text is too long.",
          },
        })}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        sx={{ alignSelf: "flex-end" }}
      >
        {isSubmitting ? "Sending..." : "Send message"}
      </Button>
    </Stack>
  );
}
