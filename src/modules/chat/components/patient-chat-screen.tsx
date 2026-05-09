"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MarkChatReadRoundedIcon from "@mui/icons-material/MarkChatReadRounded";
import { Alert, Stack, Typography } from "@mui/material";

import { useAuth } from "@/modules/auth/auth-context";
import { AppCard } from "@/modules/app-shell/components/app-card";
import { EmptyState } from "@/modules/app-shell/components/empty-state";
import { ErrorState } from "@/modules/app-shell/components/error-state";
import { LoadingState } from "@/modules/app-shell/components/loading-state";
import { MetricPill } from "@/modules/app-shell/components/metric-pill";
import { PageHeader } from "@/modules/app-shell/components/page-header";
import { SectionCard } from "@/modules/app-shell/components/section-card";
import {
  getPatientConversation,
  listPatientMessages,
  markPatientMessagesAsRead,
  sendPatientMessage,
  uploadImage,
} from "@/modules/chat/chat.api";
import { ChatMessageForm, type ChatMessageFormSubmitValues } from "@/modules/chat/components/chat-message-form";
import { ChatMessageThread } from "@/modules/chat/components/chat-message-thread";
import { getErrorMessage } from "@/modules/shared/utils/pt-br";

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
    ) => sendPatientMessage(values, authOptions),
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
      (message) => message.receiverId === session?.user.id && message.readAt === null,
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
    return <LoadingState message="Carregando..." />;
  }

  if (conversationQuery.isError) {
    return (
      <ErrorState
        title="Chat indisponível"
        message={getErrorMessage(conversationQuery.error, "Não foi possível carregar os dados.")}
        onRetry={() => void conversationQuery.refetch()}
      />
    );
  }

  if (messagesQuery.isError) {
    return (
      <ErrorState
        title="Mensagens indisponíveis"
        message={getErrorMessage(messagesQuery.error, "Não foi possível carregar os dados.")}
        onRetry={() => void messagesQuery.refetch()}
      />
    );
  }

  if (!conversationQuery.data || !messagesQuery.data || !session?.user.id) {
    return (
      <EmptyState
        title="Nenhuma mensagem ainda"
        description="Inicie a conversa para acompanhar o paciente no dia a dia."
      />
    );
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        eyebrow="Mensagens"
        title="Chat"
        subtitle={`Converse diretamente com ${conversationQuery.data.nutritionist.name}.`}
      />

      {markReadMutation.isError ? (
        <Alert severity="error">
          {getErrorMessage(markReadMutation.error, "Não foi possível salvar as alterações.")}
        </Alert>
      ) : null}

      <AppCard>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { md: "center" } }}
        >
          <div>
            <Typography variant="h3">{conversationQuery.data.nutritionist.name}</Typography>
            <Typography color="text.secondary">
              {conversationQuery.data.nutritionist.email}
            </Typography>
          </div>
          <MetricPill
            label={unreadIncomingMessages > 0 ? `${unreadIncomingMessages} não lidas` : "Todas as mensagens foram lidas"}
            tone={unreadIncomingMessages > 0 ? "warning" : "success"}
          />
        </Stack>
      </AppCard>

      <ChatMessageThread
        currentUserId={session.user.id}
        messages={messagesQuery.data}
        patient={conversationQuery.data.patient}
        nutritionist={conversationQuery.data.nutritionist}
      />

      <SectionCard
        title="Nova mensagem"
        description="Envie texto ou imagem para manter o acompanhamento em dia."
        action={<MarkChatReadRoundedIcon color="primary" />}
      >
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
  );
}
