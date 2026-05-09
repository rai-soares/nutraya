import { Box } from "@mui/material";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(108, 167, 196, 0.15), transparent 30%), transparent",
      }}
    >
      {children}
    </Box>
  );
}
