import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { LinearProgress, Stack, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";

type MacroProgressCardProps = {
  label: string;
  consumed: number;
  goal: number;
  remaining: number;
  progress: number;
  unit: string;
};

export function MacroProgressCard({
  label,
  consumed,
  goal,
  remaining,
  progress,
  unit,
}: MacroProgressCardProps) {
  const safeProgress = Math.max(0, Math.min(progress, 100));

  return (
    <AppCard sx={{ height: "100%" }}>
      <Stack spacing={2}>
        <Stack
          direction="row"
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Typography variant="h3">{label}</Typography>
          <TrendingUpRoundedIcon color="primary" fontSize="small" />
        </Stack>

        <div>
          <Typography variant="h2">
            {consumed}
            <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
              / {goal} {unit}
            </Typography>
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {remaining} {unit} remaining
          </Typography>
        </div>

        <div>
          <LinearProgress variant="determinate" value={safeProgress} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {safeProgress}% complete
          </Typography>
        </div>
      </Stack>
    </AppCard>
  );
}
