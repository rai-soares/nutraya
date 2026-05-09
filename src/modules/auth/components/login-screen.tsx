"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/modules/auth/auth-context";
import {
  AuthFormCard,
  type AuthFormValues,
} from "@/modules/auth/components/auth-form-card";
import { getRoleHomePath } from "@/modules/auth/auth-storage";
import { apiClient } from "@/modules/shared/api/api-client";
import type { AuthResponse } from "@/modules/shared/types/api";

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();

  return (
    <AuthFormCard
      mode="login"
      onSubmit={async (values: AuthFormValues) => {
        const result = await apiClient.post<AuthResponse>("/api/auth/login", {
          email: values.email,
          password: values.password,
        });

        setSession(result);
        const next = searchParams.get("next");
        const destination = next || getRoleHomePath(result.user.role);

        router.replace(destination);
      }}
    />
  );
}
