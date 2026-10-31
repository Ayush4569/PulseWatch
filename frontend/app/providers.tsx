"use client";

import { AuthProvider } from "@/context/auth-context";
import { queryClient } from "@/lib/query-client";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" theme="dark" richColors />
      </QueryClientProvider>
    </AuthProvider>
  );
}
