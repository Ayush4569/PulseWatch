"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";

import { Navbar } from "../../components/layout/navbar";
import { OverviewStats } from "../../components/dashboard/overview-stats";
import { MonitorCard } from "../../components/dashboard/monitor-card";
import { CreateMonitorModal } from "../../components/dashboard/create-monitor-modal";
import { LiveActivity } from "../../components/dashboard/live-activity";

import { MOCK_RECENT_CHECKS } from "../../lib/mock-data";
import type { CreateMonitor, Monitor } from "../../lib/types";

import { getMonitorsApi } from "../../lib/api/monitor";
import { getApiErrorMessage } from "../../lib/api/client";

import { Plus, Radio, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchMonitors = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setIsRefreshing(true);
    }

    try {
      setError(null);

      const response = await getMonitorsApi();

      if (!response.success || response.data === null) {
        throw new Error(
          response.message || "Failed to fetch monitors"
        );
      }

      setMonitors(response.data);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitors();
  }, [fetchMonitors]);

  // Derive overview statistics from real monitor data.
  const aggregatedStats = useMemo(() => {
    const total = monitors.length;

    const uptimeValues = monitors
      .map((monitor) => monitor.uptime)
      .filter(
        (uptime): uptime is number =>
          uptime !== null &&
          uptime !== undefined &&
          Number.isFinite(uptime)
      );

    const latencyValues = monitors
      .map((monitor) => monitor.lastLatencyMs)
      .filter(
        (latency): latency is number =>
          latency !== null &&
          latency !== undefined &&
          Number.isFinite(latency)
      );

    const avgUptime =
      uptimeValues.length > 0
        ? uptimeValues.reduce((sum, value) => sum + value, 0) /
        uptimeValues.length
        : 0;

    const avgLatencyMs =
      latencyValues.length > 0
        ? latencyValues.reduce((sum, value) => sum + value, 0) /
        latencyValues.length
        : 0;

    return {
      total,
      avgUptime,
      avgLatencyMs,
      activeIncidentsCount: 0,
    };
  }, [monitors]);

  const normalizeCreatedMonitor = (created: CreateMonitor): Monitor => {
    return {
      ...created,
      isActive: true,
      lastStatus: "WAITING",
      lastLatencyMs: null,
      lastCheckedAt: null,
      lastErrorMessage: null,
      hasActiveIncident: false,
      uptime: null,
    };
  }
  const handleMonitorCreated = (newMonitor: CreateMonitor) => {

    const monitor = normalizeCreatedMonitor(newMonitor);

    setMonitors((prev) => [
      monitor,
      ...prev.filter((item) => item.id !== monitor.id),
    ]);
  };

  const filteredMonitors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return monitors;

    return monitors.filter((monitor) =>
      monitor.url.toLowerCase().includes(query)
    );
  }, [monitors, searchQuery]);

  const getMonitorUrlById = (id: string) => {
    const found = monitors.find((monitor) => monitor.id === id);

    return found ? found.url : `Monitor ${id}`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500 selection:text-black">
      <Navbar
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 space-y-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-neutral-800/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
              <span>Monitoring Overview</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </h1>

            <p className="mt-1 text-xs text-neutral-400">
              Live uptime, latency, and incident metrics across
              all your endpoints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => void fetchMonitors(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-neutral-400 ${isRefreshing ? "animate-spin" : ""
                  }`}
              />
              <span>
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </span>
            </button>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-neutral-950 shadow-sm transition hover:bg-emerald-400"
            >
              <Plus className="h-4 w-4" />
              <span>New Monitor</span>
            </button>
          </div>
        </div>

        {/* Overview statistics */}
        {isLoading ? (
          <p className="text-sm text-neutral-400">
            Loading dashboard metrics...
          </p>
        ) : (
          <OverviewStats
            totalMonitors={aggregatedStats.total}
            avgUptime={aggregatedStats.avgUptime}
            activeIncidentsCount={
              aggregatedStats.activeIncidentsCount
            }
            avgLatencyMs={aggregatedStats.avgLatencyMs}
          />
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="flex items-center justify-between gap-4 rounded-lg border border-red-900 bg-red-950/30 p-4">
            <p className="text-sm text-red-300">{error}</p>

            <button
              onClick={() => void fetchMonitors(true)}
              className="shrink-0 text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              Try again
            </button>
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Monitors */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <h2 className="flex items-center gap-2 text-base font-bold text-white">
                <Radio className="h-4 w-4 text-emerald-400" />
                <span>
                  Active Endpoints ({filteredMonitors.length})
                </span>
              </h2>

              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-500" />

                <input
                  type="text"
                  placeholder="Filter endpoints..."
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-1.5 pl-8 pr-3 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {isLoading ? (
              <p className="py-8 text-sm text-neutral-400">
                Loading monitors...
              </p>
            ) : !error && filteredMonitors.length === 0 ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-8 text-center">
                <p className="text-sm text-neutral-300">
                  {monitors.length === 0
                    ? "You haven't created any monitors yet."
                    : "No monitors match your search."}
                </p>

                {monitors.length === 0 && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
                  >
                    Create your first monitor
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {filteredMonitors.map((monitor) => (
                  <MonitorCard
                    key={monitor.id}
                    monitor={monitor}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent activity: still mock data until check history API */}
          <div className="space-y-6">
            <LiveActivity
              checks={MOCK_RECENT_CHECKS}
              getMonitorUrl={getMonitorUrlById}
            />
          </div>
        </div>
      </main>

      <CreateMonitorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMonitorCreated={handleMonitorCreated}
      />
    </div>
  );
}
