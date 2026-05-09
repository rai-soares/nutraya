"use client";

import { AppLayout } from "@/modules/app-shell/components/app-layout";
import { PageContainer } from "@/modules/app-shell/components/page-container";
import { ProtectedRoute } from "@/modules/app-shell/components/protected-route";
import { NutritionistSubstitutionRequestsScreen } from "@/modules/nutritionist/components/nutritionist-substitution-requests-screen";

export default function NutritionistSubstitutionsPage() {
  return (
    <ProtectedRoute allowedRoles={["NUTRI"]}>
      <AppLayout role="NUTRI" title="Solicitações de substituição">
        <PageContainer>
          <NutritionistSubstitutionRequestsScreen />
        </PageContainer>
      </AppLayout>
    </ProtectedRoute>
  );
}
