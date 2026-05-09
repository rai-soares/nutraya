// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { describe, expect, it, vi } from "vitest";

const { useAuthMock, useMutationMock, useQueryMock, useQueryClientMock } =
  vi.hoisted(() => ({
    useAuthMock: vi.fn(),
    useMutationMock: vi.fn(),
    useQueryMock: vi.fn(),
    useQueryClientMock: vi.fn(),
  }));

vi.mock("@tanstack/react-query", () => ({
  useMutation: useMutationMock,
  useQuery: useQueryMock,
  useQueryClient: useQueryClientMock,
}));

vi.mock("@/modules/auth/auth-context", () => ({
  useAuth: useAuthMock,
}));

import { NutritionistChatScreen } from "@/modules/chat/components/nutritionist-chat-screen";
import { appTheme } from "@/theme/app-theme";

describe("NutritionistChatScreen", () => {
  it("renders linked conversations with unread counts", () => {
    useAuthMock.mockReturnValue({
      session: {
        token: "token",
        user: {
          id: "nutri-1",
          name: "Dr. Silva",
          email: "silva@example.com",
          role: "NUTRI",
        },
      },
    });
    useQueryClientMock.mockReturnValue({
      invalidateQueries: vi.fn(),
    });
    useMutationMock.mockReturnValue({
      isError: false,
      isPending: false,
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
    });
    useQueryMock.mockImplementation(({ queryKey }: { queryKey: string[] }) => {
      if (queryKey[0] === "nutritionist-chat-conversations") {
        return {
          data: [
            {
              conversationId: "conversation-1",
              patientId: "patient-1",
              nutritionistId: "nutri-1",
              lastMessageText: "Morning check-in",
              lastMessageAt: "2026-05-09T12:00:00.000Z",
              unreadCount: 2,
              patient: {
                id: "patient-1",
                name: "Ana Costa",
                email: "ana@example.com",
                role: "PATIENT",
              },
              nutritionist: {
                id: "nutri-1",
                name: "Dr. Silva",
                email: "silva@example.com",
                role: "NUTRI",
              },
            },
          ],
          isError: false,
          isLoading: false,
        };
      }

      return {
        data: undefined,
        isError: false,
        isLoading: false,
      };
    });

    render(
      <ThemeProvider theme={appTheme}>
        <NutritionistChatScreen />
      </ThemeProvider>,
    );

    expect(screen.getByText("Ana Costa")).toBeInTheDocument();
    expect(screen.getByText("Morning check-in")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
