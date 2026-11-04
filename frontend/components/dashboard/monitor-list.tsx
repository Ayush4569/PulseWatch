"use client";

import { useEffect, useMemo, useState } from "react";
import { Radio, RefreshCw, Search, Plus } from "lucide-react";
import { toast } from "sonner";

import { MonitorCard } from "@/components/dashboard/monitor-card";
import { MonitorListSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { getApiErrorMessage } from "@/lib/api/client";
import type { Monitor } from "@/lib/types";

interface MonitorListProps {
  monitors: Monitor[];
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
  onCreateMonitor?: () => void;
  columns?: "dashboard" | "page";
  showSearch?: boolean;
}

export function MonitorList({
  monitors,
  isPending,
  error,
  onRetry,
  onCreateMonitor,
  columns = "dashboard",
  showSearch = true,
}: MonitorListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (error) {
      toast.error("Failed to load monitors", {
        description: getApiErrorMessage(error),
        id: "monitors-load-error",
      });
    }
  }, [error]);

  const filteredMonitors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return monitors;

    return monitors.filter((monitor) =>
      monitor.url.toLowerCase().includes(query)
    );
  }, [monitors, searchQuery]);

  const gridClassName =
    columns === "page"
      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5";

  // Loading state with stable skeleton layout (no CLS)
  if (isPending) {
    return (
      <div className="space-y-4">
        {showSearch && (
          <div className="h-9 w-full max-w-md rounded-lg bg-muted/40 animate-pulse" />
        )}
        <MonitorListSkeleton count={columns === "page" ? 8 : 6} columns={columns} />
      </div>
    );
  }

  // Error state
  if (error && monitors.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm text-foreground font-medium">
          Unable to load your monitors.
        </p>
        <p className="text-xs text-muted-foreground">
          {getApiErrorMessage(error)}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white dark:text-neutral-950 transition hover:bg-emerald-500 dark:hover:bg-emerald-400 active:scale-95"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSearch && (
        <div className="relative max-w-md">
          <Search
            className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />

          <input
            type="search"
            placeholder="Search by URL or hostname..."
            aria-label="Search monitors by URL or hostname"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder-muted-foreground focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>
      )}

      {filteredMonitors.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
          <Radio className="mx-auto mb-3 h-8 w-8 text-muted-foreground/60" />

          <p className="text-sm font-semibold text-foreground">
            {monitors.length === 0
              ? "You haven't created any monitors yet"
              : "No monitors match your search"}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {monitors.length === 0
              ? "Start tracking your HTTP endpoints and APIs in real time."
              : "Try searching with a different URL or keyword."}
          </p>

          {monitors.length === 0 && onCreateMonitor && (
            <button
              type="button"
              onClick={onCreateMonitor}
              className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white dark:text-neutral-950 transition hover:bg-emerald-500 dark:hover:bg-emerald-400 shadow-sm active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Create your first monitor
            </button>
          )}
        </div>
      ) : (
        <div className={gridClassName}>
          {filteredMonitors.map((monitor) => (
            <MonitorCard key={monitor.id} monitor={monitor} />
          ))}
        </div>
      )}
    </div>
  );
}
