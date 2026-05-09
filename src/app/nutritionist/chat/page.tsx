"use client";

import { AppLayout } from "@/modules/app-shell/components/app-layout";
import { PageContainer } from "@/modules/app-shell/components/page-container";
import { ProtectedRoute } from "@/modules/app-shell/components/protected-route";
import { NutritionistChatScreen } from "@/modules/chat/components/nutritionist-chat-screen";

export default function NutritionistChatPage() {
  return (
    <ProtectedRoute allowedRoles={["NUTRI"]}>
      <AppLayout role="NUTRI" title="Chat">
        <PageContainer>
          <NutritionistChatScreen />
        </PageContainer>
      </AppLayout>
    </ProtectedRoute>
  );
}
