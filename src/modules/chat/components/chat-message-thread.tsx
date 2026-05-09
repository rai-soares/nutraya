"use client";

import { useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  Dialog,
  DialogContent,
  Stack,
  Typography,
} from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import type { ChatMessage, ConversationParticipant } from "@/modules/shared/types/api";

function formatMessageTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function ChatMessageThread({
  currentUserId,
  messages,
  patient,
  nutritionist,
}: {
  currentUserId: string;
  messages: ChatMessage[];
  patient: ConversationParticipant;
  nutritionist: ConversationParticipant;
}) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  if (messages.length === 0) {
    return (
      <AppCard>
        <EmptyState
          title="No messages yet"
          description="Start the conversation with a simple check-in message."
        />
      </AppCard>
    );
  }

  return (
    <Stack spacing={1.5}>
      {messages.map((message) => {
        const isOwnMessage = message.senderId === currentUserId;
        const participant = isOwnMessage
          ? currentUserId === patient.id
            ? patient
            : nutritionist
          : currentUserId === patient.id
            ? nutritionist
            : patient;

        return (
          <Stack
            key={message.id}
            direction="row"
            spacing={1.5}
            sx={{
              justifyContent: isOwnMessage ? "flex-end" : "flex-start",
            }}
          >
            {!isOwnMessage ? (
              <Avatar sx={{ width: 36, height: 36 }}>
                {participant.name.slice(0, 1).toUpperCase()}
              </Avatar>
            ) : null}

            <AppCard
              sx={{
                maxWidth: { xs: "88%", sm: "75%" },
                backgroundColor: isOwnMessage ? "primary.main" : "background.paper",
                color: isOwnMessage ? "primary.contrastText" : "text.primary",
              }}
            >
              <Stack spacing={1}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    minWidth: { sm: 260 },
                  }}
                >
                <Typography
                  variant="subtitle2"
                    sx={{
                      color: isOwnMessage ? "inherit" : "text.primary",
                    }}
                  >
                    {isOwnMessage ? "You" : participant.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isOwnMessage
                        ? "rgba(255,255,255,0.82)"
                        : "text.secondary",
                    }}
                  >
                    {formatMessageTime(message.createdAt)}
                  </Typography>
                </Stack>

                {message.messageType === "IMAGE" && message.imageUrl ? (
                  <Box
                    component="img"
                    src={message.imageUrl}
                    alt="Chat image"
                    onClick={() => setPreviewImage(message.imageUrl)}
                    sx={{
                      width: "100%",
                      maxWidth: { xs: 240, sm: 320 },
                      maxHeight: 320,
                      objectFit: "cover",
                      borderRadius: 2,
                      cursor: "pointer",
                    }}
                  />
                ) : null}

                {message.text ? (
                  <Typography
                    sx={{
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {message.text}
                  </Typography>
                ) : null}

                {isOwnMessage ? (
                  <Chip
                    label={message.readAt ? "Read" : "Sent"}
                    size="small"
                    sx={{
                      alignSelf: "flex-end",
                      backgroundColor: message.readAt
                        ? "rgba(255,255,255,0.18)"
                        : "rgba(255,255,255,0.1)",
                      color: "inherit",
                    }}
                  />
                ) : null}
              </Stack>
            </AppCard>

            {isOwnMessage ? (
              <Avatar sx={{ width: 36, height: 36 }}>
                {participant.name.slice(0, 1).toUpperCase()}
              </Avatar>
            ) : null}
          </Stack>
        );
      })}

      <Dialog
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 1.5 }}>
          {previewImage ? (
            <Box
              component="img"
              src={previewImage}
              alt="Expanded chat image"
              sx={{
                width: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: 2,
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
