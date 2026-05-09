"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Avatar, Badge, Button, Grid, Stack, Typography } from "@mui/material";

import { useAuth } from "@/modules/auth/auth-context";
import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ErrorState } from "@/modules/app-shell/components/error-state";
import { LoadingState } from "@/modules/app-shell/components/loading-state";
import { MetricPill } from "@/modules/app-shell/components/metric-pill";
import { PageHeader } from "@/modules/app-shell/components/page-header";
import { SectionCard } from "@/modules/app-shell/components/section-card";
import {
  getNutritionistConversation,
  listNutritionistConversations,
  listNutritionistMessages,
  markNutritionistMessagesAsRead,
  sendNutritionistMessage,
  uploadImage,
} from "@/modules/chat/chat.api";
import { ChatMessageForm, type ChatMessageFormSubmitValues } from "@/modules/chat/components/chat-message-form";
import { ChatMessageThread } from "@/modules/chat/components/chat-message-thread";
import { getErrorMessage } from "@/modules/shared/utils/pt-br";

const CHAT_POLLING_INTERVAL_MS = 3000;

function formatConversationTime(value: string | null): string {
  if (!value) {
    return "Nenhuma mensagem ainda";
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
    queryFn: () => getNutritionistConversation(effectiveSelectedPatientId!, authOptions),
    refetchInterval: CHAT_POLLING_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const messagesQuery = useQuery({
    queryKey: ["nutritionist-chat-messages", effectiveSelectedPatientId],
    enabled: Boolean(token && effectiveSelectedPatientId),
    queryFn: () => listNutritionistMessages(effectiveSelectedPatientId!, authOptions),
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

      return sendNutritionistMessage(effectiveSelectedPatientId, values, authOptions);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["nutritionist-chat-conversations", session?.user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["nutritionist-chat-conversation", effectiveSelectedPatientId],
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

      return markNutritionistMessagesAsRead(effectiveSelectedPatientId, authOptions);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["nutritionist-chat-conversations", session?.user.id],
        }),
        queryClient.invalidateQueries({
          queryKey: ["nutritionist-chat-conversation", effectiveSelectedPatientId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["nutritionist-chat-messages", effectiveSelectedPatientId],
        }),
      ]);
    },
  });

  const unreadIncomingMessages =
    messagesQuery.data?.filter(
      (message) => message.receiverId === session?.user.id && message.readAt === null,
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
    return <LoadingState message="Carregando..." />;
  }

  if (conversationsQuery.isError) {
    return (
      <ErrorState
        title="Chat indisponível"
        message={getErrorMessage(conversationsQuery.error, "Não foi possível carregar os dados.")}
        onRetry={() => void conversationsQuery.refetch()}
      />
    );
  }

  if (!conversationsQuery.data || conversationsQuery.data.length === 0) {
    return (
      <EmptyState
        title="Nenhuma mensagem ainda"
        description="As conversas com pacientes vinculados aparecerão aqui."
      />
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Mensagens"
        title="Chat"
        subtitle="Acompanhe pacientes vinculados em conversas diretas e simples."
      />

      {markReadMutation.isError ? (
        <Alert severity="error">
          {getErrorMessage(markReadMutation.error, "Não foi possível salvar as alterações.")}
        </Alert>
      ) : null}

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Conversas" description="Selecione um paciente para abrir as mensagens.">
            <Stack spacing={1.5}>
              {conversationsQuery.data.map((conversation) => {
                const isSelected = conversation.patientId === effectiveSelectedPatientId;

                return (
                  <AppCard
                    key={conversation.conversationId}
                    variant={isSelected ? undefined : "outlined"}
                    sx={{
                      cursor: "pointer",
                      borderColor: isSelected ? "primary.main" : undefined,
                      backgroundColor: isSelected ? "rgba(18, 116, 107, 0.06)" : undefined,
                    }}
                  >
                    <Button
                      fullWidth
                      color="inherit"
                      sx={{ justifyContent: "flex-start", textTransform: "none", p: 0 }}
                      onClick={() => {
                        setSelectedPatientId(conversation.patientId);
                      }}
                    >
                      <Stack spacing={1.25} sx={{ width: "100%" }}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ alignItems: "center", justifyContent: "space-between" }}
                        >
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                            <Avatar>{conversation.patient.name.slice(0, 1).toUpperCase()}</Avatar>
                            <div>
                              <Typography variant="h3">{conversation.patient.name}</Typography>
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

                        <MetricPill label={formatConversationTime(conversation.lastMessageAt)} tone="default" />
                      </Stack>
                    </Button>
                  </AppCard>
                );
              })}
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          {!effectiveSelectedPatientId ? (
            <EmptyState
              title="Nenhuma mensagem ainda"
              description="As conversas com pacientes vinculados aparecerão aqui."
            />
          ) : conversationQuery.isLoading || messagesQuery.isLoading ? (
            <LoadingState message="Carregando..." />
          ) : conversationQuery.isError ? (
            <ErrorState
              title="Conversa indisponível"
              message={getErrorMessage(conversationQuery.error, "Não foi possível carregar os dados.")}
              onRetry={() => void conversationQuery.refetch()}
            />
          ) : messagesQuery.isError ? (
            <ErrorState
              title="Mensagens indisponíveis"
              message={getErrorMessage(messagesQuery.error, "Não foi possível carregar os dados.")}
              onRetry={() => void messagesQuery.refetch()}
            />
          ) : conversationQuery.data && messagesQuery.data && session?.user.id ? (
            <Stack spacing={2.5}>
              <AppCard>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
                >
                  <div>
                    <Typography variant="h3">{conversationQuery.data.patient.name}</Typography>
                    <Typography color="text.secondary">
                      {conversationQuery.data.patient.email}
                    </Typography>
                  </div>
                  <MetricPill
                    label={
                      selectedConversationSummary?.unreadCount
                        ? `${selectedConversationSummary.unreadCount} não lidas`
                        : "Todas as mensagens foram lidas"
                    }
                    tone={selectedConversationSummary?.unreadCount ? "warning" : "success"}
                  />
                </Stack>
              </AppCard>

              <ChatMessageThread
                currentUserId={session.user.id}
                messages={messagesQuery.data}
                patient={conversationQuery.data.patient}
                nutritionist={conversationQuery.data.nutritionist}
              />

              <SectionCard title="Nova mensagem" description="Digite uma mensagem ou envie uma imagem.">
                <ChatMessageForm
                  isSubmitting={uploadImageMutation.isPending || sendMessageMutation.isPending}
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

                    const uploadResult = await uploadImageMutation.mutateAsync(values.file);

                    await sendMessageMutation.mutateAsync({
                      messageType: "IMAGE",
                      imageUrl: uploadResult.imageUrl,
                      text: values.text,
                    });
                  }}
                />
              </SectionCard>
            </Stack>
          ) : null}
        </Grid>
      </Grid>
    </Stack>
  );
}
