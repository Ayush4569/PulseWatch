"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, ShieldAlert } from "lucide-react";
import { useAuthContext } from "@/context/auth-context";

interface GuestBannerProps {
  monitorCount: number;
}

export function GuestBanner({ monitorCount }: GuestBannerProps) {
  const { user } = useAuthContext();

  if (!user?.isGuest) return null;

  return (
    <aside
      aria-label="Guest session notification"
      className="relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 p-4 shadow-xs transition-all animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold tracking-wide uppercase text-amber-600 dark:text-amber-400">
                Guest Mode
              </span>
              <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/20">
                {monitorCount}/1 Monitor Used
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You are using a temporary guest session. Your live checks and latency data will be lost when your browser clears cookies. Create a free account to keep your monitors permanently.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 sm:self-center">
          <Link
            href="/register"
            className="group inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 dark:bg-emerald-500 px-3.5 py-2 text-xs font-semibold text-white dark:text-neutral-950 shadow-sm transition hover:bg-emerald-500 dark:hover:bg-emerald-400 active:scale-95"
          >
            <span>Save Monitor & Sign Up</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
