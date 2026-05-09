"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useAuth } from "@/modules/auth/auth-context";
import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ErrorState } from "@/modules/app-shell/components/error-state";
import { LoadingState } from "@/modules/app-shell/components/loading-state";
import { PageHeader } from "@/modules/app-shell/components/page-header";
import {
  approveNutritionistMealSubstitution,
  listNutritionistMealSubstitutions,
  rejectNutritionistMealSubstitution,
} from "@/modules/meal-substitutions/meal-substitution.api";
import { listNutritionistPatients } from "@/modules/nutritionist/nutritionist.api";
import type {
  MealSubstitution,
  MealSubstitutionStatus,
} from "@/modules/shared/types/api";

const reviewChipColorByStatus: Record<
  MealSubstitutionStatus,
  "warning" | "success" | "error"
> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
};

export function NutritionistSubstitutionRequestsScreen() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.token ?? "";
  const authOptions = { token };
  const [selectedPatientId, setSelectedPatientId] = useState("all");
  const [activeReview, setActiveReview] = useState<{
    substitution: MealSubstitution;
    action: "APPROVE" | "REJECT";
  } | null>(null);
  const [feedback, setFeedback] = useState("");

  const patientsQuery = useQuery({
    queryKey: ["nutritionist-patients", session?.user.id],
    enabled: Boolean(token),
    queryFn: () => listNutritionistPatients(authOptions),
  });

  const substitutionsQuery = useQuery({
    queryKey: [
      "nutritionist-meal-substitutions",
      session?.user.id,
      selectedPatientId,
    ],
    enabled: Boolean(token),
    queryFn: () =>
      listNutritionistMealSubstitutions(
        authOptions,
        selectedPatientId === "all" ? undefined : selectedPatientId,
      ),
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      substitutionId,
      action,
      nutritionistFeedback,
    }: {
      substitutionId: string;
      action: "APPROVE" | "REJECT";
      nutritionistFeedback?: string;
    }) => {
      if (action === "APPROVE") {
        return approveNutritionistMealSubstitution(
          substitutionId,
          { nutritionistFeedback },
          authOptions,
        );
      }

      return rejectNutritionistMealSubstitution(
        substitutionId,
        { nutritionistFeedback },
        authOptions,
      );
    },
    onSuccess: async () => {
      setActiveReview(null);
      setFeedback("");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["nutritionist-meal-substitutions", session?.user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["nutritionist-patient", activeReview?.substitution.patientId],
        }),
      ]);
    },
  });

  const pendingCount = useMemo(
    () =>
      (substitutionsQuery.data ?? []).filter(
        (substitution) => substitution.status === "PENDING",
      ).length,
    [substitutionsQuery.data],
  );

  if (patientsQuery.isLoading || substitutionsQuery.isLoading) {
    return <LoadingState message="Loading substitution requests..." />;
  }

  if (patientsQuery.isError) {
    return (
      <ErrorState
        title="Patients unavailable"
        message={
          patientsQuery.error instanceof Error
            ? patientsQuery.error.message
            : "Unable to load linked patients."
        }
        onRetry={() => void patientsQuery.refetch()}
      />
    );
  }

  if (substitutionsQuery.isError) {
    return (
      <ErrorState
        title="Requests unavailable"
        message={
          substitutionsQuery.error instanceof Error
            ? substitutionsQuery.error.message
            : "Unable to load substitution requests."
        }
        onRetry={() => void substitutionsQuery.refetch()}
      />
    );
  }

  return (
    <>
      <Stack spacing={3}>
        <PageHeader
          title="Substitution requests"
          subtitle="Review patient meal photos and approve or reject each substitution request."
        />

        <AppCard>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between" }}
          >
            <Stack spacing={1}>
              <Typography variant="h3">Review queue</Typography>
              <Typography color="text.secondary">
                Pending requests stay at the top so you can make quick decisions.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              <Chip label={`${pendingCount} pending`} color="warning" />
              <Chip
                label={`${substitutionsQuery.data?.length ?? 0} total`}
                variant="outlined"
              />
            </Stack>
          </Stack>
        </AppCard>

        <TextField
          select
          label="Filter by patient"
          value={selectedPatientId}
          onChange={(event) => setSelectedPatientId(event.target.value)}
          sx={{ maxWidth: 320 }}
        >
          <MenuItem value="all">All linked patients</MenuItem>
          {(patientsQuery.data ?? []).map((patient) => (
            <MenuItem key={patient.patient.id} value={patient.patient.id}>
              {patient.patient.name}
            </MenuItem>
          ))}
        </TextField>

        {reviewMutation.isError ? (
          <Alert severity="error">
            {reviewMutation.error instanceof Error
              ? reviewMutation.error.message
              : "Unable to review this substitution request."}
          </Alert>
        ) : null}

        {!substitutionsQuery.data || substitutionsQuery.data.length === 0 ? (
          <EmptyState
            title="No substitution requests yet"
            description="New patient photo requests will appear here once they are submitted."
          />
        ) : (
          <Stack spacing={2}>
            {substitutionsQuery.data.map((substitution) => (
              <AppCard key={substitution.id}>
                <Stack spacing={2}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    sx={{ justifyContent: "space-between" }}
                  >
                    <div>
                      <Typography variant="h3">{substitution.meal.name}</Typography>
                      <Typography color="text.secondary">
                        {substitution.patient.name}
                      </Typography>
                    </div>
                    <Chip
                      label={substitution.status}
                      color={reviewChipColorByStatus[substitution.status]}
                      variant={substitution.status === "PENDING" ? "filled" : "outlined"}
                    />
                  </Stack>

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    sx={{ alignItems: { md: "flex-start" } }}
                  >
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">Patient photo</Typography>
                      <Box
                        component="img"
                        src={substitution.imageUrl}
                        alt={`${substitution.patient.name} substitution request for ${substitution.meal.name}`}
                        sx={{
                          width: "100%",
                          maxWidth: 360,
                          borderRadius: 3,
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                          objectFit: "cover",
                        }}
                      />
                    </Stack>

                    <Stack spacing={1.5} sx={{ flex: 1 }}>
                      <div>
                        <Typography variant="subtitle2">Patient note</Typography>
                        <Typography color="text.secondary">
                          {substitution.note || "No note provided."}
                        </Typography>
                      </div>

                      <div>
                        <Typography variant="subtitle2">Nutritionist feedback</Typography>
                        <Typography color="text.secondary">
                          {substitution.nutritionistFeedback || "No feedback yet."}
                        </Typography>
                      </div>

                      {substitution.status === "PENDING" ? (
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => {
                              setActiveReview({
                                substitution,
                                action: "APPROVE",
                              });
                              setFeedback("");
                            }}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                              setActiveReview({
                                substitution,
                                action: "REJECT",
                              });
                              setFeedback("");
                            }}
                          >
                            Reject
                          </Button>
                        </Stack>
                      ) : null}
                    </Stack>
                  </Stack>
                </Stack>
              </AppCard>
            ))}
          </Stack>
        )}
      </Stack>

      <Dialog
        open={Boolean(activeReview)}
        onClose={reviewMutation.isPending ? undefined : () => setActiveReview(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {activeReview?.action === "APPROVE"
            ? "Approve substitution request"
            : "Reject substitution request"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography color="text.secondary">
              {activeReview?.substitution.patient.name} requested a substitution for{" "}
              {activeReview?.substitution.meal.name}.
            </Typography>
            <TextField
              label="Feedback (optional)"
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              multiline
              minRows={3}
              placeholder="Add a short note for the patient."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setActiveReview(null)}
            disabled={reviewMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={activeReview?.action === "APPROVE" ? "success" : "error"}
            disabled={!activeReview || reviewMutation.isPending}
            onClick={() => {
              if (!activeReview) {
                return;
              }

              reviewMutation.mutate({
                substitutionId: activeReview.substitution.id,
                action: activeReview.action,
                nutritionistFeedback: feedback.trim() || undefined,
              });
            }}
          >
            {reviewMutation.isPending
              ? "Saving..."
              : activeReview?.action === "APPROVE"
                ? "Approve request"
                : "Reject request"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
