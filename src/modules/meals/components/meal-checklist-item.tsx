import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import { Button, Chip, Divider, Stack, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
import { MetricPill } from "@/modules/app-shell/components/metric-pill";
import { formatScheduledTime } from "@/modules/shared/utils/date";

type MealChecklistItemProps = {
  meal: {
    id: string;
    name: string;
    description: string | null;
    scheduledTime: string | null;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    completed: boolean;
  };
  substitutionRequest?: {
    id: string;
    appliedToDailyLog: boolean;
  } | null;
  isPending?: boolean;
  onToggle: (mealId: string, completed: boolean) => void;
  onRequestSubstitution?: (mealId: string) => void;
  onViewSubstitutionRequest?: (substitutionId: string) => void;
};

export function MealChecklistItem({
  meal,
  substitutionRequest = null,
  isPending = false,
  onToggle,
  onRequestSubstitution,
  onViewSubstitutionRequest,
}: MealChecklistItemProps) {
  return (
    <AppCard
      sx={{
        borderColor: meal.completed ? "rgba(47, 143, 102, 0.22)" : undefined,
        backgroundColor: meal.completed ? "rgba(246, 255, 250, 0.96)" : undefined,
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <Stack spacing={0.9}>
            <Typography variant="h3">{meal.name}</Typography>
            <Typography color="text.secondary">
              {formatScheduledTime(meal.scheduledTime)}
            </Typography>
          </Stack>

          <Chip
            label={meal.completed ? "Concluída" : "Pendente"}
            color={meal.completed ? "success" : "default"}
            variant={meal.completed ? "filled" : "outlined"}
          />
        </Stack>

        {meal.description ? (
          <Typography color="text.secondary">{meal.description}</Typography>
        ) : null}

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          <MetricPill label={`${meal.calories} kcal`} tone="default" />
          <MetricPill label={`${meal.protein}g proteína`} tone="primary" />
          <MetricPill label={`${meal.carbs}g carboidratos`} tone="default" />
          <MetricPill label={`${meal.fat}g gorduras`} tone="warning" />
          {substitutionRequest ? (
            <MetricPill
              label={
                substitutionRequest.appliedToDailyLog
                  ? "Substituição aplicada"
                  : "Substituição aguardando aplicação"
              }
              tone={substitutionRequest.appliedToDailyLog ? "success" : "warning"}
            />
          ) : null}
        </Stack>

        <Divider />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant={meal.completed ? "outlined" : "contained"}
            disabled={isPending}
            startIcon={
              meal.completed ? (
                <CheckCircleRoundedIcon />
              ) : (
                <RadioButtonUncheckedRoundedIcon />
              )
            }
            onClick={() => onToggle(meal.id, meal.completed)}
          >
            {isPending
              ? "Salvando..."
              : meal.completed
                ? "Desfazer conclusão"
                : "Concluir refeição"}
          </Button>
          {onRequestSubstitution ? (
            <Button
              variant="text"
              disabled={isPending}
              onClick={() => onRequestSubstitution(meal.id)}
            >
              Solicitar substituição
            </Button>
          ) : null}
          {substitutionRequest && onViewSubstitutionRequest ? (
            <Button
              variant="text"
              disabled={isPending}
              onClick={() => onViewSubstitutionRequest(substitutionRequest.id)}
            >
              Ver solicitação
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </AppCard>
  );
}
