"use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { CreateMonitorModal } from "@/components/dashboard/create-monitor-modal";
import { LiveActivity } from "@/components/dashboard/live-activity";
import type { CreateMonitor, Monitor } from "@/lib/types";
import { Plus, Radio, RefreshCw } from "lucide-react";
import { useMonitors } from "@/hooks/useListMonitors";
import { MonitorList } from "@/components/dashboard/monitor-list";
import { useSocket } from "@/socket/socket-provider";
import { queryClient } from "@/lib/query-client";
import { DashboardPageSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { useAuthContext } from "@/context/auth-context";
import { GuestBanner } from "@/components/dashboard/guest-banner";
import { GuestLimitModal } from "@/components/dashboard/guest-limit-modal";
import { AiDashboardSummary } from "@/components/dashboard/ai-summary";

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { liveChecks } = useSocket();

  const {
    data: monitors = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useMonitors();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGuestLimitModalOpen, setIsGuestLimitModalOpen] = useState(false);

  const handleOpenCreateModal = () => {
    if (user?.isGuest && monitors.length >= 1) {
      setIsGuestLimitModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

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
          : null,
      avgLatencyMs:
        latencyValues.length > 0
          ? latencyValues.reduce((sum, value) => sum + value, 0) /
            latencyValues.length
          : null,
      activeIncidentsCount: monitors.filter(
        (monitor) => monitor.hasActiveIncident
      ).length,
    };
  }, [monitors]);

  // Build a lookup map of active monitors and filter out checks of deleted monitors
  const activeMonitorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const monitor of monitors) {
      map.set(monitor.id, monitor.url);
    }
    return map;
  }, [monitors]);

  const activeLiveChecks = useMemo(() => {
    return liveChecks.filter((check) => activeMonitorMap.has(check.monitorId));
  }, [liveChecks, activeMonitorMap]);

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

    // Refresh AI summary when a new monitor is added
    queryClient.invalidateQueries({ queryKey: ["ai-dashboard-summary"] });

    setIsCreateModalOpen(false);
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar onOpenCreateModal={handleOpenCreateModal} />
        <DashboardPageSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar onOpenCreateModal={handleOpenCreateModal} />

      <main className="mx-auto max-w-7xl space-y-6 sm:space-y-8 px-4 py-6 sm:py-8 sm:px-6 lg:px-8 animate-in fade-in duration-200">
        {/* Guest Banner (Rendered when guest session is active) */}
        <GuestBanner monitorCount={monitors.length} />

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
              <Radio className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
              <span>Monitoring Overview</span>
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Live uptime, latency, and incident metrics across your web infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                void refetch();
                queryClient.invalidateQueries({ queryKey: ["ai-dashboard-summary"] });
              }}
              disabled={isFetching}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent disabled:opacity-50 active:scale-95"
              title="Refresh all metrics and AI summary"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-muted-foreground ${
                  isFetching ? "animate-spin" : ""
                }`}
              />
              <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 dark:bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-white dark:text-neutral-950 transition hover:bg-emerald-500 dark:hover:bg-emerald-400 shadow-sm active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>New Monitor</span>
            </button>
          </div>
        </div>

        {/* AI-Powered Telemetry Intelligence Summary */}
        <AiDashboardSummary />

        {/* Overview Stats */}
        <OverviewStats
          totalMonitors={aggregatedStats.total}
          avgUptime={aggregatedStats.avgUptime}
          activeIncidentsCount={aggregatedStats.activeIncidentsCount}
          avgLatencyMs={aggregatedStats.avgLatencyMs}
        />

        {/* Real-time Live Activity Stream (filtered for active monitors only) */}
        <LiveActivity
          checks={activeLiveChecks}
          getMonitorUrl={(id) => activeMonitorMap.get(id) || ""}
        />

        {/* Monitored Endpoints Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              Monitored Endpoints
            </h2>
            <span className="text-xs text-muted-foreground">
              {monitors.length} total
            </span>
          </div>

          <MonitorList
            monitors={monitors}
            isPending={isPending}
            error={error}
            onRetry={() => void refetch()}
            onCreateMonitor={handleOpenCreateModal}
            columns="dashboard"
          />
        </section>
      </main>

      <CreateMonitorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMonitorCreated={handleMonitorCreated}
        onGuestLimitReached={() => setIsGuestLimitModalOpen(true)}
      />

      <GuestLimitModal
        isOpen={isGuestLimitModalOpen}
        onClose={() => setIsGuestLimitModalOpen(false)}
      />
    </div>
  );
}
