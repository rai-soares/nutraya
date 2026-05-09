"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

import { useAuth } from "@/modules/auth/auth-context";
import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ErrorState } from "@/modules/app-shell/components/error-state";
import { LoadingState } from "@/modules/app-shell/components/loading-state";
import { PageHeader } from "@/modules/app-shell/components/page-header";
import { ApiClientError } from "@/modules/shared/api/api-client";
import { MacroGoalForm } from "@/modules/nutritionist/components/macro-goal-form";
import { MealForm } from "@/modules/nutritionist/components/meal-form";
import { MealList } from "@/modules/nutritionist/components/meal-list";
import { MealPlanForm } from "@/modules/nutritionist/components/meal-plan-form";
import {
  activatePatientMealPlan,
  createMealForMealPlan,
  createPatientMacroGoal,
  createPatientMealPlan,
  deleteMealFromMealPlan,
  getMealPlan,
  getNutritionistPatient,
  getPatientMacroGoal,
  listPatientMealPlans,
  updateMealForMealPlan,
  updatePatientMacroGoal,
} from "@/modules/nutritionist/nutritionist.api";
import type { Meal } from "@/modules/shared/types/api";
import { getErrorMessage } from "@/modules/shared/utils/pt-br";

export function NutritionistPatientDetailScreen({
  patientId,
}: {
  patientId: string;
}) {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [isMealDialogOpen, setIsMealDialogOpen] = useState(false);

  const token = session?.token ?? "";
  const authOptions = { token };

  const patientQuery = useQuery({
    queryKey: ["nutritionist-patient", patientId],
    enabled: Boolean(token),
    queryFn: () => getNutritionistPatient(patientId, authOptions),
  });

  const macroGoalQuery = useQuery({
    queryKey: ["patient-macro-goal", patientId],
    enabled: Boolean(token),
    retry: false,
    queryFn: () => getPatientMacroGoal(patientId, authOptions),
  });

  const mealPlansQuery = useQuery({
    queryKey: ["patient-meal-plans", patientId],
    enabled: Boolean(token),
    queryFn: () => listPatientMealPlans(patientId, authOptions),
  });

  const activeMealPlan = useMemo(
    () => mealPlansQuery.data?.find((plan) => plan.isActive) ?? null,
    [mealPlansQuery.data],
  );

  const activeMealPlanQuery = useQuery({
    queryKey: ["meal-plan", activeMealPlan?.id],
    enabled: Boolean(token && activeMealPlan?.id),
    queryFn: () => getMealPlan(activeMealPlan!.id, authOptions),
  });

  const macroGoalMutation = useMutation({
    mutationFn: async (values: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }) => {
      if (macroGoalQuery.data) {
        return updatePatientMacroGoal(patientId, values, authOptions);
      }

      return createPatientMacroGoal(patientId, values, authOptions);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["patient-macro-goal", patientId],
      });
    },
  });

  const mealPlanMutation = useMutation({
    mutationFn: async (values: {
      title: string;
      description: string;
      isActive: boolean;
    }) =>
      createPatientMealPlan(
        {
          patientId,
          title: values.title,
          description: values.description || null,
          isActive: values.isActive,
        },
        authOptions,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["patient-meal-plans", patientId],
      });
    },
  });

  const activateMealPlanMutation = useMutation({
    mutationFn: async (mealPlanId: string) => activatePatientMealPlan(mealPlanId, authOptions),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patient-meal-plans", patientId] }),
        queryClient.invalidateQueries({ queryKey: ["meal-plan"] }),
      ]);
    },
  });

  const mealMutation = useMutation({
    mutationFn: async (values: {
      name: string;
      description: string;
      scheduledTime: string;
      order: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }) => {
      if (!activeMealPlan?.id) {
        throw new Error("Crie e ative um plano alimentar antes de adicionar refeições.");
      }

      const payload = {
        name: values.name,
        description: values.description || null,
        scheduledTime: values.scheduledTime || null,
        order: values.order,
        calories: values.calories,
        protein: values.protein,
        carbs: values.carbs,
        fat: values.fat,
      };

      if (editingMeal) {
        return updateMealForMealPlan(activeMealPlan.id, editingMeal.id, payload, authOptions);
      }

      return createMealForMealPlan(activeMealPlan.id, payload, authOptions);
    },
    onSuccess: async () => {
      setEditingMeal(null);
      setIsMealDialogOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patient-meal-plans", patientId] }),
        queryClient.invalidateQueries({ queryKey: ["meal-plan", activeMealPlan?.id] }),
      ]);
    },
  });

  const deleteMealMutation = useMutation({
    mutationFn: async (meal: Meal) => {
      if (!activeMealPlan?.id) {
        throw new Error("Plano alimentar ativo não encontrado.");
      }

      return deleteMealFromMealPlan(activeMealPlan.id, meal.id, authOptions);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["meal-plan", activeMealPlan?.id] });
    },
  });

  if (patientQuery.isLoading || mealPlansQuery.isLoading) {
    return <LoadingState message="Carregando dados do paciente..." />;
  }

  if (patientQuery.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar o paciente"
        message={getErrorMessage(patientQuery.error, "Não foi possível carregar os dados.")}
        onRetry={() => void patientQuery.refetch()}
      />
    );
  }

  if (mealPlansQuery.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar os planos alimentares"
        message={getErrorMessage(mealPlansQuery.error, "Não foi possível carregar os dados.")}
        onRetry={() => void mealPlansQuery.refetch()}
      />
    );
  }

  const macroGoalError =
    macroGoalQuery.isError &&
    !(
      macroGoalQuery.error instanceof ApiClientError &&
      macroGoalQuery.error.status === 404
    )
      ? macroGoalQuery.error
      : null;

  return (
    <>
      <Stack spacing={3}>
        <PageHeader
          title={patientQuery.data?.patient.name ?? "Paciente"}
          subtitle={patientQuery.data?.patient.email ?? ""}
        />

        <AppCard>
          <Stack spacing={1.5}>
            <Typography variant="h3">Informações do paciente</Typography>
            <Typography>Nome: {patientQuery.data?.patient.name}</Typography>
            <Typography color="text.secondary">E-mail: {patientQuery.data?.patient.email}</Typography>
          </Stack>
        </AppCard>

        <AppCard>
          <Stack spacing={2}>
            <Typography variant="h3">Metas de macros</Typography>
            {macroGoalMutation.isSuccess ? (
              <Alert severity="success">Metas atualizadas com sucesso.</Alert>
            ) : null}
            {macroGoalError instanceof Error ? (
              <Alert severity="error">{getErrorMessage(macroGoalError, "Não foi possível carregar as metas de macros.")}</Alert>
            ) : null}
            <MacroGoalForm
              goal={macroGoalQuery.data ?? null}
              isSubmitting={macroGoalMutation.isPending}
              errorMessage={
                macroGoalMutation.isError
                  ? getErrorMessage(macroGoalMutation.error, "Não foi possível salvar as alterações.")
                  : null
              }
              onSubmit={async (values) => {
                await macroGoalMutation.mutateAsync(values);
              }}
            />
          </Stack>
        </AppCard>

        <AppCard>
          <Stack spacing={2.5}>
            <Typography variant="h3">Planos alimentares</Typography>
            {mealPlanMutation.isSuccess ? (
              <Alert severity="success">Plano alimentar salvo com sucesso.</Alert>
            ) : null}
            <MealPlanForm
              isSubmitting={mealPlanMutation.isPending}
              errorMessage={
                mealPlanMutation.isError
                  ? getErrorMessage(mealPlanMutation.error, "Não foi possível salvar o plano alimentar.")
                  : null
              }
              onSubmit={async (values) => {
                await mealPlanMutation.mutateAsync(values);
              }}
            />

            {!mealPlansQuery.data || mealPlansQuery.data.length === 0 ? (
              <EmptyState
                title="Nenhum plano alimentar cadastrado"
                description="Crie o primeiro plano alimentar, depois ative-o e adicione as refeições."
              />
            ) : (
              <Stack spacing={2}>
                {mealPlansQuery.data.map((plan) => (
                  <AppCard key={plan.id} variant="outlined">
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={2}
                      sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" } }}
                    >
                      <div>
                        <Typography variant="h3">{plan.title}</Typography>
                        {plan.description ? (
                          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                            {plan.description}
                          </Typography>
                        ) : null}
                      </div>
                      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                        {plan.isActive ? (
                          <Chip
                            color="success"
                            icon={<CheckCircleRoundedIcon />}
                            label="Plano ativo"
                          />
                        ) : (
                          <Button
                            variant="outlined"
                            disabled={activateMealPlanMutation.isPending}
                            onClick={() => {
                              activateMealPlanMutation.mutate(plan.id);
                            }}
                          >
                            {activateMealPlanMutation.isPending ? "Ativando..." : "Ativar"}
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </AppCard>
                ))}
              </Stack>
            )}
          </Stack>
        </AppCard>

        <AppCard>
          <Stack spacing={2.5}>
            <PageHeader
              title="Plano alimentar ativo"
              subtitle={activeMealPlan ? activeMealPlan.title : "Nenhum plano alimentar ativo selecionado."}
            />

            {activeMealPlan ? (
              <>
                {activeMealPlan.description ? (
                  <Typography color="text.secondary">{activeMealPlan.description}</Typography>
                ) : null}
                {activeMealPlanQuery.isLoading ? (
                  <LoadingState message="Carregando plano alimentar..." />
                ) : activeMealPlanQuery.isError ? (
                  <ErrorState
                    title="Não foi possível carregar o plano alimentar"
                    message={getErrorMessage(activeMealPlanQuery.error, "Não foi possível carregar os dados.")}
                    onRetry={() => void activeMealPlanQuery.refetch()}
                  />
                ) : (
                  <Stack spacing={2}>
                    {mealMutation.isSuccess ? (
                      <Alert severity="success">Refeição salva com sucesso.</Alert>
                    ) : null}
                    {deleteMealMutation.isSuccess ? (
                      <Alert severity="success">Refeição removida com sucesso.</Alert>
                    ) : null}

                    <Button
                      variant="contained"
                      startIcon={<AddRoundedIcon />}
                      sx={{ alignSelf: "flex-start" }}
                      onClick={() => {
                        setEditingMeal(null);
                        setIsMealDialogOpen(true);
                      }}
                    >
                      Adicionar refeição
                    </Button>

                    <MealList
                      meals={activeMealPlanQuery.data?.meals ?? []}
                      deletingMealId={deleteMealMutation.variables?.id ?? null}
                      onEdit={(meal) => {
                        setEditingMeal(meal);
                        setIsMealDialogOpen(true);
                      }}
                      onDelete={(meal) => {
                        deleteMealMutation.mutate(meal);
                      }}
                    />
                  </Stack>
                )}
              </>
            ) : (
              <EmptyState
                title="Nenhum plano alimentar ativo"
                description="Ative um plano alimentar para começar a criar as refeições que aparecerão para o paciente."
              />
            )}
          </Stack>
        </AppCard>
      </Stack>

      <Dialog
        open={isMealDialogOpen}
        onClose={mealMutation.isPending ? undefined : () => setIsMealDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{editingMeal ? "Editar refeição" : "Criar refeição"}</DialogTitle>
        <DialogContent>
          <MealForm
            meal={editingMeal}
            isSubmitting={mealMutation.isPending}
            errorMessage={
              mealMutation.isError
                ? getErrorMessage(mealMutation.error, "Não foi possível salvar a refeição.")
                : null
            }
            onCancel={() => setIsMealDialogOpen(false)}
            onSubmit={async (values) => {
              await mealMutation.mutateAsync(values);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
