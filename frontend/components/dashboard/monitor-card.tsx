"use client";

import { useState } from "react";
import Link from "next/link";
import { Monitor } from "../../lib/types";
import {
  formatLatency,
  formatUptime,
  formatTimeAgo,
  getDomainFromUrl,
} from "../../lib/formatters";
import {
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Clock,
  Zap,
  Pause,
  Play,
  Trash2,
  Loader2,
} from "lucide-react";
import { useToggleMonitor, useDeleteMonitor } from "@/hooks/useMonitorActions";

interface MonitorCardProps {
  monitor: Monitor;
}

export function MonitorCard({ monitor }: MonitorCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const toggleMutation = useToggleMonitor();
  const deleteMutation = useDeleteMonitor();

  const isPaused = monitor.isActive === false;
  const isDown = !isPaused && (monitor.lastStatus === "DOWN" || monitor.hasActiveIncident);
  const isWaiting = !isPaused && (!monitor.lastStatus || monitor.lastStatus === "WAITING");
  const isDegraded = !isPaused && monitor.lastStatus === "DEGRADED";

  let statusBadge = {
    label: "Operational",
    bgColor: "bg-emerald-500/10",
    textColor: "text-emerald-400",
    borderColor: "border-emerald-500/30",
    dotColor: "bg-emerald-400 animate-pulse",
  };

  if (isPaused) {
    statusBadge = {
      label: "Paused",
      bgColor: "bg-neutral-800",
      textColor: "text-neutral-400",
      borderColor: "border-neutral-700",
      dotColor: "bg-neutral-500",
    };
  } else if (isDown) {
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

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMutation.mutate({
      monitorId: monitor.id,
      isActive: isPaused,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate(monitor.id);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-neutral-900/80 p-5 shadow-lg transition-all duration-200 hover:border-neutral-700 hover:shadow-2xl ${
        isDown
          ? "border-red-900/60 bg-red-950/10"
          : isPaused
          ? "border-neutral-800/60 opacity-80"
          : "border-neutral-800"
      }`}
    >
      {/* Active Incident Warning Banner */}
      {isDown && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-red-950/60 border border-red-800/60 px-3 py-2 text-xs text-red-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-400 animate-bounce" />
            <span className="font-semibold">Active Incident</span>
          </div>
          {monitor.lastErrorMessage && (
            <span className="truncate max-w-[200px] text-[11px] text-red-400/90">
              {monitor.lastErrorMessage}
            </span>
          )}
        </div>
      )}

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-neutral-950/95 p-4 text-center backdrop-blur-sm animate-in fade-in">
          <p className="text-xs font-semibold text-white">
            Delete this monitor and all history?
          </p>
          <p className="mt-1 text-[11px] text-neutral-400">
            This action cannot be undone.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteMutation.isPending}
              className="rounded-md border border-neutral-800 px-3 py-1 text-xs text-neutral-300 hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500 transition disabled:opacity-50"
            >
              {deleteMutation.isPending && (
                <Loader2 className="h-3 w-3 animate-spin" />
              )}
              <span>Delete</span>
            </button>
          </div>
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
              title="Open link in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="text-xs text-neutral-400 truncate mt-0.5">
            {monitor.url}
          </p>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge.bgColor} ${statusBadge.textColor} ${statusBadge.borderColor}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusBadge.dotColor}`} />
            <span>{statusBadge.label}</span>
          </div>

          {/* Quick Pause / Resume Button */}
          <button
            onClick={handleToggle}
            disabled={toggleMutation.isPending}
            className="rounded-lg border border-neutral-800 bg-neutral-900 p-1.5 text-neutral-400 hover:border-neutral-700 hover:text-white transition disabled:opacity-50"
            title={isPaused ? "Resume monitor" : "Pause monitor"}
          >
            {toggleMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            ) : isPaused ? (
              <Play className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Pause className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Quick Delete Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 p-1.5 text-neutral-400 hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400 transition"
            title="Delete monitor"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-5 grid grid-cols-3 gap-2 border-t border-b border-neutral-800/80 py-3 text-center">
        <div>
          <span className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
            Uptime
          </span>
          <span className="mt-0.5 block text-sm font-bold text-white">
            {formatUptime(monitor.uptime)}
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
            Latency
          </span>
          <span className="mt-0.5 block text-sm font-bold text-white">
            {formatLatency(monitor.lastLatencyMs)}
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
            Interval
          </span>
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
          <span>
            {monitor.lastCheckedAt
              ? `Checked ${formatTimeAgo(monitor.lastCheckedAt)}`
              : "Not checked yet"}
          </span>
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
