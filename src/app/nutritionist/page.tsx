"use client";

import { AppLayout } from "@/modules/app-shell/components/app-layout";
import { PageContainer } from "@/modules/app-shell/components/page-container";
import { ProtectedRoute } from "@/modules/app-shell/components/protected-route";
import { NutritionistPatientsScreen } from "@/modules/nutritionist/components/nutritionist-patients-screen";

export default function NutritionistPage() {
  return (
    <ProtectedRoute allowedRoles={["NUTRI"]}>
      <AppLayout role="NUTRI" title="Pacientes">
        <PageContainer>
          <NutritionistPatientsScreen />
        </PageContainer>
      </AppLayout>
    </ProtectedRoute>
  );
}
