"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Alert, Button, Grid, Stack } from "@mui/material";

import { useAuth } from "@/modules/auth/auth-context";
import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ErrorState } from "@/modules/app-shell/components/error-state";
import { LoadingState } from "@/modules/app-shell/components/loading-state";
import { MetricPill } from "@/modules/app-shell/components/metric-pill";
import { PageHeader } from "@/modules/app-shell/components/page-header";
import { CreatePatientDialog } from "@/modules/nutritionist/components/create-patient-dialog";
import { PatientCard } from "@/modules/nutritionist/components/patient-card";
import {
  createNutritionistPatient,
  listNutritionistPatients,
  type CreateNutritionistPatientPayload,
} from "@/modules/nutritionist/nutritionist.api";
import { getErrorMessage } from "@/modules/shared/utils/pt-br";

export function NutritionistPatientsScreen() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const patientsQuery = useQuery({
    queryKey: ["nutritionist-patients", session?.user.id],
    enabled: Boolean(session?.token),
    queryFn: () => listNutritionistPatients({ token: session?.token ?? "" }),
  });

  const createPatientMutation = useMutation({
    mutationFn: async (payload: CreateNutritionistPatientPayload) => {
      return createNutritionistPatient(payload, { token: session?.token ?? "" });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["nutritionist-patients", session?.user.id],
      });
      setIsDialogOpen(false);
    },
  });

  if (patientsQuery.isLoading) {
    return <LoadingState message="Carregando..." />;
  }

  if (patientsQuery.isError) {
    return (
      <ErrorState
        title="Não foi possível carregar os pacientes"
        message={getErrorMessage(patientsQuery.error, "Não foi possível carregar os dados.")}
        onRetry={() => void patientsQuery.refetch()}
      />
    );
  }

  return (
    <>
      <Stack spacing={3}>
        <PageHeader
          eyebrow="Relacionamentos"
          title="Pacientes"
          subtitle="Gerencie os pacientes vinculados ao seu acompanhamento."
          action={
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setIsDialogOpen(true)}
            >
              Adicionar paciente
            </Button>
          }
        />

        <AppCard>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
          >
            <div>
              <MetricPill
                label={`${patientsQuery.data?.length ?? 0} pacientes vinculados`}
                tone="primary"
              />
            </div>
            <MetricPill label="Acompanhamento em um só lugar" tone="default" />
          </Stack>
        </AppCard>

        {createPatientMutation.isSuccess ? (
          <Alert severity="success">Paciente criado com sucesso.</Alert>
        ) : null}

        {!patientsQuery.data || patientsQuery.data.length === 0 ? (
          <EmptyState
            title="Nenhum paciente cadastrado"
            description="Adicione seu primeiro paciente para configurar metas, plano alimentar e acompanhamento."
            actionLabel="Adicionar paciente"
            onAction={() => setIsDialogOpen(true)}
          />
        ) : (
          <Grid container spacing={2.5}>
            {patientsQuery.data.map((patient) => (
              <Grid key={patient.id} size={{ xs: 12, md: 6, xl: 4 }}>
                <PatientCard patient={patient} />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      <CreatePatientDialog
        isOpen={isDialogOpen}
        isSubmitting={createPatientMutation.isPending}
        errorMessage={
          createPatientMutation.isError
            ? getErrorMessage(createPatientMutation.error, "Não foi possível salvar as alterações.")
            : null
        }
        onClose={() => setIsDialogOpen(false)}
        onSubmit={async (values) => {
          await createPatientMutation.mutateAsync(values);
        }}
      />
    </>
  );
}
