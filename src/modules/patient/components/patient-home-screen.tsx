"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useAuth } from "@/modules/auth/auth-context";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ErrorState } from "@/modules/app-shell/components/error-state";
import { ImagePreview } from "@/modules/app-shell/components/image-preview";
import { LoadingState } from "@/modules/app-shell/components/loading-state";
import { MetricPill } from "@/modules/app-shell/components/metric-pill";
import { PageHeader } from "@/modules/app-shell/components/page-header";
import { SectionCard } from "@/modules/app-shell/components/section-card";
import { uploadImage } from "@/modules/chat/chat.api";
import { MacroSummaryGrid } from "@/modules/macros/components/macro-summary-grid";
import {
  createPatientMealSubstitution,
  listPatientMealSubstitutions,
} from "@/modules/meal-substitutions/meal-substitution.api";
import { MealSubstitutionEstimationPanel } from "@/modules/meal-substitutions/components/meal-substitution-estimation-panel";
import { MealSubstitutionRequestDialog } from "@/modules/meal-substitutions/components/meal-substitution-request-dialog";
import { MealChecklistItem } from "@/modules/meals/components/meal-checklist-item";
import { ApiClientError, apiClient } from "@/modules/shared/api/api-client";
import type { DailyMacroProgress, MealSubstitution } from "@/modules/shared/types/api";
import {
  formatFriendlyDate,
  getTodayIsoDate,
  resolveSelectableIsoDate,
} from "@/modules/shared/utils/date";
import { getErrorMessage } from "@/modules/shared/utils/pt-br";

const PATIENT_DATE_QUERY_KEY = "date";

function matchesSelectedDate(substitution: MealSubstitution, selectedDate: string) {
  return (
    substitution.applicationDate === selectedDate ||
    substitution.createdAt.startsWith(selectedDate)
  );
}

export function PatientHomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const today = getTodayIsoDate();
  const requestedDate = searchParams.get(PATIENT_DATE_QUERY_KEY);
  const selectedDate = resolveSelectableIsoDate(requestedDate, today);
  const isPastDate = selectedDate < today;
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [selectedSubstitutionId, setSelectedSubstitutionId] = useState<string | null>(null);
  const token = session?.token ?? "";
  const authOptions = { token };

  useEffect(() => {
    if (requestedDate === selectedDate) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set(PATIENT_DATE_QUERY_KEY, selectedDate);
    router.replace(`${pathname}?${nextSearchParams.toString()}`);
  }, [pathname, requestedDate, router, searchParams, selectedDate]);

  const progressQuery = useQuery({
    queryKey: ["patient-progress", session?.user.id, selectedDate],
    enabled: Boolean(token && session?.user.id),
    queryFn: () =>
      apiClient.get<DailyMacroProgress>(
        `/api/daily-macro-logs/patient/${session?.user.id}/progress?date=${selectedDate}`,
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
          { mealId, date: selectedDate },
          { token: session.token },
        );
        return;
      }

      await apiClient.post(
        "/api/patient/meal-completions",
        { mealId, date: selectedDate },
        { token: session.token },
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["patient-progress", session?.user.id, selectedDate],
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
          queryKey: ["patient-progress", session?.user.id, selectedDate],
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
    return (substitutionsQuery.data ?? [])
      .filter((substitution) => matchesSelectedDate(substitution, selectedDate))
      .reduce<Record<string, MealSubstitution>>((accumulator, substitution) => {
        if (!accumulator[substitution.mealId]) {
          accumulator[substitution.mealId] = substitution;
        }

        return accumulator;
      }, {});
  }, [selectedDate, substitutionsQuery.data]);

  const selectedMeal = useMemo(
    () => progressQuery.data?.meals.find((meal) => meal.id === selectedMealId) ?? null,
    [progressQuery.data?.meals, selectedMealId],
  );

  const selectedSubstitution = useMemo(
    () =>
      (substitutionsQuery.data ?? []).find(
        (substitution) =>
          substitution.id === selectedSubstitutionId &&
          matchesSelectedDate(substitution, selectedDate),
      ) ?? null,
    [selectedDate, selectedSubstitutionId, substitutionsQuery.data],
  );

  const selectedDateLabel = formatFriendlyDate(selectedDate);
  const pageSubtitle = isPastDate
    ? `Visualizando ${selectedDateLabel}. Este histórico fica disponível somente para consulta.`
    : `Hoje é ${selectedDateLabel}.`;
  const mealsTitle = isPastDate ? "Refeições do dia" : "Refeições de hoje";
  const mealsDescription = isPastDate
    ? "Confira o histórico das refeições e do progresso registrado nesta data."
    : "Marque as refeições conforme concluir. O progresso do dia é recalculado a cada atualização.";
  const emptyMealsTitle = isPastDate
    ? "Nenhuma refeição encontrada para a data"
    : "Nenhuma refeição cadastrada para hoje";
  const emptyMealsDescription = isPastDate
    ? "Não houve refeições registradas para a data selecionada no plano alimentar ativo."
    : "Seu nutricionista ainda não adicionou refeições ao plano alimentar ativo.";

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
        subtitle={pageSubtitle}
        action={
          <TextField
            label="Selecionar data"
            type="date"
            value={selectedDate}
            onChange={(event) => {
              const nextDate = resolveSelectableIsoDate(event.target.value, today);
              const nextSearchParams = new URLSearchParams(searchParams.toString());
              nextSearchParams.set(PATIENT_DATE_QUERY_KEY, nextDate);
              router.replace(`${pathname}?${nextSearchParams.toString()}`);
            }}
            slotProps={{
              inputLabel: {
                shrink: true,
              },
              htmlInput: {
                max: today,
              },
            }}
            sx={{ minWidth: { xs: "100%", sm: 220 } }}
          />
        }
      />

      <SectionCard
        title="Metas do dia"
        description="Seus macros ficam atualizados automaticamente conforme as refeições são concluídas."
      >
        <MacroSummaryGrid progress={progressQuery.data} />
      </SectionCard>

      <SectionCard
        title={mealsTitle}
        description={mealsDescription}
        action={
          <MetricPill
            label={`${completedSummary.completed} de ${completedSummary.total} concluídas`}
            tone="primary"
          />
        }
      >
        {isPastDate ? (
          <Alert severity="info">
            Você está visualizando um dia anterior. Esse histórico é somente leitura.
          </Alert>
        ) : null}

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
          <EmptyState title={emptyMealsTitle} description={emptyMealsDescription} />
        ) : (
          <Stack spacing={2}>
            {progressQuery.data.meals.map((meal) => (
              <MealChecklistItem
                key={meal.id}
                meal={meal}
                substitutionRequest={latestSubstitutionByMealId[meal.id] ?? null}
                isPending={mealMutation.isPending && mealMutation.variables?.mealId === meal.id}
                isReadOnly={isPastDate}
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

      {selectedMeal && !isPastDate ? (
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
