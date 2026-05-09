import { Box } from "@mui/material";

export function ImagePreview({
  src,
  alt,
  maxHeight = 320,
  onClick,
}: {
  src: string;
  alt: string;
  maxHeight?: number;
  onClick?: () => void;
}) {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onClick={onClick}
      sx={{
        width: "100%",
        maxHeight,
        display: "block",
        objectFit: "cover",
        borderRadius: 5,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        cursor: onClick ? "pointer" : "default",
        backgroundColor: "rgba(255,255,255,0.8)",
      }}
    />
  );
}
