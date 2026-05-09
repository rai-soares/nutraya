import { Stack, Typography } from "@mui/material";

import { AppCard, type AppCardProps } from "@/modules/app-shell/components/app-card";

export function SectionCard({
  title,
  description,
  action,
  children,
  ...props
}: AppCardProps & {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <AppCard {...props}>
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          sx={{
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <div>
            <Typography variant="h3">{title}</Typography>
            {description ? (
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                {description}
              </Typography>
            ) : null}
          </div>
          {action}
        </Stack>
        {children}
      </Stack>
    </AppCard>
  );
}
