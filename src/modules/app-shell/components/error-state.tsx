import ReportGmailerrorredRoundedIcon from "@mui/icons-material/ReportGmailerrorredRounded";
import { Button, Stack, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";

export function ErrorState({
  title = "Algo deu errado",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
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
            backgroundColor: "rgba(201, 93, 82, 0.10)",
            color: "error.main",
          }}
        >
          <ReportGmailerrorredRoundedIcon />
        </Stack>
        <Typography variant="h3">{title}</Typography>
        <Typography color="text.secondary">{message}</Typography>
        {onRetry ? (
          <Button variant="outlined" onClick={onRetry}>
            Tentar novamente
          </Button>
        ) : null}
      </Stack>
    </AppCard>
  );
}
