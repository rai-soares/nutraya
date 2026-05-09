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
      <Stack spacing={1.5} sx={{ alignItems: "flex-start" }}>
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
