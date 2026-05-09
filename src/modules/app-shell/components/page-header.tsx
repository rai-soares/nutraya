import { Stack, Typography } from "@mui/material";

export function PageHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{
        alignItems: { xs: "flex-start", sm: "center" },
        justifyContent: "space-between",
      }}
    >
      <div>
        {eyebrow ? (
          <Typography variant="subtitle2" color="primary.main" sx={{ mb: 1 }}>
            {eyebrow}
          </Typography>
        ) : null}
        <Typography variant="h1">{title}</Typography>
        {subtitle ? (
          <Typography color="text.secondary" sx={{ mt: 1.25, maxWidth: 720 }}>
            {subtitle}
          </Typography>
        ) : null}
      </div>
      {action}
    </Stack>
  );
}
