import { Chip } from "@mui/material";

import type {
  MealMacroConfidence,
  MealSubstitutionStatus,
} from "@/modules/shared/types/api";

const substitutionLabels: Record<
  MealSubstitutionStatus | "APPLIED",
  { label: string; color: "default" | "warning" | "success" | "error" }
> = {
  PENDING: { label: "Pendente", color: "warning" },
  APPROVED: { label: "Aprovada", color: "success" },
  REJECTED: { label: "Rejeitada", color: "error" },
  APPLIED: { label: "Aplicada ao progresso", color: "success" },
};

const confidenceLabels: Record<
  MealMacroConfidence,
  { label: string; color: "default" | "warning" | "success" }
> = {
  LOW: { label: "Confiança baixa", color: "default" },
  MEDIUM: { label: "Confiança média", color: "warning" },
  HIGH: { label: "Confiança alta", color: "success" },
};

export function StatusChip({
  type,
  value,
}: {
  type: "substitution" | "confidence";
  value: MealSubstitutionStatus | MealMacroConfidence | "APPLIED";
}) {
  const config =
    type === "substitution"
      ? substitutionLabels[value as MealSubstitutionStatus | "APPLIED"]
      : confidenceLabels[value as MealMacroConfidence];

  return (
    <Chip
      label={config.label}
      color={config.color}
      variant={config.color === "default" ? "outlined" : "filled"}
      size="small"
    />
  );
}
