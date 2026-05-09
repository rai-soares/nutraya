import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import GrainRoundedIcon from "@mui/icons-material/GrainRounded";
import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import { Grid } from "@mui/material";

import { MacroProgressCard } from "@/modules/macros/components/macro-progress-card";
import type { DailyMacroProgress } from "@/modules/shared/types/api";

const macroConfig = {
  calories: {
    label: "Calorias",
    unit: "kcal",
    color: "#356d67",
    trackColor: "rgba(53, 109, 103, 0.14)",
    icon: <LocalFireDepartmentRoundedIcon fontSize="small" />,
  },
  protein: {
    label: "Proteína",
    unit: "g",
    color: "#1c8b73",
    trackColor: "rgba(28, 139, 115, 0.14)",
    icon: <SpaRoundedIcon fontSize="small" />,
  },
  carbs: {
    label: "Carboidratos",
    unit: "g",
    color: "#5c95bb",
    trackColor: "rgba(92, 149, 187, 0.14)",
    icon: <GrainRoundedIcon fontSize="small" />,
  },
  fat: {
    label: "Gorduras",
    unit: "g",
    color: "#d88941",
    trackColor: "rgba(216, 137, 65, 0.14)",
    icon: <BoltRoundedIcon fontSize="small" />,
  },
} as const;

export function MacroSummaryGrid({
  progress,
}: {
  progress: DailyMacroProgress;
}) {
  return (
    <Grid container spacing={2.5}>
      {Object.entries(macroConfig).map(([key, config]) => (
        <Grid key={key} size={{ xs: 12, sm: 6, xl: 3 }}>
          <MacroProgressCard
            label={config.label}
            unit={config.unit}
            color={config.color}
            trackColor={config.trackColor}
            icon={config.icon}
            consumed={progress.consumed[key as keyof typeof progress.consumed]}
            goal={progress.goals[key as keyof typeof progress.goals]}
            remaining={progress.remaining[key as keyof typeof progress.remaining]}
            progress={progress.progress[key as keyof typeof progress.progress]}
          />
        </Grid>
      ))}
    </Grid>
  );
}
