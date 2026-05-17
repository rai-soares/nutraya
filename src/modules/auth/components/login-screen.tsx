"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/modules/auth/auth-context";
import {
  AuthFormCard,
  type AuthFormValues,
} from "@/modules/auth/components/auth-form-card";
import { getRoleHomePath, LOGIN_ROLE_QUERY_KEY } from "@/modules/auth/auth-storage";
import { apiClient } from "@/modules/shared/api/api-client";
import type { AuthResponse, UserRole } from "@/modules/shared/types/api";

export function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const selectedRole = searchParams.get(LOGIN_ROLE_QUERY_KEY) as UserRole | null;
  const showRegisterLink = selectedRole !== "PATIENT";

  return (
    <AuthFormCard
      mode="login"
      showRegisterLink={showRegisterLink}
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
