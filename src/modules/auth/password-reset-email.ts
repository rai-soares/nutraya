import { Resend } from "resend";

import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from "./password-reset.types";

type SendPasswordResetEmailInput = {
  to: string;
  name: string;
  resetUrl: string;
};

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return new Resend(apiKey);
}

function getMailFrom() {
  const mailFrom = process.env.MAIL_FROM;

  if (!mailFrom) {
    throw new Error("MAIL_FROM is not configured.");
  }

  return mailFrom;
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: SendPasswordResetEmailInput) {
  const resend = getResendClient();

  await resend.emails.send({
    from: getMailFrom(),
    to,
    subject: "Redefinição de senha - Nutraya",
    html: `
      <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.6;">
        <p>Olá, ${escapeHtml(name)}.</p>
        <p>Recebemos uma solicitação para redefinir sua senha no Nutraya.</p>
        <p>
          <a
            href="${escapeHtml(resetUrl)}"
            style="display: inline-block; padding: 12px 20px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700;"
          >
            Redefinir senha
          </a>
        </p>
        <p>Se preferir, copie e cole este link no navegador:</p>
        <p>${escapeHtml(resetUrl)}</p>
        <p>Este link expira em ${PASSWORD_RESET_TOKEN_TTL_MINUTES} minutos.</p>
        <p>Se você não solicitou a redefinição, ignore este e-mail.</p>
      </div>
    `,
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
