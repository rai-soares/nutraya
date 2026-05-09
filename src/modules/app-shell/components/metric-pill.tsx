import { Chip } from "@mui/material";

export function MetricPill({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "primary" | "success" | "warning";
}) {
  const toneStyles =
    tone === "primary"
      ? {
          backgroundColor: "rgba(18, 116, 107, 0.12)",
          color: "primary.dark",
        }
      : tone === "success"
        ? {
            backgroundColor: "rgba(47, 143, 102, 0.12)",
            color: "success.main",
          }
        : tone === "warning"
          ? {
              backgroundColor: "rgba(222, 138, 61, 0.14)",
              color: "warning.main",
            }
          : {
              backgroundColor: "rgba(96, 125, 120, 0.08)",
              color: "text.secondary",
            };

  return <Chip label={label} size="small" sx={toneStyles} />;
}
