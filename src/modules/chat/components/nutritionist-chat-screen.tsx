"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import { useAuth } from "@/modules/auth/auth-context";
import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ErrorState } from "@/modules/app-shell/components/error-state";
import { LoadingState } from "@/modules/app-shell/components/loading-state";
import { PageHeader } from "@/modules/app-shell/components/page-header";
import {
  getNutritionistConversation,
  listNutritionistConversations,
  listNutritionistMessages,
  markNutritionistMessagesAsRead,
  sendNutritionistMessage,
} from "@/modules/chat/chat.api";
import { ChatMessageForm } from "@/modules/chat/components/chat-message-form";
import { ChatMessageThread } from "@/modules/chat/components/chat-message-thread";

const CHAT_POLLING_INTERVAL_MS = 3000;

function formatConversationTime(value: string | null): string {
  if (!value) {
    return "No messages yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function NutritionistChatScreen() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const token = session?.token ?? "";
  const authOptions = { token };

  const conversationsQuery = useQuery({
    queryKey: ["nutritionist-chat-conversations", session?.user.id],
    enabled: Boolean(token && session?.user.id),
    queryFn: () => listNutritionistConversations(authOptions),
    refetchInterval: CHAT_POLLING_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const effectiveSelectedPatientId = useMemo(() => {
    if (!conversationsQuery.data || conversationsQuery.data.length === 0) {
      return null;
    }

    const selectedConversationStillExists = conversationsQuery.data.some(
      (conversation) => conversation.patientId === selectedPatientId,
    );

    if (selectedPatientId && selectedConversationStillExists) {
      return selectedPatientId;
    }

    return conversationsQuery.data[0].patientId;
  }, [conversationsQuery.data, selectedPatientId]);

  const selectedConversationSummary = useMemo(
    () =>
      conversationsQuery.data?.find(
        (conversation) => conversation.patientId === effectiveSelectedPatientId,
      ) ?? null,
    [conversationsQuery.data, effectiveSelectedPatientId],
  );

  const conversationQuery = useQuery({
    queryKey: ["nutritionist-chat-conversation", effectiveSelectedPatientId],
    enabled: Boolean(token && effectiveSelectedPatientId),
    queryFn: () =>
      getNutritionistConversation(effectiveSelectedPatientId!, authOptions),
    refetchInterval: CHAT_POLLING_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const messagesQuery = useQuery({
    queryKey: ["nutritionist-chat-messages", effectiveSelectedPatientId],
    enabled: Boolean(token && effectiveSelectedPatientId),
    queryFn: () =>
      listNutritionistMessages(effectiveSelectedPatientId!, authOptions),
    refetchInterval: CHAT_POLLING_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (values: { text: string }) => {
      if (!effectiveSelectedPatientId) {
        throw new Error("Select a patient conversation first.");
      }

      return sendNutritionistMessage(
        effectiveSelectedPatientId,
        values,
        authOptions,
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["nutritionist-chat-conversations", session?.user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "nutritionist-chat-conversation",
            effectiveSelectedPatientId,
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: ["nutritionist-chat-messages", effectiveSelectedPatientId],
        }),
      ]);
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      if (!effectiveSelectedPatientId) {
        throw new Error("Select a patient conversation first.");
      }

      return markNutritionistMessagesAsRead(
        effectiveSelectedPatientId,
        authOptions,
      );
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["nutritionist-chat-conversations", session?.user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "nutritionist-chat-conversation",
            effectiveSelectedPatientId,
          ],
        }),
        queryClient.invalidateQueries({
          queryKey: ["nutritionist-chat-messages", effectiveSelectedPatientId],
        }),
      ]);
    },
  });

  const unreadIncomingMessages =
    messagesQuery.data?.filter(
      (message) =>
        message.receiverId === session?.user.id && message.readAt === null,
    ).length ?? 0;

  useEffect(() => {
    if (
      effectiveSelectedPatientId &&
      conversationQuery.isSuccess &&
      messagesQuery.isSuccess &&
      unreadIncomingMessages > 0 &&
      !markReadMutation.isPending
    ) {
      markReadMutation.mutate();
    }
  }, [
    conversationQuery.isSuccess,
    effectiveSelectedPatientId,
    markReadMutation,
    messagesQuery.isSuccess,
    unreadIncomingMessages,
  ]);

  if (conversationsQuery.isLoading) {
    return <LoadingState message="Loading conversations..." />;
  }

  if (conversationsQuery.isError) {
    return (
      <ErrorState
        title="Chat unavailable"
        message={
          conversationsQuery.error instanceof Error
            ? conversationsQuery.error.message
            : "Unable to load conversations."
        }
        onRetry={() => void conversationsQuery.refetch()}
      />
    );
  }

  if (!conversationsQuery.data || conversationsQuery.data.length === 0) {
    return (
      <EmptyState
        title="No patient conversations yet"
        description="Link a patient first. The chat conversation is created automatically for linked relationships."
      />
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Chat"
        subtitle="Follow up with linked patients through a simple 1:1 message thread."
      />

      {markReadMutation.isError ? (
        <Alert severity="error">
          {markReadMutation.error instanceof Error
            ? markReadMutation.error.message
            : "Unable to update read status."}
        </Alert>
      ) : null}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            {conversationsQuery.data.map((conversation) => {
              const isSelected =
                conversation.patientId === effectiveSelectedPatientId;

              return (
                <AppCard
                  key={conversation.conversationId}
                  variant={isSelected ? undefined : "outlined"}
                  sx={{
                    cursor: "pointer",
                    borderColor: isSelected ? "primary.main" : undefined,
                  }}
                >
                  <Button
                    fullWidth
                    color="inherit"
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      p: 0,
                    }}
                    onClick={() => {
                      setSelectedPatientId(conversation.patientId);
                    }}
                  >
                    <Stack spacing={1.5} sx={{ width: "100%" }}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        sx={{ alignItems: "center", justifyContent: "space-between" }}
                      >
                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                          <Avatar>{conversation.patient.name.slice(0, 1).toUpperCase()}</Avatar>
                          <div>
                            <Typography variant="h3">
                              {conversation.patient.name}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              {conversation.patient.email}
                            </Typography>
                          </div>
                        </Stack>

                        <Badge
                          color="primary"
                          badgeContent={conversation.unreadCount}
                          invisible={conversation.unreadCount === 0}
                        />
                      </Stack>

                      <Typography
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {conversation.lastMessageText ?? "No messages yet"}
                      </Typography>

                      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Chip
                          size="small"
                          label={formatConversationTime(conversation.lastMessageAt)}
                        />
                      </Stack>
                    </Stack>
                  </Button>
                </AppCard>
              );
            })}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          {!effectiveSelectedPatientId ? (
            <EmptyState
              title="Select a conversation"
              description="Choose a patient to load messages."
            />
          ) : conversationQuery.isLoading || messagesQuery.isLoading ? (
            <LoadingState message="Loading conversation..." />
          ) : conversationQuery.isError ? (
            <ErrorState
              title="Conversation unavailable"
              message={
                conversationQuery.error instanceof Error
                  ? conversationQuery.error.message
                  : "Unable to load the conversation."
              }
              onRetry={() => void conversationQuery.refetch()}
            />
          ) : messagesQuery.isError ? (
            <ErrorState
              title="Messages unavailable"
              message={
                messagesQuery.error instanceof Error
                  ? messagesQuery.error.message
                  : "Unable to load messages."
              }
              onRetry={() => void messagesQuery.refetch()}
            />
          ) : conversationQuery.data && messagesQuery.data && session?.user.id ? (
            <Stack spacing={2.5}>
              <AppCard>
                <Stack spacing={1}>
                  <Typography variant="h3">
                    {conversationQuery.data.patient.name}
                  </Typography>
                  <Typography color="text.secondary">
                    {conversationQuery.data.patient.email}
                  </Typography>
                  <Typography color="text.secondary">
                    {selectedConversationSummary?.unreadCount
                      ? `${selectedConversationSummary.unreadCount} unread message${
                          selectedConversationSummary.unreadCount === 1 ? "" : "s"
                        }`
                      : "All messages read"}
                  </Typography>
                </Stack>
              </AppCard>

              <ChatMessageThread
                currentUserId={session.user.id}
                messages={messagesQuery.data}
                patient={conversationQuery.data.patient}
                nutritionist={conversationQuery.data.nutritionist}
              />

              <AppCard>
                <ChatMessageForm
                  isSubmitting={sendMessageMutation.isPending}
                  errorMessage={
                    sendMessageMutation.isError &&
                    sendMessageMutation.error instanceof Error
                      ? sendMessageMutation.error.message
                      : null
                  }
                  onSubmit={async (values) => {
                    await sendMessageMutation.mutateAsync(values);
                  }}
                />
              </AppCard>
            </Stack>
          ) : null}
        </Grid>
      </Grid>
    </Stack>
  );
}
