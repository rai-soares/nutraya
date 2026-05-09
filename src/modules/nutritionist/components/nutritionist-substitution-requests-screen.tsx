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
  listNutritionistMealSubstitutions,
  saveNutritionistMealSubstitutionFeedback,
} from "@/modules/meal-substitutions/meal-substitution.api";
import { MealSubstitutionEstimationPanel } from "@/modules/meal-substitutions/components/meal-substitution-estimation-panel";
import { listNutritionistPatients } from "@/modules/nutritionist/nutritionist.api";
import type { MealSubstitution } from "@/modules/shared/types/api";
import { formatFriendlyDate } from "@/modules/shared/utils/date";

export function NutritionistSubstitutionRequestsScreen() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.token ?? "";
  const authOptions = { token };
  const [selectedPatientId, setSelectedPatientId] = useState("all");
  const [activeFeedbackSubstitution, setActiveFeedbackSubstitution] =
    useState<MealSubstitution | null>(null);
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

  const feedbackMutation = useMutation({
    mutationFn: async ({
      substitutionId,
      nutritionistFeedback,
    }: {
      substitutionId: string;
      nutritionistFeedback?: string;
    }) =>
      saveNutritionistMealSubstitutionFeedback(
        substitutionId,
        { nutritionistFeedback },
        authOptions,
      ),
    onSuccess: async () => {
      setActiveFeedbackSubstitution(null);
      setFeedback("");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["nutritionist-meal-substitutions", session?.user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "nutritionist-patient",
            activeFeedbackSubstitution?.patientId,
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: ["patient-meal-substitutions"],
        }),
      ]);
    },
  });

  const appliedCount = useMemo(
    () =>
      (substitutionsQuery.data ?? []).filter(
        (substitution) => substitution.appliedToDailyLog,
      ).length,
    [substitutionsQuery.data],
  );

  if (patientsQuery.isLoading || substitutionsQuery.isLoading) {
    return <LoadingState message="Loading substitutions..." />;
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
        title="Substitutions unavailable"
        message={
          substitutionsQuery.error instanceof Error
            ? substitutionsQuery.error.message
            : "Unable to load substitutions."
        }
        onRetry={() => void substitutionsQuery.refetch()}
      />
    );
  }

  return (
    <>
      <Stack spacing={3}>
        <PageHeader
          title="Substitutions"
          subtitle="Review substitutions already applied to patient progress and leave feedback when helpful."
        />

        <AppCard>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between" }}
          >
            <Stack spacing={1}>
              <Typography variant="h3">Applied substitutions</Typography>
              <Typography color="text.secondary">
                Each substitution keeps the submitted photo, the AI estimate, and
                any later nutritionist feedback.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              <Chip label={`${appliedCount} applied`} color="success" />
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

        {feedbackMutation.isError ? (
          <Alert severity="error">
            {feedbackMutation.error instanceof Error
              ? feedbackMutation.error.message
              : "Unable to save feedback for this substitution."}
          </Alert>
        ) : null}

        {!substitutionsQuery.data || substitutionsQuery.data.length === 0 ? (
          <EmptyState
            title="No substitutions yet"
            description="Patient substitutions will appear here after they are submitted and applied."
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
                      label={
                        substitution.appliedToDailyLog
                          ? "Applied to progress"
                          : "Awaiting application"
                      }
                      color={substitution.appliedToDailyLog ? "success" : "warning"}
                      variant={substitution.appliedToDailyLog ? "filled" : "outlined"}
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
                        alt={`${substitution.patient.name} substitution for ${substitution.meal.name}`}
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

                      <MealSubstitutionEstimationPanel substitution={substitution} />

                      {substitution.appliedToDailyLog ? (
                        <Alert severity="success">
                          Applied to progress on{" "}
                          {formatFriendlyDate(substitution.applicationDate ?? "")}.
                        </Alert>
                      ) : null}

                      <Button
                        variant="outlined"
                        onClick={() => {
                          setActiveFeedbackSubstitution(substitution);
                          setFeedback(substitution.nutritionistFeedback ?? "");
                        }}
                      >
                        {substitution.nutritionistFeedback
                          ? "Edit feedback"
                          : "Add feedback"}
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </AppCard>
            ))}
          </Stack>
        )}
      </Stack>

      <Dialog
        open={Boolean(activeFeedbackSubstitution)}
        onClose={
          feedbackMutation.isPending
            ? undefined
            : () => setActiveFeedbackSubstitution(null)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nutritionist feedback</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography color="text.secondary">
              {activeFeedbackSubstitution?.patient.name} submitted a substitution
              for {` ${activeFeedbackSubstitution?.meal.name}`}.
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
            onClick={() => setActiveFeedbackSubstitution(null)}
            disabled={feedbackMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!activeFeedbackSubstitution || feedbackMutation.isPending}
            onClick={() => {
              if (!activeFeedbackSubstitution) {
                return;
              }

              feedbackMutation.mutate({
                substitutionId: activeFeedbackSubstitution.id,
                nutritionistFeedback: feedback.trim() || undefined,
              });
            }}
          >
            {feedbackMutation.isPending ? "Saving..." : "Save feedback"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
