"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from "@mui/material";

import { useAuth } from "@/modules/auth/auth-context";
import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ErrorState } from "@/modules/app-shell/components/error-state";
import { LoadingState } from "@/modules/app-shell/components/loading-state";
import { MetricPill } from "@/modules/app-shell/components/metric-pill";
import { PageHeader } from "@/modules/app-shell/components/page-header";
import { SectionCard } from "@/modules/app-shell/components/section-card";
import {
  listNutritionistMealSubstitutions,
  saveNutritionistMealSubstitutionFeedback,
} from "@/modules/meal-substitutions/meal-substitution.api";
import { SubstitutionCard } from "@/modules/meal-substitutions/components/substitution-card";
import { listNutritionistPatients } from "@/modules/nutritionist/nutritionist.api";
import type { MealSubstitution } from "@/modules/shared/types/api";
import { getErrorMessage } from "@/modules/shared/utils/pt-br";

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
    queryKey: ["nutritionist-meal-substitutions", session?.user.id, selectedPatientId],
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
          queryKey: ["nutritionist-patient", activeFeedbackSubstitution?.patientId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["patient-meal-substitutions"],
        }),
      ]);
    },
  });

  const appliedCount = useMemo(
    () =>
      (substitutionsQuery.data ?? []).filter((substitution) => substitution.appliedToDailyLog)
        .length,
    [substitutionsQuery.data],
  );

  if (patientsQuery.isLoading || substitutionsQuery.isLoading) {
    return <LoadingState message="Carregando..." />;
  }

  if (patientsQuery.isError) {
    return (
      <ErrorState
        title="Pacientes indisponíveis"
        message={getErrorMessage(patientsQuery.error, "Não foi possível carregar os dados.")}
        onRetry={() => void patientsQuery.refetch()}
      />
    );
  }

  if (substitutionsQuery.isError) {
    return (
      <ErrorState
        title="Substituições indisponíveis"
        message={getErrorMessage(substitutionsQuery.error, "Não foi possível carregar os dados.")}
        onRetry={() => void substitutionsQuery.refetch()}
      />
    );
  }

  return (
    <>
      <Stack spacing={3}>
        <PageHeader
          eyebrow="Solicitações"
          title="Substituições"
          subtitle="As solicitações de substituição enviadas pelos pacientes aparecerão aqui."
        />

        <AppCard>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { lg: "center" } }}
          >
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              <MetricPill label={`${substitutionsQuery.data?.length ?? 0} no total`} tone="primary" />
              <MetricPill label={`${appliedCount} aplicadas`} tone="success" />
            </Stack>

            <TextField
              select
              label="Filtrar por paciente"
              value={selectedPatientId}
              onChange={(event) => setSelectedPatientId(event.target.value)}
              sx={{ minWidth: { xs: "100%", sm: 280 } }}
            >
              <MenuItem value="all">Todos os pacientes vinculados</MenuItem>
              {(patientsQuery.data ?? []).map((patient) => (
                <MenuItem key={patient.patient.id} value={patient.patient.id}>
                  {patient.patient.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </AppCard>

        {feedbackMutation.isError ? (
          <Alert severity="error">
            {getErrorMessage(feedbackMutation.error, "Não foi possível salvar as alterações.")}
          </Alert>
        ) : null}

        {!substitutionsQuery.data || substitutionsQuery.data.length === 0 ? (
          <EmptyState
            title="Nenhuma solicitação encontrada"
            description="As solicitações de substituição enviadas pelos pacientes aparecerão aqui."
          />
        ) : (
          <SectionCard
            title="Substituições aplicadas"
            description="Revise a foto enviada, a estimativa da IA e o feedback do nutricionista."
          >
            <Stack spacing={2}>
              {substitutionsQuery.data.map((substitution) => (
                <SubstitutionCard
                  key={substitution.id}
                  substitution={substitution}
                  onEditFeedback={() => {
                    setActiveFeedbackSubstitution(substitution);
                    setFeedback(substitution.nutritionistFeedback ?? "");
                  }}
                />
              ))}
            </Stack>
          </SectionCard>
        )}
      </Stack>

      <Dialog
        open={Boolean(activeFeedbackSubstitution)}
        onClose={feedbackMutation.isPending ? undefined : () => setActiveFeedbackSubstitution(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Feedback do nutricionista</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography color="text.secondary">
              {activeFeedbackSubstitution?.patient.name} enviou uma solicitação para{" "}
              {activeFeedbackSubstitution?.meal.name}.
            </Typography>
            <TextField
              label="Feedback do nutricionista"
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              multiline
              minRows={3}
              placeholder="Adicione uma observação curta para o paciente."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setActiveFeedbackSubstitution(null)}
            disabled={feedbackMutation.isPending}
          >
            Cancelar
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
            {feedbackMutation.isPending ? "Salvando..." : "Salvar feedback"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
