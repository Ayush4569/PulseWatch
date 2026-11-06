"use client";

import { useAiSummary } from "@/hooks/useAiSummary";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Info,
  Lightbulb,
  Radio,
  Cpu,
} from "lucide-react";

export function AiDashboardSummary() {
  const { data, isPending, isFetching, error, refetch } = useAiSummary();

  if (isPending) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs animate-pulse">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-muted" />
            <div className="space-y-1.5">
              <div className="h-4 w-36 rounded-md bg-muted" />
              <div className="h-3 w-24 rounded-md bg-muted/60" />
            </div>
          </div>
          <div className="h-6 w-24 rounded-full bg-muted" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-5 w-3/4 rounded-md bg-muted" />
          <div className="h-4 w-full rounded-md bg-muted/60" />
          <div className="h-4 w-2/3 rounded-md bg-muted/60" />
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-16 rounded-xl bg-muted/40" />
          <div className="h-16 rounded-xl bg-muted/40" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span>AI telemetry summary unavailable temporarily.</span>
          </div>
          <button
            onClick={() => void refetch()}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground hover:bg-accent transition"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  const { status, headline, summary, keyFindings, recommendations, aiPowered, model } =
    data;

  const statusConfig = {
    HEALTHY: {
      label: "System Healthy",
      badgeClass:
        "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      dotClass: "bg-emerald-500",
      icon: CheckCircle2,
    },
    DEGRADED: {
      label: "Performance Degraded",
      badgeClass:
        "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
      dotClass: "bg-amber-500",
      icon: AlertTriangle,
    },
    CRITICAL: {
      label: "Critical Outage",
      badgeClass:
        "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
      dotClass: "bg-rose-500",
      icon: AlertOctagon,
    },
    INSUFFICIENT_DATA: {
      label: "Awaiting Telemetry",
      badgeClass:
        "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
      dotClass: "bg-blue-500",
      icon: Radio,
    },
  }[status] || {
    label: "Status Active",
    badgeClass: "border-border bg-muted text-muted-foreground",
    dotClass: "bg-muted-foreground",
    icon: Info,
  };

  const StatusIcon = statusConfig.icon;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-muted/20 p-5 sm:p-6 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/20 to-cyan-500/20 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-foreground tracking-tight">
                AI Telemetry Intelligence
              </h2>
              <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border border-border">
                <Cpu className="h-3 w-3" />
                {model || "Gemini 2.5 Flash"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Automated synthesis across active endpoints, latency, and incident reports.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusConfig.badgeClass}`}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  status === "CRITICAL"
                    ? "animate-ping bg-rose-400"
                    : status === "DEGRADED"
                    ? "animate-ping bg-amber-400"
                    : "animate-ping bg-emerald-400"
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${statusConfig.dotClass}`}
              />
            </span>
            <StatusIcon className="h-3.5 w-3.5" />
            <span>{statusConfig.label}</span>
          </div>

          {/* Refresh Analysis Button */}
          <button
            type="button"
            onClick={() => void refetch()}
            disabled={isFetching}
            className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-accent disabled:opacity-50 active:scale-95"
            title="Re-run AI telemetry analysis"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-muted-foreground ${
                isFetching ? "animate-spin" : ""
              }`}
            />
            <span className="hidden sm:inline">
              {isFetching ? "Analyzing..." : "Refresh"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Analysis Body */}
      <div className="mt-4 space-y-3">
        <h3 className="text-base sm:text-lg font-bold text-foreground leading-snug tracking-tight">
          {headline}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {summary}
        </p>
      </div>

      {/* Key Findings Grid */}
      {keyFindings && keyFindings.length > 0 && (
        <div className="mt-5 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Key Telemetry Findings
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {keyFindings.map((finding, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-2.5 text-xs text-foreground transition hover:border-border"
              >
                <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                </div>
                <span className="leading-snug">{finding}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations Box */}
      {recommendations && recommendations.length > 0 && (
        <div className="mt-5 rounded-xl border border-border/80 bg-accent/40 p-3.5">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-amber-500/10 text-amber-500 dark:text-amber-400">
              <Lightbulb className="h-3.5 w-3.5" />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-wide text-foreground">
                Actionable Recommendations
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="leading-relaxed">
                    • {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
