import { CircularProgress, Stack, Typography } from "@mui/material";

export function LoadingState({ message = "Carregando..." }: { message?: string }) {
  return (
    <Stack
      spacing={2}
      sx={{
        py: 8,
        px: 3,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 1,
        border: "1px solid rgba(18, 116, 107, 0.10)",
        backgroundColor: "rgba(255,255,255,0.78)",
      }}
    >
      <CircularProgress color="primary" />
      <Typography color="text.secondary">{message}</Typography>
    </Stack>
  );
}
