import { Card, CardContent, type CardProps } from "@mui/material";

export type AppCardProps = CardProps & {
  padded?: boolean;
};

export function AppCard({ children, padded = true, ...props }: AppCardProps) {
  return (
    <Card
      {...props}
      sx={{
        overflow: "hidden",
        ...props.sx,
      }}
    >
      <CardContent sx={padded ? undefined : { p: 0, "&:last-child": { pb: 0 } }}>
        {children}
      </CardContent>
    </Card>
  );
}
