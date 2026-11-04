"use client";

import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider, useTheme } from "@/context/theme-context";
import { queryClient } from "@/lib/query-client";
import { SocketProvider } from "@/socket/socket-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Toaster } from "sonner";

function ThemedToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="bottom-right"
      theme={resolvedTheme}
      richColors
      closeButton
      duration={4000}
      gap={8}
      toastOptions={{
        className: "border border-border shadow-lg font-sans text-xs",
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SocketProvider>
            {children}
            <ThemedToaster />
          </SocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
