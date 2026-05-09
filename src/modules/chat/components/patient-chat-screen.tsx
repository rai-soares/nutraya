"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Stack, Typography } from "@mui/material";

import { useAuth } from "@/modules/auth/auth-context";
import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ErrorState } from "@/modules/app-shell/components/error-state";
import { LoadingState } from "@/modules/app-shell/components/loading-state";
import { PageHeader } from "@/modules/app-shell/components/page-header";
import {
  getPatientConversation,
  listPatientMessages,
  markPatientMessagesAsRead,
  sendPatientMessage,
  uploadImage,
} from "@/modules/chat/chat.api";
import {
  ChatMessageForm,
  type ChatMessageFormSubmitValues,
} from "@/modules/chat/components/chat-message-form";
import { ChatMessageThread } from "@/modules/chat/components/chat-message-thread";

const CHAT_POLLING_INTERVAL_MS = 3000;

export function PatientChatScreen() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const token = session?.token ?? "";
  const authOptions = { token };

  const conversationQuery = useQuery({
    queryKey: ["patient-chat-conversation", session?.user.id],
    enabled: Boolean(token && session?.user.id),
    queryFn: () => getPatientConversation(authOptions),
    refetchInterval: CHAT_POLLING_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const messagesQuery = useQuery({
    queryKey: ["patient-chat-messages", session?.user.id],
    enabled: Boolean(token && session?.user.id),
    queryFn: () => listPatientMessages(authOptions),
    refetchInterval: CHAT_POLLING_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (
      values:
        | {
            messageType: "TEXT";
            text: string;
          }
        | {
            messageType: "IMAGE";
            imageUrl: string;
            text?: string;
          },
    ) =>
      sendPatientMessage(values, authOptions),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["patient-chat-conversation", session?.user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["patient-chat-messages", session?.user.id],
        }),
      ]);
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => uploadImage(file, authOptions),
  });

  const markReadMutation = useMutation({
    mutationFn: async () => markPatientMessagesAsRead(authOptions),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["patient-chat-conversation", session?.user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["patient-chat-messages", session?.user.id],
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
      conversationQuery.isSuccess &&
      messagesQuery.isSuccess &&
      unreadIncomingMessages > 0 &&
      !markReadMutation.isPending
    ) {
      markReadMutation.mutate();
    }
  }, [
    conversationQuery.isSuccess,
    markReadMutation,
    messagesQuery.isSuccess,
    unreadIncomingMessages,
  ]);

  if (conversationQuery.isLoading || messagesQuery.isLoading) {
    return <LoadingState message="Loading your chat..." />;
  }

  if (conversationQuery.isError) {
    return (
      <ErrorState
        title="Chat unavailable"
        message={
          conversationQuery.error instanceof Error
            ? conversationQuery.error.message
            : "Unable to load the conversation."
        }
        onRetry={() => void conversationQuery.refetch()}
      />
    );
  }

  if (messagesQuery.isError) {
    return (
      <ErrorState
        title="Messages unavailable"
        message={
          messagesQuery.error instanceof Error
            ? messagesQuery.error.message
            : "Unable to load messages."
        }
        onRetry={() => void messagesQuery.refetch()}
      />
    );
  }

  if (!conversationQuery.data || !messagesQuery.data || !session?.user.id) {
    return (
      <EmptyState
        title="No chat available"
        description="Your conversation will appear here once your nutritionist link is ready."
      />
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Chat"
        subtitle={`Talk directly with ${conversationQuery.data.nutritionist.name}.`}
      />

      {markReadMutation.isError ? (
        <Alert severity="error">
          {markReadMutation.error instanceof Error
            ? markReadMutation.error.message
            : "Unable to update read status."}
        </Alert>
      ) : null}

      <AppCard>
        <Stack spacing={1}>
          <Typography variant="h3">
            {conversationQuery.data.nutritionist.name}
          </Typography>
          <Typography color="text.secondary">
            {conversationQuery.data.nutritionist.email}
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
          isSubmitting={
            uploadImageMutation.isPending || sendMessageMutation.isPending
          }
          errorMessage={
            (uploadImageMutation.isError &&
              uploadImageMutation.error instanceof Error &&
              uploadImageMutation.error.message) ||
            (sendMessageMutation.isError &&
              sendMessageMutation.error instanceof Error &&
              sendMessageMutation.error.message) ||
            null
          }
          onSubmit={async (values: ChatMessageFormSubmitValues) => {
            if (values.messageType === "TEXT") {
              await sendMessageMutation.mutateAsync(values);
              return;
            }

            const uploadResult = await uploadImageMutation.mutateAsync(values.file);

            await sendMessageMutation.mutateAsync({
              messageType: "IMAGE",
              imageUrl: uploadResult.imageUrl,
              text: values.text,
            });
          }}
        />
      </AppCard>
    </Stack>
  );
}
