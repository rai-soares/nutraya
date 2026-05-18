"use client";

import { AppLayout } from "@/modules/app-shell/components/app-layout";
import { PageContainer } from "@/modules/app-shell/components/page-container";
import { ProtectedRoute } from "@/modules/app-shell/components/protected-route";
import { PatientHistoryScreen } from "@/modules/patient/components/patient-history-screen";

export default function PatientHistoryPage() {
  return (
    <ProtectedRoute allowedRoles={["PATIENT"]}>
      <AppLayout role="PATIENT" title="Histórico do paciente">
        <PageContainer>
          <PatientHistoryScreen />
        </PageContainer>
      </AppLayout>
    </ProtectedRoute>
  );
}
