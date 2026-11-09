"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Check, ShieldCheck, Sparkles, X, ArrowRight } from "lucide-react";

interface GuestLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuestLimitModal({ isOpen, onClose }: GuestLimitModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const features = [
    "Unlimited HTTP/HTTPS endpoint monitors",
    "Real-time WebSocket latency streaming",
    "Preserve your current guest monitor & history",
    "Automated incident tracking & failure logs",
    "Configurable check intervals (30s, 60s, 5m)",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-4">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>

          <h3 className="text-lg font-bold text-foreground">
            Guest Limit Reached (1/1 Monitor)
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            Guest sessions are limited to <span className="font-semibold text-foreground">1 active monitor</span> to test the platform. Sign up for a free account to unlock full monitoring capabilities.
          </p>
        </div>

        {/* Feature List */}
        <div className="mt-5 rounded-xl border border-border/60 bg-muted/30 p-3.5 space-y-2.5">
          <p className="text-[11px] font-semibold tracking-wide uppercase text-muted-foreground">
            What you unlock with a free account:
          </p>
          <ul className="space-y-2 text-xs text-foreground">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Check className="h-2.5 w-2.5 stroke-3" />
                </div>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col gap-2.5">
          <Link
            href="/register"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 dark:bg-emerald-500 py-2.5 text-xs font-bold text-white dark:text-neutral-950 shadow-md transition hover:bg-emerald-500 dark:hover:bg-emerald-400 active:scale-98"
          >
            <span>Create Free Account (Keep My Monitor)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-border py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            Continue with 1 Monitor
          </button>
        </div>
      </div>
    </div>
  );
}
