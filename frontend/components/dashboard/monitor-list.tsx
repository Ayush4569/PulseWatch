
"use client";

import { useEffect, useMemo, useState } from "react";
import { Radio, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import { MonitorCard } from "@/components/dashboard/monitor-card";
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
      ? "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
      : "grid grid-cols-1 gap-4 md:grid-cols-2";


  if (isPending) {
    return (
      <div
        className="flex min-h-48 flex-col items-center justify-center gap-3"
        role="status"
        aria-live="polite"
      >
        <RefreshCw className="h-7 w-7 animate-spin text-emerald-400" />
        <p className="text-sm text-neutral-400">
          Loading monitors...
        </p>
      </div>
    );
  }


  if (error && monitors.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 text-center">
        <p className="text-sm text-neutral-300">
          Unable to load your monitors.
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400"
        >
          <RefreshCw className="h-4 w-4" />
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
            className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500"
            aria-hidden="true"
          />

          <input
            type="search"
            placeholder="Search by URL or hostname..."
            aria-label="Search monitors by URL or hostname"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>
      )}

      {filteredMonitors.length === 0 ? (
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 text-center">
          <Radio className="mx-auto mb-3 h-6 w-6 text-neutral-500" />

          <p className="text-sm text-neutral-300">
            {monitors.length === 0
              ? "You haven't created any monitors yet."
              : "No monitors match your search."}
          </p>

          {monitors.length === 0 && onCreateMonitor && (
            <button
              type="button"
              onClick={onCreateMonitor}
              className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-emerald-400"
            >
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
