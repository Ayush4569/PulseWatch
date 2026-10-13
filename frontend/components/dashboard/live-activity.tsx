"use client";

import { MonitorCheckEvent } from "../../lib/types";
import { formatLatency, formatTimeAgo } from "../../lib/formatters";
import { CheckCircle2, XCircle, Radio } from "lucide-react";

interface LiveActivityProps {
  checks: MonitorCheckEvent[];
  getMonitorUrl?: (monitorId: string) => string;
}

export function LiveActivity({ checks, getMonitorUrl }: LiveActivityProps) {
  if (checks.length === 0) {
    return (
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 text-center">
        <Radio className="mx-auto h-8 w-8 text-neutral-600 animate-pulse" />
        <p className="mt-2 text-xs text-neutral-400">Waiting for live WebSocket health check events...</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Check Stream</h3>
        </div>
        <span className="text-[11px] text-neutral-500">{checks.length} events received</span>
      </div>

      <div className="mt-3 max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
        {checks.slice(0, 15).map((check, index) => {
          const url = getMonitorUrl ? getMonitorUrl(check.monitorId) : `Monitor ${check.monitorId.slice(0, 8)}`;
          return (
            <div
              key={`${check.monitorId}-${index}`}
              className={`flex items-center justify-between rounded-lg p-2.5 text-xs transition-all animate-in fade-in slide-in-from-top-1 ${
                check.success
                  ? "bg-neutral-950/40 hover:bg-neutral-950/80 text-neutral-300"
                  : "bg-red-950/30 border border-red-900/40 text-red-200"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {check.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-red-400" />
                )}
                <span className="font-semibold text-white truncate max-w-[220px]">{url}</span>
                <span className="text-neutral-500">·</span>
                <span className={check.success ? "text-emerald-400 font-mono font-medium" : "text-red-400 font-medium"}>
                  {check.success ? formatLatency(check.latencyMs) : check.errorMessage || "Failed"}
                </span>
              </div>

              <span className="text-[11px] text-neutral-500 shrink-0 ml-2">
                {formatTimeAgo(check.checkedAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
