import { Box, Button, Divider, Stack, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
import { ImagePreview } from "@/modules/app-shell/components/image-preview";
import { MetricPill } from "@/modules/app-shell/components/metric-pill";
import { StatusChip } from "@/modules/app-shell/components/status-chip";
import { MealSubstitutionEstimationPanel } from "@/modules/meal-substitutions/components/meal-substitution-estimation-panel";
import type { MealSubstitution } from "@/modules/shared/types/api";
import { formatFriendlyDate } from "@/modules/shared/utils/date";

export function SubstitutionCard({
  substitution,
  onEditFeedback,
}: {
  substitution: MealSubstitution;
  onEditFeedback: () => void;
}) {
  return (
    <AppCard>
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
        >
          <div>
            <Typography variant="h3">{substitution.meal.name}</Typography>
            <Typography color="text.secondary">{substitution.patient.name}</Typography>
          </div>
          <StatusChip
            type="substitution"
            value={substitution.appliedToDailyLog ? "APPLIED" : substitution.status}
          />
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          <MetricPill label="Foto enviada" tone="default" />
          <MetricPill label={substitution.appliedToDailyLog ? "Aplicada ao progresso" : "Aguardando aplicação"} tone={substitution.appliedToDailyLog ? "success" : "warning"} />
        </Stack>

        <Stack direction={{ xs: "column", lg: "row" }} spacing={2.5}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Foto enviada
            </Typography>
            <ImagePreview
              src={substitution.imageUrl}
              alt={`${substitution.patient.name} - substituição de ${substitution.meal.name}`}
              maxHeight={360}
            />
          </Box>

          <Stack spacing={2} sx={{ flex: 1.15 }}>
            <Box>
              <Typography variant="subtitle2">Observação do paciente</Typography>
              <Typography color="text.secondary">
                {substitution.note || "Nenhuma observação informada."}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle2">Feedback do nutricionista</Typography>
              <Typography color="text.secondary">
                {substitution.nutritionistFeedback || "Nenhum feedback ainda."}
              </Typography>
            </Box>

            {substitution.appliedToDailyLog ? (
              <Typography color="text.secondary">
                Aplicada ao progresso em {formatFriendlyDate(substitution.applicationDate ?? "")}.
              </Typography>
            ) : null}

            <Divider />

            <MealSubstitutionEstimationPanel substitution={substitution} />

            <Button variant="outlined" onClick={onEditFeedback} sx={{ alignSelf: "flex-start" }}>
              {substitution.nutritionistFeedback ? "Editar feedback" : "Adicionar feedback"}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </AppCard>
  );
}
