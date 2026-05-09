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
  Grid,
  Stack,
  Typography,
} from "@mui/material";

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
import { MealSubstitutionEstimationPanel } from "@/modules/meal-substitutions/components/meal-substitution-estimation-panel";
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
import { getErrorMessage } from "@/modules/shared/utils/pt-br";

const progressCardConfig = [
  { key: "calories", label: "Calorias", unit: "kcal" },
  { key: "protein", label: "Proteína", unit: "g" },
  { key: "carbs", label: "Carboidratos", unit: "g" },
  { key: "fat", label: "Gorduras", unit: "g" },
] as const;

export function PatientHomeScreen() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const date = getTodayIsoDate();
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [selectedSubstitutionId, setSelectedSubstitutionId] = useState<string | null>(
    null,
  );
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
        throw new Error("Faça login para continuar.");
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
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["patient-meal-substitutions", session?.user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["patient-progress", session?.user.id, date],
        }),
      ]);
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

  const selectedSubstitution = useMemo(
    () =>
      (substitutionsQuery.data ?? []).find(
        (substitution) => substitution.id === selectedSubstitutionId,
      ) ?? null,
    [selectedSubstitutionId, substitutionsQuery.data],
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
    return <LoadingState message="Carregando seu progresso de hoje..." />;
  }

  if (setupState) {
    return (
      <Stack spacing={3}>
        <PageHeader
          title={`Olá, ${session?.user.name?.split(" ")[0] ?? "paciente"}`}
          subtitle="Seu acesso foi realizado com sucesso. Estamos verificando a configuração nutricional da sua conta."
        />
        <Alert severity="info">
          Seu acesso foi realizado com sucesso. Falta apenas concluir sua configuração nutricional.
        </Alert>
        <EmptyState
          title={
            setupState.title === "Your account is active, but your goals are not ready yet"
              ? "Sua conta está ativa, mas suas metas ainda não foram configuradas"
              : "Sua conta está ativa, mas seu plano alimentar ainda não está pronto"
          }
          description={
            setupState.description.includes("macro goals")
              ? "Seu nutricionista ainda precisa definir suas metas de macros antes que seu progresso diário apareça aqui."
              : "Seu nutricionista ainda precisa ativar um plano alimentar antes que sua rotina diária apareça aqui."
          }
        />
      </Stack>
    );
  }

  if (progressQuery.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar sua página inicial"
        message={getErrorMessage(progressQuery.error, "Não foi possível carregar os dados.")}
        onRetry={() => void progressQuery.refetch()}
      />
    );
  }

  if (substitutionsQuery.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar as solicitações de substituição"
        message={getErrorMessage(substitutionsQuery.error, "Não foi possível carregar os dados.")}
        onRetry={() => void substitutionsQuery.refetch()}
      />
    );
  }

  if (!progressQuery.data) {
    return (
      <EmptyState
        title="Nenhum progresso diário disponível"
        description="Defina metas de macros e ative um plano alimentar para acompanhar o progresso de hoje."
      />
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title={`Olá, ${session?.user.name?.split(" ")[0] ?? "paciente"}`}
        subtitle={`Hoje é ${formatFriendlyDate(progressQuery.data.date)}.`}
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
            <Typography variant="h3">Progresso de hoje</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Plano alimentar ativo: {progressQuery.data.mealPlan.title}
            </Typography>
          </div>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
            <Chip
              label={`${completedSummary.completed}/${completedSummary.total} refeições concluídas`}
              color="primary"
            />
            <Chip
              label={`${completedSummary.pending} pendentes`}
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
          title="Refeições de hoje"
          subtitle="Marque as refeições conforme concluir. Os macros do dia são atualizados automaticamente."
        />

        {mealMutation.isError ? (
          <Alert severity="error">
            {getErrorMessage(mealMutation.error, "Não foi possível atualizar o status da refeição.")}
          </Alert>
        ) : null}

        {substitutionMutation.isSuccess ? (
          <Alert severity="success">
            Solicitação enviada para o nutricionista. A estimativa aproximada foi gerada com sucesso.
          </Alert>
        ) : null}

        {substitutionMutation.isError ? (
          <Alert severity="error">
            {getErrorMessage(substitutionMutation.error, "Não foi possível enviar a solicitação de substituição.")}
          </Alert>
        ) : null}

        {progressQuery.data.meals.length === 0 ? (
          <EmptyState
            title="Nenhuma refeição cadastrada para hoje"
            description="Seu nutricionista ainda não adicionou refeições ao plano alimentar ativo."
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
                onViewSubstitutionRequest={(substitutionId) => {
                  setSelectedSubstitutionId(substitutionId);
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
              getErrorMessage(uploadImageMutation.error, "Não foi possível enviar a imagem.")) ||
            (substitutionMutation.isError &&
              getErrorMessage(substitutionMutation.error, "Não foi possível enviar a solicitação de substituição.")) ||
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

      {selectedSubstitution ? (
        <Dialog
          open
          onClose={() => setSelectedSubstitutionId(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Detalhes da solicitação</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box
                component="img"
                src={selectedSubstitution.imageUrl}
                alt={`Solicitação de substituição para ${selectedSubstitution.meal.name}`}
                sx={{
                  width: "100%",
                  maxHeight: 320,
                  objectFit: "cover",
                  borderRadius: 3,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              />

              <div>
                <Typography variant="subtitle2">Refeição</Typography>
                <Typography color="text.secondary">
                  {selectedSubstitution.meal.name}
                </Typography>
              </div>

              <div>
                <Typography variant="subtitle2">Sua observação</Typography>
                <Typography color="text.secondary">
                  {selectedSubstitution.note || "Nenhuma observação informada."}
                </Typography>
              </div>

              <div>
                <Typography variant="subtitle2">Feedback do nutricionista</Typography>
                <Typography color="text.secondary">
                  {selectedSubstitution.nutritionistFeedback || "Nenhum feedback ainda."}
                </Typography>
              </div>

              <MealSubstitutionEstimationPanel
                substitution={selectedSubstitution}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedSubstitutionId(null)}>Fechar</Button>
          </DialogActions>
        </Dialog>
      ) : null}
    </Stack>
  );
}
