import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#12746b",
      light: "#3f9f95",
      dark: "#0a4f49",
      contrastText: "#f8fffd",
    },
    secondary: {
      main: "#6ca7c4",
      light: "#94c5dc",
      dark: "#4f87a3",
      contrastText: "#0f2b3d",
    },
    background: {
      default: "#f6f3ee",
      paper: "#ffffff",
    },
    text: {
      primary: "#17312d",
      secondary: "#617873",
    },
    divider: "rgba(18, 116, 107, 0.12)",
    success: {
      main: "#2f8f66",
    },
    warning: {
      main: "#de8a3d",
    },
    error: {
      main: "#c95d52",
    },
  },
  shape: {
    borderRadius: 24,
  },
  typography: {
    fontFamily: "var(--font-geist-sans), sans-serif",
    h1: {
      fontSize: "clamp(2rem, 3vw, 2.8rem)",
      lineHeight: 1.08,
      fontWeight: 750,
      letterSpacing: "-0.03em",
    },
    h2: {
      fontSize: "clamp(1.5rem, 2vw, 2rem)",
      lineHeight: 1.15,
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h3: {
      fontSize: "1.05rem",
      lineHeight: 1.25,
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    subtitle1: {
      fontSize: "1rem",
      fontWeight: 600,
    },
    subtitle2: {
      fontSize: "0.82rem",
      fontWeight: 700,
      letterSpacing: "0.03em",
      textTransform: "uppercase",
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.55,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          background:
            "radial-gradient(circle at top, rgba(108, 167, 196, 0.18), transparent 34%), linear-gradient(180deg, #faf7f2 0%, #f6f3ee 55%, #f1efe8 100%)",
        },
        body: {
          minHeight: "100vh",
          background: "transparent",
        },
        "#__next": {
          minHeight: "100vh",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 28,
          border: "1px solid rgba(18, 116, 107, 0.10)",
          backgroundColor: "rgba(255, 255, 255, 0.92)",
          boxShadow: "0 18px 44px rgba(21, 42, 37, 0.07)",
          backdropFilter: "blur(14px)",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          "&:last-child": {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 44,
          paddingInline: 18,
          borderRadius: 999,
          textTransform: "none",
          fontWeight: 600,
        },
        contained: {
          boxShadow: "0 12px 24px rgba(18, 116, 107, 0.18)",
        },
        outlined: {
          borderColor: "rgba(18, 116, 107, 0.2)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 28,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          height: 32,
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 12,
          borderRadius: 999,
          backgroundColor: "rgba(18, 116, 107, 0.08)",
        },
        bar: {
          borderRadius: 999,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: "rgba(255,255,255,0.88)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 20,
        },
      },
    },
  },
});
