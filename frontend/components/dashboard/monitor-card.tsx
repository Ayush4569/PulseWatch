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
  const isDown =
    !isPaused && (monitor.lastStatus === "DOWN" || monitor.hasActiveIncident);
  const isWaiting =
    !isPaused && (!monitor.lastStatus || monitor.lastStatus === "WAITING");
  const isDegraded = !isPaused && monitor.lastStatus === "DEGRADED";

  let statusBadge = {
    label: "Operational",
    bgColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    dotColor: "bg-emerald-500 dark:bg-emerald-400 animate-pulse",
  };

  if (isPaused) {
    statusBadge = {
      label: "Paused",
      bgColor: "bg-muted text-muted-foreground border-border",
      dotColor: "bg-muted-foreground",
    };
  } else if (isDown) {
    statusBadge = {
      label: "Incident / Down",
      bgColor: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
      dotColor: "bg-red-500 animate-ping",
    };
  } else if (isDegraded) {
    statusBadge = {
      label: "Degraded",
      bgColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      dotColor: "bg-amber-500",
    };
  } else if (isWaiting) {
    statusBadge = {
      label: "Waiting Checks",
      bgColor: "bg-muted text-muted-foreground border-border",
      dotColor: "bg-muted-foreground",
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
      className={`group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md ${
        isDown
          ? "border-red-500/40 bg-red-500/5 dark:bg-red-950/10"
          : isPaused
          ? "border-border/60 opacity-80"
          : "border-border hover:border-emerald-500/30"
      }`}
    >
      {/* Active Incident Warning Banner */}
      {isDown && (
        <div className="mb-4 flex items-center justify-between rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-600 dark:text-red-300">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500 animate-bounce" />
            <span className="font-semibold">Active Incident</span>
          </div>
          {monitor.lastErrorMessage && (
            <span className="truncate max-w-[200px] text-[11px] text-red-600/90 dark:text-red-400/90">
              {monitor.lastErrorMessage}
            </span>
          )}
        </div>
      )}

      {/* Delete Confirmation Overlay */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/95 p-4 text-center backdrop-blur-sm animate-in fade-in duration-150">
          <p className="text-xs font-semibold text-foreground">
            Delete this monitor and all history?
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            This action cannot be undone.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteMutation.isPending}
              className="rounded-md border border-border px-3 py-1 text-xs text-foreground hover:bg-muted transition"
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
            <h3 className="font-bold text-foreground text-base truncate group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
              {getDomainFromUrl(monitor.url)}
            </h3>
            <a
              href={monitor.url}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-foreground transition"
              title="Open link in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {monitor.url}
          </p>
        </div>

        {/* Status Badge & Actions */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadge.bgColor}`}
          >
            <span className={`h-2 w-2 rounded-full ${statusBadge.dotColor}`} />
            <span>{statusBadge.label}</span>
          </div>

          {/* Quick Pause / Resume Button */}
          <button
            onClick={handleToggle}
            disabled={toggleMutation.isPending}
            className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition disabled:opacity-50 active:scale-95"
            title={isPaused ? "Resume monitor" : "Pause monitor"}
          >
            {toggleMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
            ) : isPaused ? (
              <Play className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Pause className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Quick Delete Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-lg border border-border bg-card p-1.5 text-muted-foreground hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-500 transition active:scale-95"
            title="Delete monitor"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Metrics Row Container */}
      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-muted/40 border border-border/60 p-2.5 text-center">
        <div className="px-1">
          <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Uptime
          </span>
          <span className="mt-0.5 block text-sm font-bold text-foreground">
            {formatUptime(monitor.uptime)}
          </span>
        </div>

        <div className="px-1 border-x border-border/60">
          <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Latency
          </span>
          <span className="mt-0.5 block text-sm font-bold text-foreground">
            {formatLatency(monitor.lastLatencyMs)}
          </span>
        </div>

        <div className="px-1">
          <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Interval
          </span>
          <span className="mt-0.5 flex items-center justify-center gap-1 text-sm font-bold text-foreground">
            <Clock className="h-3 w-3 text-muted-foreground" />
            {monitor.interval}s
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
          <span>
            {monitor.lastCheckedAt
              ? `Checked ${formatTimeAgo(monitor.lastCheckedAt)}`
              : "Awaiting first execution"}
          </span>
        </div>

        <Link
          href={`/dashboard/monitors/${monitor.id}`}
          className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline transition"
        >
          <span>Details</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
