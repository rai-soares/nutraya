import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { LinearProgress, Stack, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
import { MetricPill } from "@/modules/app-shell/components/metric-pill";

type MacroProgressCardProps = {
  label: string;
  consumed: number;
  goal: number;
  remaining: number;
  progress: number;
  unit: string;
  color?: string;
  trackColor?: string;
  icon?: React.ReactNode;
};

export function MacroProgressCard({
  label,
  consumed,
  goal,
  remaining,
  progress,
  unit,
  color = "#12746b",
  trackColor = "rgba(18, 116, 107, 0.12)",
  icon,
}: MacroProgressCardProps) {
  const safeProgress = Math.max(0, Math.min(progress, 100));

  return (
    <AppCard sx={{ height: "100%" }}>
      <Stack spacing={2.25}>
        <Stack
          direction="row"
          sx={{ alignItems: "flex-start", justifyContent: "space-between" }}
        >
          <div>
            <Typography variant="subtitle2" sx={{ color }}>
              {label}
            </Typography>
            <Typography variant="h2" sx={{ mt: 0.75 }}>
              {consumed}
              <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                / {goal} {unit}
              </Typography>
            </Typography>
          </div>
          <Stack
            sx={{
              width: 40,
              height: 40,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: trackColor,
              color,
            }}
          >
            {icon ?? <TrendingUpRoundedIcon fontSize="small" />}
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          <MetricPill label="Consumido" tone="primary" />
          <MetricPill
            label={`${Math.max(remaining, 0)} ${unit} restantes`}
            tone={remaining > 0 ? "default" : "warning"}
          />
        </Stack>

        <Stack spacing={1}>
          <LinearProgress
            variant="determinate"
            value={safeProgress}
            sx={{
              backgroundColor: trackColor,
              "& .MuiLinearProgress-bar": {
                backgroundColor: color,
              },
            }}
          />
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              Meta do dia
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color }}>
              {safeProgress}% concluído
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </AppCard>
  );
}
