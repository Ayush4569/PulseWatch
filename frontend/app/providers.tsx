"use client";

import { AuthProvider } from "@/context/auth-context";
import React from "react";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-right" theme="dark" richColors />
    </AuthProvider>
  );
}
