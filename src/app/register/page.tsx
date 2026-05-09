"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/modules/auth/auth-context";
import { AuthFormCard, type AuthFormValues } from "@/modules/auth/components/auth-form-card";
import { getRoleHomePath } from "@/modules/auth/auth-storage";
import { apiClient } from "@/modules/shared/api/api-client";
import type { AuthResponse } from "@/modules/shared/types/api";

export default function RegisterPage() {
  const router = useRouter();
  const { setSession } = useAuth();

  return (
    <AuthFormCard
      mode="register"
      onSubmit={async (values: AuthFormValues) => {
        const result = await apiClient.post<AuthResponse>("/api/auth/register", {
          name: values.name,
          email: values.email,
          password: values.password,
        });

        setSession(result);

        router.replace(getRoleHomePath(result.user.role));
      }}
    />
  );
}
