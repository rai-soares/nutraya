import { ApiClientError } from "@/modules/shared/api/api-client";

export const AI_ESTIMATION_DISCLAIMER =
  "Esta é uma estimativa aproximada com base na imagem. Os valores podem variar conforme a porção real, óleo, molhos, ingredientes ocultos e modo de preparo.";

const errorMessageMap: Record<string, string> = {
  "Authentication required.": "Faça login para continuar.",
  "Invalid or expired token.": "Sua sessão expirou. Faça login novamente.",
  "Insufficient permissions.": "Você não tem permissão para acessar este recurso.",
  "Invalid email or password.": "E-mail ou senha inválidos.",
  "Unable to continue.": "Não foi possível continuar.",
  "Request failed.": "Não foi possível concluir a solicitação.",
  "Internal server error.": "Ocorreu um erro interno. Tente novamente em alguns instantes.",
  "Invalid request payload.": "Dados inválidos. Revise os campos e tente novamente.",
  "Resource already exists.": "Este registro já existe.",
  "Macro goal not found.": "Metas de macros não encontradas.",
  "Active meal plan not found.": "Plano alimentar ativo não encontrado.",
  "Patient profile not found.": "Paciente não encontrado.",
  "Patient is not linked to this nutritionist.": "Este paciente não está vinculado a este nutricionista.",
  "Patient is not linked to a nutritionist.": "Este paciente ainda não está vinculado a um nutricionista.",
  "Nutritionist user not found.": "Nutricionista não encontrado.",
  "Conversation not found.": "Conversa não encontrada.",
  "Message text is required.": "Digite uma mensagem para enviar.",
  "Image URL is required.": "A imagem da mensagem é obrigatória.",
  "Message participants do not match the conversation.": "Não foi possível enviar a mensagem nesta conversa.",
  "Unsupported image type. Use JPG, JPEG, PNG, or WEBP.": "Formato de imagem não suportado. Use JPG, JPEG, PNG ou WEBP.",
  "Image file is too large. Maximum size is 5MB.": "A imagem é muito grande. O tamanho máximo é 5 MB.",
  "Unable to use this image.": "Não foi possível usar esta imagem.",
  "Select a patient conversation first.": "Selecione uma conversa de paciente primeiro.",
  "Create and activate a meal plan before adding meals.": "Crie e ative um plano alimentar antes de adicionar refeições.",
  "Meal image URL is invalid.": "A imagem da refeição é inválida.",
  "Meal image could not be accessed for estimation.": "Não foi possível acessar a imagem da refeição para análise.",
  "Meal image is unsupported or empty.": "A imagem da refeição é inválida ou está vazia.",
  "AI estimation timed out. Please try again.": "A análise da imagem demorou mais do que o esperado. Tente novamente.",
  "AI estimation returned an empty result.": "A análise da imagem não retornou resultado.",
  "AI estimation is unavailable right now.": "A análise da imagem não está disponível no momento.",
  "Gemini request failed. Check the API key and model configuration.": "A configuração da análise de imagem está indisponível no momento.",
};

export function toPtBrErrorMessage(message: string, fallback?: string) {
  return errorMessageMap[message] ?? fallback ?? message;
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError) {
    return toPtBrErrorMessage(error.message, fallback);
  }

  if (error instanceof Error) {
    return toPtBrErrorMessage(error.message, fallback);
  }

  return fallback;
}

export function getConfidenceLabel(confidence?: string | null) {
  switch (confidence) {
    case "HIGH":
      return "Alta";
    case "MEDIUM":
      return "Média";
    case "LOW":
      return "Baixa";
    default:
      return "Não informada";
  }
}
