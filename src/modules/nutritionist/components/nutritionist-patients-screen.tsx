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
    return <LoadingState message="Loading linked patients..." />;
  }

  if (patientsQuery.isError) {
    return (
      <ErrorState
        message={patientsQuery.error instanceof Error ? patientsQuery.error.message : "Unable to load patients."}
        onRetry={() => void patientsQuery.refetch()}
      />
    );
  }

  return (
    <>
      <Stack spacing={3}>
        <PageHeader
          title="Patients"
          subtitle="Create or link patients here so you can configure their plan before testing the patient flow."
          action={
            <Button
              variant="contained"
              startIcon={<AddRoundedIcon />}
              onClick={() => setIsDialogOpen(true)}
            >
              Add patient
            </Button>
          }
        />

        {createPatientMutation.isSuccess ? (
          <Alert severity="success">Patient saved and linked successfully.</Alert>
        ) : null}

        {!patientsQuery.data || patientsQuery.data.length === 0 ? (
          <EmptyState
            title="No patients linked yet"
            description="Create the first patient to start configuring macro goals and meal plans."
            actionLabel="Create patient"
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
          createPatientMutation.isError && createPatientMutation.error instanceof Error
            ? createPatientMutation.error.message
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
