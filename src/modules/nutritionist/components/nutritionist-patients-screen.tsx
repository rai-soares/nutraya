"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { Alert, Button, Stack } from "@mui/material";

import { useAuth } from "@/modules/auth/auth-context";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ErrorState } from "@/modules/app-shell/components/error-state";
import { LoadingState } from "@/modules/app-shell/components/loading-state";
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
    return <LoadingState message="Carregando pacientes..." />;
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
          title="Pacientes"
          subtitle="Crie e acompanhe seus pacientes para configurar metas, plano alimentar e acompanhamento diário."
          action={
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setIsDialogOpen(true)}
            >
              Criar paciente
            </Button>
          }
        />

        {createPatientMutation.isSuccess ? (
          <Alert severity="success">Paciente criado com sucesso.</Alert>
        ) : null}

        {!patientsQuery.data || patientsQuery.data.length === 0 ? (
          <EmptyState
            title="Nenhum paciente cadastrado ainda."
            description="Crie seu primeiro paciente para começar."
            actionLabel="Criar paciente"
            onAction={() => setIsDialogOpen(true)}
          />
        ) : (
          <Stack spacing={2}>
            {patientsQuery.data.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
            ))}
          </Stack>
        )}
      </Stack>

      <CreatePatientDialog
        isOpen={isDialogOpen}
        isSubmitting={createPatientMutation.isPending}
        errorMessage={
          createPatientMutation.isError
            ? getErrorMessage(createPatientMutation.error, "Não foi possível salvar o paciente.")
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
