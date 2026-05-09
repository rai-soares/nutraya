"use client";

import { useMemo, useState } from "react";
import { useQueries, useQuery } from "@tanstack/react-query";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ErrorState } from "@/modules/app-shell/components/error-state";
import { LoadingState } from "@/modules/app-shell/components/loading-state";
import { PageHeader } from "@/modules/app-shell/components/page-header";
import { apiClient } from "@/modules/shared/api/api-client";
import { useAuth } from "@/modules/auth/auth-context";
import { MacroProgressCard } from "@/modules/macros/components/macro-progress-card";
import { getErrorMessage } from "@/modules/shared/utils/pt-br";
import type {
  AppUser,
  DailyMacroProgress,
  MealCompletionSummary,
  MealPlan,
} from "@/modules/shared/types/api";
import { getTodayIsoDate } from "@/modules/shared/utils/date";

type LinkedPatient = {
  patient: AppUser;
  mealPlans: MealPlan[];
};

export function NutritionistDashboardScreen() {
  const { session } = useAuth();
  const [expandedPatientId, setExpandedPatientId] = useState<string | false>(false);
  const date = getTodayIsoDate();

  const usersQuery = useQuery({
    queryKey: ["users", session?.user.id],
    enabled: Boolean(session?.token),
    queryFn: () => apiClient.get<AppUser[]>("/api/users", { token: session?.token }),
  });

  const patientCandidates = useMemo(
    () => (usersQuery.data ?? []).filter((user) => user.role === "PATIENT"),
    [usersQuery.data],
  );

  const linkageQueries = useQueries({
    queries: patientCandidates.map((patient) => ({
      queryKey: ["nutritionist-patient-plans", patient.id],
      enabled: Boolean(session?.token),
      queryFn: () =>
        apiClient.get<MealPlan[]>(`/api/meal-plans/patient/${patient.id}`, {
          token: session?.token,
        }),
      retry: false,
    })),
  });

  const linkedPatients = useMemo<LinkedPatient[]>(() => {
    return patientCandidates.flatMap((patient, index) => {
      const result = linkageQueries[index];

      if (result?.status !== "success") {
        return [];
      }

      return [{ patient, mealPlans: result.data }];
    });
  }, [linkageQueries, patientCandidates]);

  if (usersQuery.isLoading) {
    return <LoadingState message="Carregando painel..." />;
  }

  if (usersQuery.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar o painel"
        message={getErrorMessage(usersQuery.error, "Não foi possível carregar os dados.")}
        onRetry={() => void usersQuery.refetch()}
      />
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Painel do nutricionista"
        subtitle="Acompanhe pacientes vinculados, progresso diário e contexto do plano alimentar ativo."
      />

      {linkedPatients.length === 0 ? (
        <EmptyState
          title="Nenhum paciente vinculado disponível"
          description="Os pacientes vinculados aparecerão aqui para acompanhamento."
        />
      ) : (
        <Stack spacing={2}>
          {linkedPatients.map(({ patient, mealPlans }) => (
            <PatientAccordion
              key={patient.id}
              patient={patient}
              mealPlans={mealPlans}
              token={session?.token ?? null}
              date={date}
              expanded={expandedPatientId === patient.id}
              onExpandedChange={(expanded) => {
                setExpandedPatientId(expanded ? patient.id : false);
              }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function PatientAccordion({
  patient,
  mealPlans,
  token,
  date,
  expanded,
  onExpandedChange,
}: {
  patient: AppUser;
  mealPlans: MealPlan[];
  token: string | null;
  date: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}) {
  const progressQuery = useQuery({
    queryKey: ["nutritionist-patient-progress", patient.id, date],
    enabled: expanded && Boolean(token),
    queryFn: () =>
      apiClient.get<DailyMacroProgress>(
        `/api/daily-macro-logs/patient/${patient.id}/progress?date=${date}`,
        { token },
      ),
    retry: false,
  });

  const summaryQuery = useQuery({
    queryKey: ["nutritionist-patient-summary", patient.id, date],
    enabled: expanded && Boolean(token),
    queryFn: () =>
      apiClient.get<MealCompletionSummary>(
        `/api/meal-completions/patient/${patient.id}/summary?date=${date}`,
        { token },
      ),
    retry: false,
  });

  const activePlan = mealPlans.find((plan) => plan.isActive) ?? null;

  return (
    <Accordion expanded={expanded} onChange={(_, nextExpanded) => onExpandedChange(nextExpanded)}>
      <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ width: "100%", pr: 1, justifyContent: "space-between" }}
        >
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <PersonRoundedIcon color="primary" />
            <div>
              <Typography variant="h3">{patient.name}</Typography>
              <Typography color="text.secondary">{patient.email}</Typography>
            </div>
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
            <Chip label={activePlan ? `Plano ativo: ${activePlan.title}` : "Sem plano ativo"} />
            <Chip label={`${mealPlans.length} plano${mealPlans.length === 1 ? "" : "s"}`} variant="outlined" />
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        {progressQuery.isLoading || summaryQuery.isLoading ? (
          <LoadingState message="Carregando detalhes do paciente..." />
        ) : progressQuery.isError || summaryQuery.isError ? (
          <ErrorState
            title="Resumo do paciente indisponível"
            message={getErrorMessage(progressQuery.error ?? summaryQuery.error, "Não foi possível carregar os dados do paciente.")}
          />
        ) : progressQuery.data && summaryQuery.data ? (
          <Stack spacing={2.5}>
            <AppCard>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                sx={{ justifyContent: "space-between" }}
              >
                <div>
                  <Typography variant="h3">Progresso diário</Typography>
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    {progressQuery.data.mealPlan.title}
                  </Typography>
                </div>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                  <Chip label={`${summaryQuery.data.completedMeals}/${summaryQuery.data.totalMeals} refeições concluídas`} color="primary" />
                  <Chip label={`${summaryQuery.data.pendingMeals} pendentes`} variant="outlined" />
                </Stack>
              </Stack>
            </AppCard>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <MacroProgressCard
                  label="Calorias"
                  unit="kcal"
                  consumed={progressQuery.data.consumed.calories}
                  goal={progressQuery.data.goals.calories}
                  remaining={progressQuery.data.remaining.calories}
                  progress={progressQuery.data.progress.calories}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <MacroProgressCard
                  label="Proteína"
                  unit="g"
                  consumed={progressQuery.data.consumed.protein}
                  goal={progressQuery.data.goals.protein}
                  remaining={progressQuery.data.remaining.protein}
                  progress={progressQuery.data.progress.protein}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <MacroProgressCard
                  label="Carboidratos"
                  unit="g"
                  consumed={progressQuery.data.consumed.carbs}
                  goal={progressQuery.data.goals.carbs}
                  remaining={progressQuery.data.remaining.carbs}
                  progress={progressQuery.data.progress.carbs}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                <MacroProgressCard
                  label="Gorduras"
                  unit="g"
                  consumed={progressQuery.data.consumed.fat}
                  goal={progressQuery.data.goals.fat}
                  remaining={progressQuery.data.remaining.fat}
                  progress={progressQuery.data.progress.fat}
                />
              </Grid>
            </Grid>
          </Stack>
        ) : (
          <EmptyState
            title="Nenhum dado disponível ainda"
            description="Este paciente ainda não possui dados suficientes para exibir o progresso."
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
}
