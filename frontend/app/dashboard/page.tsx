"use client";

import { useMemo, useState } from "react";
import { queryClient } from "@/lib/query-client";
import { Navbar } from "../../components/layout/navbar";
import { OverviewStats } from "../../components/dashboard/overview-stats";
import { MonitorCard } from "../../components/dashboard/monitor-card";
import { CreateMonitorModal } from "../../components/dashboard/create-monitor-modal";
import { LiveActivity } from "../../components/dashboard/live-activity";
import { MOCK_RECENT_CHECKS } from "../../lib/mock-data";
import type { CreateMonitor, Monitor } from "../../lib/types";
import { Loader2, Plus, Radio, RefreshCw, Search } from "lucide-react";
import { getApiErrorMessage } from "../../lib/api/client";
import { useMonitors } from "@/hooks/useListMonitors";
import { MonitorList } from "@/components/dashboard/monitor-list";

export default function DashboardPage() {

  const {
    data: monitors = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useMonitors();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


  const aggregatedStats = useMemo(() => {
    const uptimeValues = monitors
      .map((monitor) => monitor.uptime)
      .filter(
        (uptime): uptime is number =>
          uptime != null && Number.isFinite(uptime)
      );

    const latencyValues = monitors
      .map((monitor) => monitor.lastLatencyMs)
      .filter(
        (latency): latency is number =>
          latency != null && Number.isFinite(latency)
      );

    return {
      total: monitors.length,
      avgUptime:
        uptimeValues.length > 0
          ? uptimeValues.reduce((sum, value) => sum + value, 0) /
          uptimeValues.length
          : 0,
      avgLatencyMs:
        latencyValues.length > 0
          ? latencyValues.reduce((sum, value) => sum + value, 0) /
          latencyValues.length
          : 0,
      activeIncidentsCount: monitors.filter(
        (monitor) => monitor.hasActiveIncident
      ).length,
    };
  }, [monitors]);

  const handleMonitorCreated = (created: CreateMonitor) => {
    const monitor: Monitor = {
      ...created,
      isActive: true,
      lastStatus: "WAITING",
      lastLatencyMs: null,
      lastCheckedAt: null,
      lastErrorMessage: null,
      hasActiveIncident: false,
      uptime: null,
    };


    queryClient.setQueryData<Monitor[]>(
      ["monitors"],
      (previous = []) => [
        monitor,
        ...previous.filter((item) => item.id !== monitor.id),
      ]
    );

    setIsCreateModalOpen(false);
  };


  const getMonitorUrlById = (id: string) => {
    const found = monitors.find((monitor) => monitor.id === id);
    return found ? found.url : `Monitor ${id}`;
  };

  const errorMessage = error
    ? getApiErrorMessage(error)
    : null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500 selection:text-black">
      <Navbar
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-neutral-800/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
              <span>Monitoring Overview</span>
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            </h1>

            <p className="mt-1 text-xs text-neutral-400">
              Live uptime, latency, and incident metrics across
              all your endpoints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => void refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-neutral-400 ${isFetching ? "animate-spin" : ""
                  }`}
              />
              <span>
                {isFetching ? "Refreshing..." : "Refresh"}
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

        {/* Initial loading state */}
        {isPending ? (
          <div className={`h-screen w-screen flex items-center justify-center `}>
            <Loader2
              className="animate-spin text-purple-600 dark:text-fuchsia-400"
              size={50}
            />
          </div>
        ) : error ? (
          /* Error state */
          <div className="flex items-center justify-between gap-4 rounded-lg border border-red-900 bg-red-950/30 p-4">
            <p className="text-sm text-red-300">
              {errorMessage || "Failed to load monitors."}
            </p>

            <button
              onClick={() => void refetch()}
              disabled={isFetching}
              className="shrink-0 text-sm font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-50"
            >
              {isFetching ? "Retrying..." : "Try again"}
            </button>
          </div>
        ) : (
          <>
            {/* Overview statistics */}
            <OverviewStats
              totalMonitors={aggregatedStats.total}
              avgUptime={aggregatedStats.avgUptime}
              activeIncidentsCount={aggregatedStats.activeIncidentsCount}
              avgLatencyMs={aggregatedStats.avgLatencyMs}
            />

            {/* Main grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Monitors */}
              <div className="min-w-0 space-y-4 lg:col-span-2">
                <h2 className="flex items-center gap-2 text-base font-bold text-white">
                  <Radio className="h-4 w-4 text-emerald-400" />
                  <span>Active Endpoints ({monitors.length})</span>
                </h2>

                <MonitorList
                  monitors={monitors}
                  isPending={isPending}
                  error={error}
                  onRetry={() => void refetch()}
                  onCreateMonitor={() => setIsCreateModalOpen(true)}
                  columns="dashboard"
                />
              </div>

              {/* Recent activity */}
              <div className="min-w-0 self-end ">
                <LiveActivity
                  checks={MOCK_RECENT_CHECKS}
                  getMonitorUrl={getMonitorUrlById}
                />
              </div>
            </div>
          </>
        )}
      </main>

      <CreateMonitorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMonitorCreated={handleMonitorCreated}
      />
    </div>
  );
}
