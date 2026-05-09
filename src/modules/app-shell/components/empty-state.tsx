import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import { Button, Stack, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <AppCard>
      <Stack spacing={1.5} sx={{ alignItems: "flex-start", py: { xs: 1, sm: 2 } }}>
        <Stack
          sx={{
            width: 56,
            height: 56,
            borderRadius: 999,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(18, 116, 107, 0.10)",
            color: "primary.main",
          }}
        >
          <SpaRoundedIcon />
        </Stack>
        <Typography variant="h3">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
        {actionLabel && onAction ? (
          <Button variant="contained" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </Stack>
    </AppCard>
  );
}
