"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  ShieldCheck,
  Zap,
  Radio,
  ArrowRight,
  Server,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuthContext } from "@/context/auth-context";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/client";

export default function LandingPage() {
  const { isAuthenticated, loading, loginAsGuest } = useAuthContext();
  const [guestLoading, setGuestLoading] = useState(false);
  const router = useRouter();

  const handleGuestLaunch = async () => {
    setGuestLoading(true);
    try {
      await loginAsGuest();
      toast.success("Guest session started!", {
        description: "You have 1 free monitor available to test the platform.",
      });
      router.push("/dashboard");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500 selection:text-black transition-colors duration-200 overflow-x-hidden">
      {/* Background Animated Glow */}
      <div className="absolute top-0 left-1/2 -z-10 h-[550px] w-full max-w-7xl -translate-x-1/2 opacity-25 dark:opacity-25 blur-[120px] bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 pointer-events-none animate-pulse-glow" />

      {/* Header */}
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 border-b border-border/40 animate-fade-in-up">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 transition-transform group-hover:scale-105">
            <Activity className="h-5 w-5 animate-pulse" />
          </div>
          <span>
            Pulse<span className="text-emerald-500">Watch</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {loading ? (
            <div className="h-9 w-28 rounded-lg bg-muted/60 animate-pulse" />
          ) : isAuthenticated ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-950 hover:bg-emerald-400 transition shadow-sm active:scale-95"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGuestLaunch}
                disabled={guestLoading}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition px-3 py-1.5 rounded-lg border border-emerald-500/20"
              >
                <Sparkles className="h-3 w-3" />
                <span>{guestLoading ? "Starting..." : "Try as Guest"}</span>
              </button>
              <Link
                href="/login"
                className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-emerald-500 px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-950 hover:bg-emerald-400 transition shadow-sm active:scale-95"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 pt-16 sm:pt-20 pb-24 text-center">
        {/* Animated Badge Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-8 shadow-xs animate-fade-in-up">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span>Real-time WebSocket Monitoring Platform</span>
        </div>

        {/* Animated Headline with Gradient Shimmer */}
        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl text-foreground leading-[1.12] animate-fade-in-up delay-150">
          Real-time{" "}
          <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-x">
            Uptime & Incident
          </span>{" "}
          Monitoring for Developers
        </h1>

        {/* Animated Subtitle */}
        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed animate-fade-in-up delay-300">
          Monitor HTTP endpoints with precision, stream millisecond response latency via WebSockets, detect outages instantly with automated alerts, and synthesize AI-powered system health summaries.
        </p>

        {/* Animated Call-to-Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up delay-400">
          {loading ? (
            <div className="h-12 w-48 rounded-xl bg-muted/60 animate-pulse" />
          ) : isAuthenticated ? (
            /* Authenticated user: Only Go to Dashboard button */
            <Link
              href="/dashboard"
              className="group flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-bold text-neutral-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          ) : (
            /* Unauthenticated user: Get Started + Try as Guest + Sign In */
            <>
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-xl bg-emerald-500 px-7 py-3.5 text-sm font-bold text-neutral-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <span>Get Started Free</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={handleGuestLaunch}
                disabled={guestLoading}
                className="flex items-center gap-2 rounded-xl border border-border bg-card/80 backdrop-blur-xs px-6 py-3.5 text-sm font-semibold text-foreground hover:bg-accent hover:border-emerald-500/40 transition-all shadow-xs active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <span>{guestLoading ? "Initializing..." : "Try Live as Guest (1 Monitor)"}</span>
              </button>

              <Link
                href="/login"
                className="rounded-xl border border-transparent px-5 py-3.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </div>

        {/* Live Mockup / Interactive Preview Element */}
        <div className="mt-16 mx-auto max-w-3xl rounded-2xl border border-border bg-card/70 p-6 shadow-xl backdrop-blur-md animate-fade-in-up delay-500 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-mono text-xs font-bold text-foreground">
                  https://api.pulsewatch.dev/v1/health
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Monitored every 30 seconds · Global HTTP Probe
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                99.98% Uptime
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Response Time</span>
              <p className="text-sm font-bold text-foreground">42ms</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Checks Run</span>
              <p className="text-sm font-bold text-foreground">1,420</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Active Incidents</span>
              <p className="text-sm font-bold text-emerald-500">0 Open</p>
            </div>
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">AI Intelligence</span>
              <p className="text-sm font-bold text-foreground">Operational</p>
            </div>
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="group rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xs transition hover:border-emerald-500/40 hover:bg-card">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Real-time WebSocket Telemetry</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Sub-millisecond latency graphs and live ping logs pushed instantly to your dashboard via authenticated WebSocket sockets.
            </p>
          </div>

          <div className="group rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xs transition hover:border-emerald-500/40 hover:bg-card">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500 border border-teal-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Autonomous Incident Detection</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Automatic incident opening upon consecutive health check failures and automated resolution logging once services recover.
            </p>
          </div>

          <div className="group rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-xs transition hover:border-emerald-500/40 hover:bg-card">
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">AI Telemetry Intelligence</h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Integrated LLM & telemetry engine analyzes latency spikes, downtime trends, and error patterns to provide actionable reliability insights.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
