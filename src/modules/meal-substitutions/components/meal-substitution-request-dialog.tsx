"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import CloseIcon from "@mui/icons-material/Close";
import ImageIcon from "@mui/icons-material/Image";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type MealSubstitutionRequestDialogValues = {
  note: string;
};

export type MealSubstitutionRequestSubmitValues = {
  file: File;
  note?: string;
};

export function MealSubstitutionRequestDialog({
  mealName,
  open,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: {
  mealName: string;
  open: boolean;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (values: MealSubstitutionRequestSubmitValues) => Promise<void>;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<MealSubstitutionRequestDialogValues>({
    defaultValues: {
      note: "",
    },
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

  function resetDialogState() {
    clearSelectedImage();
    setLocalError(null);
    reset({ note: "" });
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
    <Dialog
      open={open}
      onClose={isSubmitting ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Request substitution for {mealName}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          spacing={2}
          sx={{ pt: 1 }}
          onSubmit={handleSubmit(async (values) => {
            if (!selectedFile) {
              setLocalError("Select an image before sending the request.");
              return;
            }

            await onSubmit({
              file: selectedFile,
              note: values.note.trim() || undefined,
            });
            resetDialogState();
          })}
        >
          {errorMessage || localError ? (
            <Alert severity="error">{errorMessage ?? localError}</Alert>
          ) : null}

          <input
            key={fileInputKey}
            id="meal-substitution-image-upload-input"
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

          <Typography color="text.secondary">
            Send a meal photo and an optional note so your nutritionist can review a substitution request.
          </Typography>

          <Button
            type="button"
            variant="outlined"
            startIcon={<ImageIcon />}
            disabled={isSubmitting}
            onClick={() =>
              document
                .getElementById("meal-substitution-image-upload-input")
                ?.click()
            }
            sx={{ alignSelf: "flex-start" }}
          >
            {selectedFile ? "Change image" : "Select image"}
          </Button>

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
                  alt="Selected substitution request preview"
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
            label="Note (optional)"
            placeholder="Example: I do not have this meal available today."
            multiline
            minRows={3}
            fullWidth
            error={Boolean(errors.note)}
            helperText={errors.note?.message}
            {...register("note", {
              validate: (value) => {
                if (value.trim().length > 1000) {
                  return "Note is too long.";
                }

                return true;
              },
            })}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              type="button"
              variant="text"
              disabled={isSubmitting}
              onClick={() => {
                resetDialogState();
                onClose();
              }}
              sx={{ order: { xs: 2, sm: 1 } }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting || !selectedFile}
              sx={{ order: { xs: 1, sm: 2 } }}
            >
              {isSubmitting ? "Sending request..." : "Submit request"}
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
                  alt="Selected substitution request preview enlarged"
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
      </DialogContent>
    </Dialog>
  );
}
