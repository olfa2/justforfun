"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Dünner Wrapper um next-themes, damit wir ihn als Client-Komponente
// im (Server-)RootLayout einbinden können.
export function ThemeProvider({ children, ...props }) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
