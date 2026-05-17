import { apiClient } from "@/modules/shared/api/api-client";

export type ForgotPasswordResponse = {
  message: string;
};

export type ResetPasswordResponse = {
  message: string;
};

export function requestPasswordReset(email: string) {
  return apiClient.post<ForgotPasswordResponse>("/api/auth/forgot-password", {
    email,
  });
}

export function submitPasswordReset(token: string, password: string) {
  return apiClient.post<ResetPasswordResponse>("/api/auth/reset-password", {
    token,
    password,
  });
}
