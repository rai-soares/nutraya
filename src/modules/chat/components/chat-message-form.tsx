"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type ChatMessageFormValues = {
  text: string;
};

export type ChatMessageFormSubmitValues =
  | {
      messageType: "TEXT";
      text: string;
    }
  | {
      messageType: "IMAGE";
      file: File;
      text?: string;
    };

export function ChatMessageForm({
  errorMessage,
  isSubmitting,
  onSubmit,
}: {
  errorMessage?: string | null;
  isSubmitting: boolean;
  onSubmit: (values: ChatMessageFormSubmitValues) => Promise<void>;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<ChatMessageFormValues>({
    defaultValues: {
      text: "",
    },
  });

  const textValue = useWatch({
    control,
    name: "text",
    defaultValue: "",
  });
  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function clearSelectedImage() {
    setSelectedFile(null);
    setPreviewOpen(false);
    setFileInputKey((current) => current + 1);
  }

  function validateSelectedFile(file: File) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      throw new Error("Unsupported image type. Use JPG, JPEG, PNG, or WEBP.");
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new Error("Image file is too large. Maximum size is 5MB.");
    }
  }

  return (
    <Stack
      component="form"
      spacing={2}
      onSubmit={handleSubmit(async (values) => {
        setLocalError(null);

        const trimmedText = values.text.trim();

        if (!selectedFile) {
          await onSubmit({
            messageType: "TEXT",
            text: trimmedText,
          });
          reset({ text: "" });
          return;
        }

        await onSubmit({
          messageType: "IMAGE",
          file: selectedFile,
          text: trimmedText || undefined,
        });
        clearSelectedImage();
        reset({ text: "" });
      })}
    >
      {errorMessage || localError ? (
        <Alert severity="error">{errorMessage ?? localError}</Alert>
      ) : null}

      <input
        key={fileInputKey}
        id="chat-image-upload-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (!file) {
            return;
          }

          try {
            validateSelectedFile(file);
            setSelectedFile(file);
            setLocalError(null);
          } catch (error) {
            clearSelectedImage();
            setLocalError(
              error instanceof Error ? error.message : "Unable to use this image.",
            );
          }
        }}
      />

      {selectedFile && previewUrl ? (
        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Selected image preview</Typography>
          <Box
            sx={{
              position: "relative",
              width: "fit-content",
              maxWidth: "100%",
            }}
          >
            <Box
              component="img"
              src={previewUrl}
              alt="Selected chat upload preview"
              onClick={() => setPreviewOpen(true)}
              sx={{
                width: "100%",
                maxWidth: 280,
                maxHeight: 280,
                objectFit: "cover",
                borderRadius: 2,
                cursor: "pointer",
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            />
            <IconButton
              aria-label="Remove selected image"
              onClick={clearSelectedImage}
              size="small"
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                backgroundColor: "rgba(0,0,0,0.55)",
                color: "common.white",
                "&:hover": {
                  backgroundColor: "rgba(0,0,0,0.72)",
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Stack>
      ) : null}

      <TextField
        label={selectedFile ? "Add a caption (optional)" : "Write a message"}
        placeholder={
          selectedFile ? "Add a caption for this image" : "Type your message here"
        }
        multiline
        minRows={3}
        fullWidth
        error={Boolean(errors.text)}
        helperText={errors.text?.message}
        {...register("text", {
          validate: (value) => {
            if (!selectedFile && value.trim().length === 0) {
              return "Message text is required.";
            }

            if (value.trim().length > 2000) {
              return "Message text is too long.";
            }

            return true;
          },
        })}
      />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Button
          type="button"
          variant="outlined"
          startIcon={<ImageIcon />}
          disabled={isSubmitting}
          onClick={() =>
            document.getElementById("chat-image-upload-input")?.click()
          }
          sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
        >
          {selectedFile ? "Change image" : "Select image"}
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={
            isSubmitting || (!selectedFile && (textValue ?? "").trim().length === 0)
          }
          sx={{ alignSelf: { xs: "stretch", sm: "flex-end" } }}
        >
          {isSubmitting
            ? selectedFile
              ? "Uploading image..."
              : "Sending..."
            : selectedFile
              ? "Send image"
              : "Send message"}
        </Button>
      </Stack>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 1.5 }}>
          {previewUrl ? (
            <Box
              component="img"
              src={previewUrl}
              alt="Selected chat upload preview enlarged"
              sx={{
                width: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: 2,
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
