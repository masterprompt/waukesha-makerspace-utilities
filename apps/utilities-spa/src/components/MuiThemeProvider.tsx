import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";


import { type PropsWithChildren, useMemo } from "react";
import { CssBaseline } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

export default function MuiThemeProvider({ children }: PropsWithChildren) {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "light", // swap to "dark" if you prefer
          primary: { main: "#0ea5e9" }, // sky-500 vibe
          secondary: { main: "#7c3aed" } // violet-600
        },
        shape: { borderRadius: 12 },
        components: {
          MuiButton: { defaultProps: { disableElevation: true } }
        }
      }),
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}