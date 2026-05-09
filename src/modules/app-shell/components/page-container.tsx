import { Container } from "@mui/material";

export function PageContainer({ children }: { children: React.ReactNode }) {
  return (
    <Container maxWidth="lg" className="px-4 py-6 sm:px-6 sm:py-8">
      {children}
    </Container>
  );
}
