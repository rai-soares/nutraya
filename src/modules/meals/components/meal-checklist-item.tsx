import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import {
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
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
        borderColor: meal.completed ? "rgba(22, 163, 74, 0.28)" : undefined,
        backgroundColor: meal.completed ? "rgba(240, 253, 244, 0.96)" : undefined,
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <Stack spacing={0.75}>
            <Typography variant="h3">{meal.name}</Typography>
            <Typography color="text.secondary">{formatScheduledTime(meal.scheduledTime)}</Typography>
          </Stack>
          <Chip
            color={meal.completed ? "success" : "default"}
            icon={
              meal.completed ? (
                <CheckCircleRoundedIcon />
              ) : (
                <RadioButtonUncheckedRoundedIcon />
              )
            }
            label={meal.completed ? "Concluída" : "Pendente"}
            variant={meal.completed ? "filled" : "outlined"}
          />
        </Stack>

        {meal.description ? (
          <Typography color="text.secondary">{meal.description}</Typography>
        ) : null}

        <Divider />

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          <Chip label={`${meal.calories} kcal`} size="small" />
          <Chip label={`${meal.protein}g proteína`} size="small" />
          <Chip label={`${meal.carbs}g carboidratos`} size="small" />
          <Chip label={`${meal.fat}g gorduras`} size="small" />
          {substitutionRequest ? (
            <Chip
              label={
                substitutionRequest.appliedToDailyLog
                  ? "Substituição aplicada"
                  : "Substituição aguardando sincronização"
              }
              size="small"
              color={substitutionRequest.appliedToDailyLog ? "success" : "warning"}
              variant={substitutionRequest.appliedToDailyLog ? "filled" : "outlined"}
            />
          ) : null}
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button
            variant={meal.completed ? "outlined" : "contained"}
            disabled={isPending}
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
