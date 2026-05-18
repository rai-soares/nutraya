"use client";

import { useState } from "react";
import { Box, Chip, Dialog, DialogContent, Stack, Typography } from "@mui/material";

import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ImagePreview } from "@/modules/app-shell/components/image-preview";
import { ChatBubble } from "@/modules/chat/components/chat-bubble";
import type { ChatMessage, ConversationParticipant } from "@/modules/shared/types/api";

function formatMessageTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
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
          title="Nenhuma mensagem ainda"
          description="Inicie a conversa para acompanhar o paciente no dia a dia."
        />
      </AppCard>
    );
  }

  return (
    <AppCard
      sx={{
        backgroundColor: "rgba(255,255,255,0.84)",
      }}
    >
      <Box
        data-testid="chat-message-scroll-container"
        sx={{
          maxHeight: {
            xs: "55vh",
            md: "32rem",
          },
          overflowY: "auto",
          pr: 1,
        }}
      >
        <Stack spacing={2}>
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
              <ChatBubble
                key={message.id}
                align={isOwnMessage ? "end" : "start"}
                name={isOwnMessage ? "Voc\u00ea" : participant.name}
                time={formatMessageTime(message.createdAt)}
                avatarLabel={participant.name.slice(0, 1).toUpperCase()}
                footer={
                  isOwnMessage ? (
                    <Chip
                      label={message.readAt ? "Lida" : "Enviada"}
                      size="small"
                      sx={{
                        alignSelf: "flex-end",
                        backgroundColor: message.readAt
                          ? "rgba(255,255,255,0.18)"
                          : "rgba(255,255,255,0.1)",
                        color: "inherit",
                      }}
                    />
                  ) : null
                }
              >
                {message.messageType === "IMAGE" && message.imageUrl ? (
                  <ImagePreview
                    src={message.imageUrl}
                    alt="Imagem do chat"
                    maxHeight={320}
                    onClick={() => setPreviewImage(message.imageUrl)}
                  />
                ) : null}

                {message.text ? (
                  <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                    {message.text}
                  </Typography>
                ) : null}
              </ChatBubble>
            );
          })}
        </Stack>
      </Box>

      <Dialog open={Boolean(previewImage)} onClose={() => setPreviewImage(null)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 1.5 }}>
          {previewImage ? (
            <Box
              component="img"
              src={previewImage}
              alt="Imagem ampliada do chat"
              sx={{ width: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: 2 }}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </AppCard>
  );
}
