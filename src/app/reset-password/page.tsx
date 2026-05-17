import { Suspense } from "react";

import { ResetPasswordScreen } from "@/modules/auth/components/reset-password-screen";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordScreen />
    </Suspense>
  );
}
