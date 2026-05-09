import { Card, CardContent, type CardProps } from "@mui/material";

export function AppCard({ children, ...props }: CardProps) {
  return (
    <Card {...props}>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
