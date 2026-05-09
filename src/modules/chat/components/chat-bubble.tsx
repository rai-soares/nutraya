import { Avatar, Stack, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";

export function ChatBubble({
  align,
  name,
  time,
  avatarLabel,
  children,
  footer,
}: {
  align: "start" | "end";
  name: string;
  time: string;
  avatarLabel: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const isOwnMessage = align === "end";

  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ justifyContent: isOwnMessage ? "flex-end" : "flex-start" }}
    >
      {!isOwnMessage ? (
        <Avatar sx={{ width: 36, height: 36 }}>{avatarLabel}</Avatar>
      ) : null}

      <AppCard
        sx={{
          maxWidth: { xs: "90%", sm: "78%" },
          backgroundColor: isOwnMessage ? "primary.main" : "rgba(255,255,255,0.94)",
          color: isOwnMessage ? "primary.contrastText" : "text.primary",
        }}
      >
        <Stack spacing={1}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: "center", justifyContent: "space-between", minWidth: { sm: 260 } }}
          >
            <Typography variant="subtitle2" sx={{ color: isOwnMessage ? "inherit" : "text.primary" }}>
              {name}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: isOwnMessage ? "rgba(255,255,255,0.82)" : "text.secondary" }}
            >
              {time}
            </Typography>
          </Stack>
          {children}
          {footer}
        </Stack>
      </AppCard>

      {isOwnMessage ? <Avatar sx={{ width: 36, height: 36 }}>{avatarLabel}</Avatar> : null}
    </Stack>
  );
}
