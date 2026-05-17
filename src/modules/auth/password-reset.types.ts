import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MIN_LENGTH_MESSAGE =
  "Password must be at least 6 characters.";

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE);

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Token is required."),
  password: passwordSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const FORGOT_PASSWORD_MESSAGE =
  "Se este e-mail estiver cadastrado, enviaremos instruções para redefinir sua senha.";
export const RESET_PASSWORD_SUCCESS_MESSAGE =
  "Senha redefinida com sucesso.";
export const RESET_PASSWORD_INVALID_MESSAGE =
  "Link inválido ou expirado. Solicite uma nova redefinição de senha.";

export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 30;
