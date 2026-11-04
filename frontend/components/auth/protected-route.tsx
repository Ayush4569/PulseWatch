"use client";

import { useAuthContext } from "@/context/auth-context";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-skeletons";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const redirectUrl =
        pathname && pathname !== "/"
          ? `/login?redirect=${encodeURIComponent(pathname)}`
          : "/login";
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-300">
        <DashboardPageSkeleton />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Keep skeleton while redirecting to avoid flashing unauthenticated content
    return (
      <div className="min-h-screen bg-background text-foreground">
        <DashboardPageSkeleton />
      </div>
    );
  }

  return <>{children}</>;
}
