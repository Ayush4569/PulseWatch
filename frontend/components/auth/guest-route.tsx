"use client";

import { useAuthContext } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Only fully registered users are prevented from accessing auth pages.
  // Guests (user.isGuest === true) are permitted so they can create an account or sign in.
  const isRegisteredUser = isAuthenticated && !user?.isGuest;

  useEffect(() => {
    if (!loading && isRegisteredUser) {
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.replace(redirect);
    }
  }, [isRegisteredUser, loading, router, searchParams]);

  if (loading || isRegisteredUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12 text-foreground">
        <div className="w-full max-w-md space-y-6 rounded-2xl border border-border bg-card p-8 shadow-xl">
          <div className="flex flex-col items-center space-y-3">
            <Skeleton className="h-12 w-12 rounded-xl" />
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-52" />
          </div>
          <div className="space-y-4 pt-4">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
