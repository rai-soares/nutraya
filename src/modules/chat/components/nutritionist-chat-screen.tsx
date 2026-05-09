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
  uploadImage,
} from "@/modules/chat/chat.api";
import {
  ChatMessageForm,
  type ChatMessageFormSubmitValues,
} from "@/modules/chat/components/chat-message-form";
import { ChatMessageThread } from "@/modules/chat/components/chat-message-thread";
import { getErrorMessage } from "@/modules/shared/utils/pt-br";

const CHAT_POLLING_INTERVAL_MS = 3000;

function formatConversationTime(value: string | null): string {
  if (!value) {
    return "Sem mensagens";
  }

  return new Intl.DateTimeFormat("pt-BR", {
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
    ) => {
      if (!effectiveSelectedPatientId) {
        throw new Error("Selecione uma conversa de paciente primeiro.");
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

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => uploadImage(file, authOptions),
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      if (!effectiveSelectedPatientId) {
        throw new Error("Selecione uma conversa de paciente primeiro.");
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
    return <LoadingState message="Carregando conversas..." />;
  }

  if (conversationsQuery.isError) {
    return (
      <ErrorState
        title="Chat indisponível"
        message={getErrorMessage(conversationsQuery.error, "Não foi possível carregar as conversas.")}
        onRetry={() => void conversationsQuery.refetch()}
      />
    );
  }

  if (!conversationsQuery.data || conversationsQuery.data.length === 0) {
    return (
      <EmptyState
        title="Nenhuma mensagem ainda."
        description="As conversas com pacientes vinculados aparecerão aqui automaticamente."
      />
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Chat"
        subtitle="Acompanhe pacientes vinculados em conversas diretas e simples."
      />

      {markReadMutation.isError ? (
        <Alert severity="error">
          {getErrorMessage(markReadMutation.error, "Não foi possível atualizar a leitura das mensagens.")}
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
                        {conversation.lastMessageText ?? "Nenhuma mensagem ainda"}
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
              title="Selecione uma conversa"
              description="Escolha um paciente para carregar as mensagens."
            />
          ) : conversationQuery.isLoading || messagesQuery.isLoading ? (
            <LoadingState message="Carregando conversa..." />
          ) : conversationQuery.isError ? (
            <ErrorState
              title="Conversa indisponível"
              message={getErrorMessage(conversationQuery.error, "Não foi possível carregar a conversa.")}
              onRetry={() => void conversationQuery.refetch()}
            />
          ) : messagesQuery.isError ? (
            <ErrorState
              title="Mensagens indisponíveis"
              message={getErrorMessage(messagesQuery.error, "Não foi possível carregar as mensagens.")}
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
                      ? `${selectedConversationSummary.unreadCount} mensagem${
                          selectedConversationSummary.unreadCount === 1 ? "" : "ns"
                        } não lida${selectedConversationSummary.unreadCount === 1 ? "" : "s"}`
                      : "Todas as mensagens foram lidas"}
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
                      getErrorMessage(uploadImageMutation.error, "Não foi possível enviar a imagem.")) ||
                    (sendMessageMutation.isError &&
                      getErrorMessage(sendMessageMutation.error, "Não foi possível enviar a mensagem.")) ||
                    null
                  }
                  onSubmit={async (values: ChatMessageFormSubmitValues) => {
                    if (values.messageType === "TEXT") {
                      await sendMessageMutation.mutateAsync(values);
                      return;
                    }

                    const uploadResult = await uploadImageMutation.mutateAsync(
                      values.file,
                    );

                    await sendMessageMutation.mutateAsync({
                      messageType: "IMAGE",
                      imageUrl: uploadResult.imageUrl,
                      text: values.text,
                    });
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
