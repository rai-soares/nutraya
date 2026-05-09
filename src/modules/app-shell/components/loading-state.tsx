import { CircularProgress, Stack, Typography } from "@mui/material";

export function LoadingState({ message = "Carregando..." }: { message?: string }) {
  return (
    <Stack spacing={2} sx={{ py: 8, alignItems: "center", justifyContent: "center" }}>
      <CircularProgress />
      <Typography color="text.secondary">{message}</Typography>
    </Stack>
  );
}
