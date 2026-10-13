"use client";

import Link from "next/link";
import { Activity, ShieldCheck, Zap, Radio, ArrowRight, Server } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500 selection:text-black">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -z-10 h-[500px] w-full max-w-7xl -translate-x-1/2 opacity-20 blur-[120px] bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 pointer-events-none" />

      {/* Header */}
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Activity className="h-5 w-5 text-emerald-400" />
          </div>
          <span>Pulse<span className="text-emerald-400">Watch</span></span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-neutral-300 hover:text-white transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-8">
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          <span>Real-time WebSocket Monitoring Platform</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
          Real-time Uptime & Incident Monitoring for Developers
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-neutral-400">
          Monitor HTTP endpoints, track latency in real-time with WebSockets, receive instant incident notifications, and ensure maximum reliability for your web infrastructure.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-neutral-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition"
          >
            <span>View Dashboard Preview</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-neutral-800 bg-neutral-900 px-6 py-3.5 text-sm font-semibold text-white hover:bg-neutral-800 transition"
          >
            Sign In to Account
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-3 text-left">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">WebSocket Real-Time Checks</h3>
            <p className="mt-2 text-sm text-neutral-400">
              Instant monitor status updates streamed over WebSockets without manual page reloads or polling spam.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Incident Alerts</h3>
            <p className="mt-2 text-sm text-neutral-400">
              Automatic incident creation on consecutive check failures, with live resolution tracking when services recover.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-4">
              <Server className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Latency & Uptime Metrics</h3>
            <p className="mt-2 text-sm text-neutral-400">
              24-hour historical uptime percentage, average response latency, and time-series performance charts.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
