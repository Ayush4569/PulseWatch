"use client";

import { AuthProvider } from "@/context/auth-context";
import { queryClient } from "@/lib/query-client";
import { SocketProvider } from "@/socket/socket-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
        {children}
        <Toaster position="top-right" theme="dark" richColors />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
