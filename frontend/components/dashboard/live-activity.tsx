"use client";

import { MonitorCheckEvent } from "../../lib/types";
import { formatLatency, formatTimeAgo } from "../../lib/formatters";
import { CheckCircle2, XCircle, Radio } from "lucide-react";
import React from "react";

interface LiveActivityProps {
  checks: MonitorCheckEvent[];
  getMonitorUrl?: (monitorId: string) => string;
}

export function LiveActivity({ checks, getMonitorUrl }: LiveActivityProps) {
  if (checks.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <Radio className="mx-auto h-7 w-7 text-muted-foreground animate-pulse" />
        <p className="mt-2 text-xs font-medium text-foreground">Live Check Stream</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Waiting for live WebSocket health check events...
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Live Check Stream
          </h3>
        </div>
        <span className="text-[11px] text-muted-foreground">
          {checks.length} events received
        </span>
      </div>

      <div className="mt-3 max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {checks.slice(0, 15).map((check) => {
          const url = getMonitorUrl
            ? getMonitorUrl(check.monitorId)
            : "";
          if (!url) return null;
          return (
            <div
              key={`${check.monitorId}-${check.checkedAt}`}
              className={`flex items-center justify-between rounded-lg p-2.5 text-xs transition-all animate-in fade-in slide-in-from-top-1 duration-150 ${
                check.success
                  ? "bg-accent/40 hover:bg-accent text-foreground"
                  : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {check.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                )}
                <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-[260px]">
                  {url}
                </span>
                <span className="text-muted-foreground">·</span>
                <span
                  className={
                    check.success
                      ? "text-emerald-600 dark:text-emerald-400 font-mono font-medium"
                      : "text-red-500 font-medium"
                  }
                >
                  {check.success
                    ? formatLatency(check.latencyMs)
                    : check.errorMessage || "Failed"}
                </span>
              </div>

              <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                {formatTimeAgo(check.checkedAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
