// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider } from "@mui/material";
import { describe, expect, it, vi } from "vitest";

import { ChatMessageForm } from "@/modules/chat/components/chat-message-form";
import { appTheme } from "@/theme/app-theme";

describe("ChatMessageForm", () => {
  it("submits trimmed message text", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ThemeProvider theme={appTheme}>
        <ChatMessageForm isSubmitting={false} onSubmit={onSubmit} />
      </ThemeProvider>,
    );

    fireEvent.change(screen.getByLabelText(/digite uma mensagem/i), {
      target: { value: "  Hello coach  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /^enviar$/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        messageType: "TEXT",
        text: "Hello coach",
      });
    });
  });
});
