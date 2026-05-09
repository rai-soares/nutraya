import { Button, Stack, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";

export function ErrorState({
  title = "Something went wrong",
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
            Try again
          </Button>
        ) : null}
      </Stack>
    </AppCard>
  );
}
