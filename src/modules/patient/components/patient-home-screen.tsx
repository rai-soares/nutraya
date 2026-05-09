"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Chip, Grid, Stack, Typography } from "@mui/material";

import { useAuth } from "@/modules/auth/auth-context";
import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ErrorState } from "@/modules/app-shell/components/error-state";
import { LoadingState } from "@/modules/app-shell/components/loading-state";
import { PageHeader } from "@/modules/app-shell/components/page-header";
import { MacroProgressCard } from "@/modules/macros/components/macro-progress-card";
import {
  createPatientMealSubstitution,
  listPatientMealSubstitutions,
} from "@/modules/meal-substitutions/meal-substitution.api";
import { MealSubstitutionRequestDialog } from "@/modules/meal-substitutions/components/meal-substitution-request-dialog";
import { MealChecklistItem } from "@/modules/meals/components/meal-checklist-item";
import {
  ApiClientError,
  apiClient,
} from "@/modules/shared/api/api-client";
import { uploadImage } from "@/modules/chat/chat.api";
import type { DailyMacroProgress, MealSubstitution } from "@/modules/shared/types/api";
import {
  formatFriendlyDate,
  getTodayIsoDate,
} from "@/modules/shared/utils/date";

const progressCardConfig = [
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "protein", label: "Protein", unit: "g" },
  { key: "carbs", label: "Carbs", unit: "g" },
  { key: "fat", label: "Fat", unit: "g" },
] as const;

export function PatientHomeScreen() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const date = getTodayIsoDate();
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const token = session?.token ?? "";
  const authOptions = { token };

  const progressQuery = useQuery({
    queryKey: ["patient-progress", session?.user.id, date],
    enabled: Boolean(token && session?.user.id),
    queryFn: () =>
      apiClient.get<DailyMacroProgress>(
        `/api/daily-macro-logs/patient/${session?.user.id}/progress?date=${date}`,
        authOptions,
      ),
  });

  const substitutionsQuery = useQuery({
    queryKey: ["patient-meal-substitutions", session?.user.id],
    enabled: Boolean(token && session?.user.id),
    queryFn: () => listPatientMealSubstitutions(authOptions),
  });

  const mealMutation = useMutation({
    mutationFn: async ({
      mealId,
      completed,
    }: {
      mealId: string;
      completed: boolean;
    }) => {
      if (!session?.token) {
        throw new Error("You must be signed in.");
      }

      if (completed) {
        await apiClient.delete(
          "/api/patient/meal-completions",
          { mealId, date },
          { token: session.token },
        );
        return;
      }

      await apiClient.post(
        "/api/patient/meal-completions",
        { mealId, date },
        { token: session.token },
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["patient-progress", session?.user.id, date],
      });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => uploadImage(file, authOptions),
  });

  const substitutionMutation = useMutation({
    mutationFn: async ({
      mealId,
      file,
      note,
    }: {
      mealId: string;
      file: File;
      note?: string;
    }) => {
      const uploadResult = await uploadImageMutation.mutateAsync(file);

      return createPatientMealSubstitution(
        {
          mealId,
          imageUrl: uploadResult.imageUrl,
          note,
        },
        authOptions,
      );
    },
    onSuccess: async () => {
      setSelectedMealId(null);
      await queryClient.invalidateQueries({
        queryKey: ["patient-meal-substitutions", session?.user.id],
      });
    },
  });

  const completedSummary = useMemo(() => {
    const meals = progressQuery.data?.meals ?? [];
    const completedCount = meals.filter((meal) => meal.completed).length;

    return {
      total: meals.length,
      completed: completedCount,
      pending: meals.length - completedCount,
    };
  }, [progressQuery.data?.meals]);

  const latestSubstitutionByMealId = useMemo(() => {
    return (substitutionsQuery.data ?? []).reduce<Record<string, MealSubstitution>>(
      (accumulator, substitution) => {
        if (!accumulator[substitution.mealId]) {
          accumulator[substitution.mealId] = substitution;
        }

        return accumulator;
      },
      {},
    );
  }, [substitutionsQuery.data]);

  const selectedMeal = useMemo(
    () =>
      progressQuery.data?.meals.find((meal) => meal.id === selectedMealId) ?? null,
    [progressQuery.data?.meals, selectedMealId],
  );

  const setupState = useMemo(() => {
    if (
      !(progressQuery.error instanceof ApiClientError) ||
      progressQuery.error.status !== 404
    ) {
      return null;
    }

    if (progressQuery.error.message === "Macro goal not found.") {
      return {
        title: "Your account is active, but your goals are not ready yet",
        description:
          "You signed in successfully. Your nutritionist still needs to set your macro goals before your daily progress can appear.",
      };
    }

    if (progressQuery.error.message === "Active meal plan not found.") {
      return {
        title: "Your account is active, but your meal plan is not ready yet",
        description:
          "You signed in successfully. Your nutritionist still needs to activate a meal plan before your daily routine can appear here.",
      };
    }

    return null;
  }, [progressQuery.error]);

  if (progressQuery.isLoading) {
    return <LoadingState message="Loading today's nutrition status..." />;
  }

  if (setupState) {
    return (
      <Stack spacing={3}>
        <PageHeader
          title={`Hi, ${session?.user.name?.split(" ")[0] ?? "there"}`}
          subtitle="Your login worked. We are checking the nutrition setup for your account."
        />
        <Alert severity="info">
          Signed in successfully. The remaining step is finishing your nutrition
          setup.
        </Alert>
        <EmptyState title={setupState.title} description={setupState.description} />
      </Stack>
    );
  }

  if (progressQuery.isError) {
    return (
      <ErrorState
        title="Signed in, but we could not load your home"
        message={
          progressQuery.error instanceof Error
            ? progressQuery.error.message
            : "Unable to load progress."
        }
        onRetry={() => void progressQuery.refetch()}
      />
    );
  }

  if (substitutionsQuery.isError) {
    return (
      <ErrorState
        title="Meal requests unavailable"
        message={
          substitutionsQuery.error instanceof Error
            ? substitutionsQuery.error.message
            : "Unable to load substitution requests."
        }
        onRetry={() => void substitutionsQuery.refetch()}
      />
    );
  }

  if (!progressQuery.data) {
    return (
      <EmptyState
        title="No daily status yet"
        description="Create a macro goal and activate a meal plan to see today's progress."
      />
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title={`Hi, ${session?.user.name?.split(" ")[0] ?? "there"}`}
        subtitle={`Today is ${formatFriendlyDate(progressQuery.data.date)}.`}
      />

      <AppCard>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
          }}
        >
          <div>
            <Typography variant="h3">Today&apos;s progress</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Active meal plan: {progressQuery.data.mealPlan.title}
            </Typography>
          </div>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
            <Chip
              label={`${completedSummary.completed}/${completedSummary.total} meals completed`}
              color="primary"
            />
            <Chip
              label={`${completedSummary.pending} pending`}
              variant="outlined"
            />
          </Stack>
        </Stack>
      </AppCard>

      <Grid container spacing={2.5}>
        {progressCardConfig.map((item) => (
          <Grid key={item.key} size={{ xs: 12, sm: 6, lg: 3 }}>
            <MacroProgressCard
              label={item.label}
              unit={item.unit}
              consumed={progressQuery.data.consumed[item.key]}
              goal={progressQuery.data.goals[item.key]}
              remaining={progressQuery.data.remaining[item.key]}
              progress={progressQuery.data.progress[item.key]}
            />
          </Grid>
        ))}
      </Grid>

      <Stack spacing={2}>
        <PageHeader
          title="Today&apos;s meals"
          subtitle="Check meals off as you complete them. Daily macros update automatically."
        />

        {mealMutation.isError ? (
          <Alert severity="error">
            {mealMutation.error instanceof Error
              ? mealMutation.error.message
              : "Unable to update meal status."}
          </Alert>
        ) : null}

        {substitutionMutation.isSuccess ? (
          <Alert severity="success">
            Substitution request sent. Your nutritionist can now review the meal photo.
          </Alert>
        ) : null}

        {substitutionMutation.isError ? (
          <Alert severity="error">
            {substitutionMutation.error instanceof Error
              ? substitutionMutation.error.message
              : "Unable to send the substitution request."}
          </Alert>
        ) : null}

        {progressQuery.data.meals.length === 0 ? (
          <EmptyState
            title="No meals in the active plan"
            description="Your nutritionist has not added meals to today's plan yet."
          />
        ) : (
          <Stack spacing={2}>
            {progressQuery.data.meals.map((meal) => (
              <MealChecklistItem
                key={meal.id}
                meal={meal}
                substitutionRequest={latestSubstitutionByMealId[meal.id] ?? null}
                isPending={
                  mealMutation.isPending &&
                  mealMutation.variables?.mealId === meal.id
                }
                onToggle={(mealId, completed) => {
                  mealMutation.mutate({ mealId, completed });
                }}
                onRequestSubstitution={(mealId) => {
                  setSelectedMealId(mealId);
                }}
              />
            ))}
          </Stack>
        )}
      </Stack>

      {selectedMeal ? (
        <MealSubstitutionRequestDialog
          mealName={selectedMeal.name}
          open
          isSubmitting={
            uploadImageMutation.isPending || substitutionMutation.isPending
          }
          errorMessage={
            (uploadImageMutation.isError &&
              uploadImageMutation.error instanceof Error &&
              uploadImageMutation.error.message) ||
            (substitutionMutation.isError &&
              substitutionMutation.error instanceof Error &&
              substitutionMutation.error.message) ||
            null
          }
          onClose={() => setSelectedMealId(null)}
          onSubmit={async (values) => {
            await substitutionMutation.mutateAsync({
              mealId: selectedMeal.id,
              file: values.file,
              note: values.note,
            });
          }}
        />
      ) : null}
    </Stack>
  );
}
