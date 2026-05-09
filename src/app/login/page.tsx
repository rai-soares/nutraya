import { Suspense } from "react";

import { LoadingState } from "@/modules/app-shell/components/loading-state";
import { LoginScreen } from "@/modules/auth/components/login-screen";

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState message="Carregando acesso..." />}>
      <LoginScreen />
    </Suspense>
  );
}
