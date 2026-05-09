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
    status: "PENDING" | "APPROVED" | "REJECTED";
  } | null;
  isPending?: boolean;
  onToggle: (mealId: string, completed: boolean) => void;
  onRequestSubstitution?: (mealId: string) => void;
};

export function MealChecklistItem({
  meal,
  substitutionRequest = null,
  isPending = false,
  onToggle,
  onRequestSubstitution,
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
          direction="row"
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
            label={meal.completed ? "Completed" : "Pending"}
            variant={meal.completed ? "filled" : "outlined"}
          />
        </Stack>

        {meal.description ? (
          <Typography color="text.secondary">{meal.description}</Typography>
        ) : null}

        <Divider />

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          <Chip label={`${meal.calories} kcal`} size="small" />
          <Chip label={`${meal.protein}g protein`} size="small" />
          <Chip label={`${meal.carbs}g carbs`} size="small" />
          <Chip label={`${meal.fat}g fat`} size="small" />
          {substitutionRequest ? (
            <Chip
              label={`Substitution ${substitutionRequest.status.toLowerCase()}`}
              size="small"
              color={
                substitutionRequest.status === "APPROVED"
                  ? "success"
                  : substitutionRequest.status === "REJECTED"
                    ? "error"
                    : "warning"
              }
              variant={
                substitutionRequest.status === "PENDING" ? "filled" : "outlined"
              }
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
              ? "Saving..."
              : meal.completed
                ? "Mark as pending"
                : "Mark as completed"}
          </Button>
          {onRequestSubstitution ? (
            <Button
              variant="text"
              disabled={isPending}
              onClick={() => onRequestSubstitution(meal.id)}
            >
              Request substitution
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </AppCard>
  );
}
