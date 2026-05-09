"use client";

import { AppLayout } from "@/modules/app-shell/components/app-layout";
import { PageContainer } from "@/modules/app-shell/components/page-container";
import { ProtectedRoute } from "@/modules/app-shell/components/protected-route";
import { PatientChatScreen } from "@/modules/chat/components/patient-chat-screen";

export default function PatientChatPage() {
  return (
    <ProtectedRoute allowedRoles={["PATIENT"]}>
      <AppLayout role="PATIENT" title="Mensagens">
        <PageContainer>
          <PatientChatScreen />
        </PageContainer>
      </AppLayout>
    </ProtectedRoute>
  );
}
