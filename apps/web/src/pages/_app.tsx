import type { AppProps } from "next/app";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
