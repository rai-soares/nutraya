"use client";

import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import {
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import type { Meal } from "@/modules/shared/types/api";

export function MealList({
  deletingMealId,
  meals,
  onDelete,
  onEdit,
}: {
  deletingMealId?: string | null;
  meals: Meal[];
  onDelete: (meal: Meal) => void;
  onEdit: (meal: Meal) => void;
}) {
  if (meals.length === 0) {
    return (
      <EmptyState
        title="No meals in the active plan"
        description="Add meals to give the patient a real daily routine to follow."
      />
    );
  }

  return (
    <Stack spacing={2}>
      {meals.map((meal) => (
        <AppCard key={meal.id}>
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" } }}
            >
              <div>
                <Typography variant="h3">
                  {meal.order}. {meal.name}
                </Typography>
                {meal.description ? (
                  <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                    {meal.description}
                  </Typography>
                ) : null}
              </div>

              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
                {meal.scheduledTime ? (
                  <Chip icon={<AccessTimeRoundedIcon />} label={meal.scheduledTime} />
                ) : null}
                <Chip label={`${meal.calories} kcal`} color="primary" variant="outlined" />
                <Chip label={`${meal.protein}P / ${meal.carbs}C / ${meal.fat}F`} variant="outlined" />
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
              <Button
                variant="outlined"
                startIcon={<EditRoundedIcon />}
                onClick={() => onEdit(meal)}
              >
                Edit
              </Button>
              <Button
                color="error"
                variant="text"
                startIcon={<DeleteRoundedIcon />}
                disabled={deletingMealId === meal.id}
                onClick={() => onDelete(meal)}
              >
                {deletingMealId === meal.id ? "Deleting..." : "Delete"}
              </Button>
            </Stack>
          </Stack>
        </AppCard>
      ))}
    </Stack>
  );
}
