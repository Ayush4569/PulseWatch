"use client";

import Link from "next/link";
import { Monitor } from "../../lib/types";
import { formatLatency, formatUptime, formatTimeAgo, getDomainFromUrl } from "../../lib/formatters";
import { ExternalLink, ShieldAlert, ArrowRight, Clock, Zap } from "lucide-react";

interface MonitorCardProps {
  monitor: Monitor;
}

export function MonitorCard({ monitor }: MonitorCardProps) {
  const isDown = monitor.lastStatus === "DOWN" || monitor.hasActiveIncident;
  const isWaiting = !monitor.lastStatus || monitor.lastStatus === "WAITING";
  const isDegraded = monitor.lastStatus === "DEGRADED";

  let statusBadge = {
    label: "Operational",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    dotColor: "bg-emerald-400 animate-pulse",
  };

  if (isDown) {
    statusBadge = {
      label: "Incident / Down",
      bgColor: "bg-red-500/10",
      textColor: "text-red-400",
      borderColor: "border-red-500/30",
      dotColor: "bg-red-500 animate-ping",
    };
  } else if (isDegraded) {
    statusBadge = {
      label: "Degraded",
      bgColor: "bg-amber-500/10",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      dotColor: "bg-amber-400",
    };
  } else if (isWaiting) {
    statusBadge = {
      label: "Waiting Checks",
      bgColor: "bg-neutral-800",
      textColor: "text-neutral-400",
      borderColor: "border-neutral-700",
      dotColor: "bg-neutral-500",
    };
  }

  return (
    <div className={`group relative overflow-hidden rounded-xl border bg-neutral-900/80 p-5 shadow-lg transition-all duration-200 hover:border-neutral-700 hover:shadow-2xl ${
      isDown ? "border-red-900/60 bg-red-950/10" : "border-neutral-800"
    }`}>
      {/* Active Incident Warning Banner */}
      {isDown && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-red-950/60 border border-red-800/60 px-3 py-2 text-xs text-red-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-400 animate-bounce" />
            <span className="font-semibold">Active Incident</span>
          </div>
          {monitor.lastErrorMessage && (
            <span className="truncate max-w-[200px] text-[11px] text-red-400/90">{monitor.lastErrorMessage}</span>
          )}
        </div>
      )}

      {/* Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-base truncate group-hover:text-emerald-400 transition-colors">
              {getDomainFromUrl(monitor.url)}
            </h3>
            <a
              href={monitor.url}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-500 hover:text-neutral-300 transition"
              title="Open link"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="text-xs text-neutral-400 truncate mt-0.5">{monitor.url}</p>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge.bgColor} ${statusBadge.textColor} ${statusBadge.borderColor}`}>
          <span className={`h-2 w-2 rounded-full ${statusBadge.dotColor}`} />
          <span>{statusBadge.label}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-b border-neutral-800/80 py-3 text-center">
        <div>
          <span className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Uptime</span>
          <span className="mt-0.5 block text-sm font-bold text-white">
            {formatUptime(monitor.uptime)}
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Latency</span>
          <span className="mt-0.5 block text-sm font-bold text-white">
            {formatLatency(monitor.lastLatencyMs)}
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider">Interval</span>
          <span className="mt-0.5 block text-sm font-bold text-white flex items-center justify-center gap-1">
            <Clock className="h-3 w-3 text-neutral-400" />
            {monitor.interval}s
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Zap className="h-3.5 w-3.5 text-emerald-400" />
          <span>Checked {formatTimeAgo(monitor.lastCheckedAt)}</span>
        </div>

        <Link
          href={`/dashboard/monitors/${monitor.id}`}
          className="flex items-center gap-1 font-semibold text-emerald-400 hover:text-emerald-300 transition"
        >
          <span>Analytics</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
