// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { describe, expect, it } from "vitest";

import { ChatMessageThread } from "@/modules/chat/components/chat-message-thread";
import { appTheme } from "@/theme/app-theme";

describe("ChatMessageThread", () => {
  it("renders image messages with captions", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <ChatMessageThread
          currentUserId="patient-1"
          patient={{
            id: "patient-1",
            name: "Ana Costa",
            email: "ana@example.com",
            role: "PATIENT",
          }}
          nutritionist={{
            id: "nutri-1",
            name: "Dr. Silva",
            email: "silva@example.com",
            role: "NUTRI",
          }}
          messages={[
            {
              id: "message-1",
              conversationId: "conversation-1",
              senderId: "patient-1",
              receiverId: "nutri-1",
              messageType: "IMAGE",
              imageUrl: "https://cdn.example.com/lunch.jpg",
              text: "Lunch today",
              readAt: null,
              createdAt: "2026-05-09T12:00:00.000Z",
              updatedAt: "2026-05-09T12:00:00.000Z",
            },
          ]}
        />
      </ThemeProvider>,
    );

    expect(screen.getByAltText("Imagem do chat")).toBeInTheDocument();
    expect(screen.getByText("Lunch today")).toBeInTheDocument();
  });

  it("keeps the message list inside a scrollable container", () => {
    render(
      <ThemeProvider theme={appTheme}>
        <ChatMessageThread
          currentUserId="patient-1"
          patient={{
            id: "patient-1",
            name: "Ana Costa",
            email: "ana@example.com",
            role: "PATIENT",
          }}
          nutritionist={{
            id: "nutri-1",
            name: "Dr. Silva",
            email: "silva@example.com",
            role: "NUTRI",
          }}
          messages={[
            {
              id: "message-1",
              conversationId: "conversation-1",
              senderId: "patient-1",
              receiverId: "nutri-1",
              messageType: "TEXT",
              imageUrl: null,
              text: "Mensagem 1",
              readAt: null,
              createdAt: "2026-05-09T12:00:00.000Z",
              updatedAt: "2026-05-09T12:00:00.000Z",
            },
          ]}
        />
      </ThemeProvider>,
    );

    expect(screen.getByTestId("chat-message-scroll-container")).toHaveStyle({
      overflowY: "auto",
    });
  });
});
