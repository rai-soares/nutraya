import { Container } from "@mui/material";

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <Container
      maxWidth="xl"
      className="px-4 py-5 sm:px-6 sm:py-8 lg:px-8"
      sx={{ pb: { xs: 8, md: 10 } }}
    >
      {children}
    </Container>
  );
}
