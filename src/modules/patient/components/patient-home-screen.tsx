"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";

import { useAuth } from "@/modules/auth/auth-context";
import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ErrorState } from "@/modules/app-shell/components/error-state";
import { ImagePreview } from "@/modules/app-shell/components/image-preview";
import { LoadingState } from "@/modules/app-shell/components/loading-state";
import { MetricPill } from "@/modules/app-shell/components/metric-pill";
import { PageHeader } from "@/modules/app-shell/components/page-header";
import { SectionCard } from "@/modules/app-shell/components/section-card";
import { MacroSummaryGrid } from "@/modules/macros/components/macro-summary-grid";
import {
  createPatientMealSubstitution,
  listPatientMealSubstitutions,
} from "@/modules/meal-substitutions/meal-substitution.api";
import { MealSubstitutionEstimationPanel } from "@/modules/meal-substitutions/components/meal-substitution-estimation-panel";
import { MealSubstitutionRequestDialog } from "@/modules/meal-substitutions/components/meal-substitution-request-dialog";
import { MealChecklistItem } from "@/modules/meals/components/meal-checklist-item";
import { uploadImage } from "@/modules/chat/chat.api";
import { ApiClientError, apiClient } from "@/modules/shared/api/api-client";
import type { DailyMacroProgress, MealSubstitution } from "@/modules/shared/types/api";
import { formatFriendlyDate, getTodayIsoDate } from "@/modules/shared/utils/date";
import { getErrorMessage } from "@/modules/shared/utils/pt-br";

export function PatientHomeScreen() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const date = getTodayIsoDate();
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [selectedSubstitutionId, setSelectedSubstitutionId] = useState<string | null>(null);
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
    () => progressQuery.data?.meals.find((meal) => meal.id === selectedMealId) ?? null,
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
    if (!(progressQuery.error instanceof ApiClientError) || progressQuery.error.status !== 404) {
      return null;
    }

    if (progressQuery.error.message === "Macro goal not found.") {
      return {
        title: "Sua conta está ativa, mas suas metas ainda não foram configuradas",
        description:
          "Seu nutricionista ainda precisa definir suas metas de macros antes que seu progresso diário apareça aqui.",
      };
    }

    if (progressQuery.error.message === "Active meal plan not found.") {
      return {
        title: "Nenhum plano alimentar ativo",
        description:
          "O nutricionista ainda não configurou um plano alimentar para este paciente.",
      };
    }

    return null;
  }, [progressQuery.error]);

  if (progressQuery.isLoading) {
    return <LoadingState message="Carregando..." />;
  }

  if (setupState) {
    return (
      <Stack spacing={3}>
        <PageHeader
          eyebrow="Hoje"
          title={`Olá, ${session?.user.name?.split(" ")[0] ?? "paciente"}`}
          subtitle="Seu acesso foi realizado com sucesso. Falta apenas concluir sua configuração nutricional."
        />
        <EmptyState title={setupState.title} description={setupState.description} />
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
        title="Nenhum plano alimentar ativo"
        description="O nutricionista ainda não configurou um plano alimentar para este paciente."
      />
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Acompanhamento diário"
        title={`Olá, ${session?.user.name?.split(" ")[0] ?? "paciente"}`}
        subtitle={`Hoje é ${formatFriendlyDate(progressQuery.data.date)}.`}
      />

      <AppCard
        sx={{
          background:
            "linear-gradient(135deg, rgba(18,116,107,0.96) 0%, rgba(70,138,164,0.95) 100%)",
          color: "common.white",
        }}
      >
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
          >
            <div>
              <Typography variant="subtitle2" sx={{ color: "rgba(255,255,255,0.75)" }}>
                Progresso de hoje
              </Typography>
              <Typography variant="h2" sx={{ mt: 1 }}>
                {progressQuery.data.mealPlan.title}
              </Typography>
              <Typography sx={{ mt: 1.25, color: "rgba(255,255,255,0.78)", maxWidth: 540 }}>
                Acompanhe o consumo do dia, marque suas refeições e envie substituições quando precisar.
              </Typography>
            </div>

            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              <MetricPill
                label={`${completedSummary.completed}/${completedSummary.total} concluídas`}
                tone="success"
              />
              <MetricPill label={`${completedSummary.pending} pendentes`} tone="warning" />
            </Stack>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} useFlexGap sx={{ flexWrap: "wrap" }}>
            <MetricPill label="Metas do dia" tone="primary" />
            <MetricPill label="Consumido" tone="default" />
            <MetricPill label="Restante" tone="default" />
          </Stack>
        </Stack>
      </AppCard>

      <SectionCard
        title="Metas do dia"
        description="Seus macros ficam atualizados automaticamente conforme as refeições são concluídas."
      >
        <MacroSummaryGrid progress={progressQuery.data} />
      </SectionCard>

      <SectionCard
        title="Refeições de hoje"
        description="Marque as refeições conforme concluir. O progresso do dia é recalculado a cada atualização."
        action={
          <MetricPill
            label={`${completedSummary.completed} de ${completedSummary.total} concluídas`}
            tone="primary"
          />
        }
      >
        {mealMutation.isError ? (
          <Alert severity="error">
            {getErrorMessage(mealMutation.error, "Não foi possível salvar as alterações.")}
          </Alert>
        ) : null}

        {substitutionMutation.isSuccess ? (
          <Alert severity="success">Solicitação enviada com sucesso.</Alert>
        ) : null}

        {substitutionMutation.isError ? (
          <Alert severity="error">
            {getErrorMessage(
              substitutionMutation.error,
              "Não foi possível enviar a solicitação.",
            )}
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
                isPending={mealMutation.isPending && mealMutation.variables?.mealId === meal.id}
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
      </SectionCard>

      {selectedMeal ? (
        <MealSubstitutionRequestDialog
          mealName={selectedMeal.name}
          open
          isSubmitting={uploadImageMutation.isPending || substitutionMutation.isPending}
          errorMessage={
            (uploadImageMutation.isError &&
              getErrorMessage(uploadImageMutation.error, "Não foi possível enviar a imagem.")) ||
            (substitutionMutation.isError &&
              getErrorMessage(
                substitutionMutation.error,
                "Não foi possível enviar a solicitação.",
              )) ||
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
        <Dialog open onClose={() => setSelectedSubstitutionId(null)} fullWidth maxWidth="md">
          <DialogTitle>Detalhes da solicitação</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <ImagePreview
                src={selectedSubstitution.imageUrl}
                alt={`Foto enviada para ${selectedSubstitution.meal.name}`}
                maxHeight={360}
              />

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">Refeição</Typography>
                  <Typography color="text.secondary">{selectedSubstitution.meal.name}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">Observação do paciente</Typography>
                  <Typography color="text.secondary">
                    {selectedSubstitution.note || "Nenhuma observação informada."}
                  </Typography>
                </Box>
              </Stack>

              <Box>
                <Typography variant="subtitle2">Feedback do nutricionista</Typography>
                <Typography color="text.secondary">
                  {selectedSubstitution.nutritionistFeedback || "Nenhum feedback ainda."}
                </Typography>
              </Box>

              <SectionCard
                title="Estimativa da IA"
                description="Visualização aproximada baseada na imagem enviada."
                variant="outlined"
              >
                <MealSubstitutionEstimationPanel substitution={selectedSubstitution} />
              </SectionCard>
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
