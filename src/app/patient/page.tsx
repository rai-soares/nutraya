"use client";

import { AppLayout } from "@/modules/app-shell/components/app-layout";
import { PageContainer } from "@/modules/app-shell/components/page-container";
import { ProtectedRoute } from "@/modules/app-shell/components/protected-route";
import { PatientHomeScreen } from "@/modules/patient/components/patient-home-screen";

export default function PatientPage() {
  return (
    <ProtectedRoute allowedRoles={["PATIENT"]}>
      <AppLayout role="PATIENT" title="Patient home">
        <PageContainer>
          <PatientHomeScreen />
        </PageContainer>
      </AppLayout>
    </ProtectedRoute>
  );
}
