"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { CreateMonitorModal } from "@/components/dashboard/create-monitor-modal";
import { MonitorList } from "@/components/dashboard/monitor-list";
import { Plus, Radio, RefreshCw } from "lucide-react";
import { useMonitors } from "@/hooks/useListMonitors";
import { queryClient } from "@/lib/query-client";
import { CreateMonitor, Monitor } from "@/lib/types";
import { useAuthContext } from "@/context/auth-context";
import { GuestBanner } from "@/components/dashboard/guest-banner";
import { GuestLimitModal } from "@/components/dashboard/guest-limit-modal";

export default function MonitorsPage() {
  const { user } = useAuthContext();
  const {
    data: monitors = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useMonitors();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isGuestLimitModalOpen, setIsGuestLimitModalOpen] = useState<boolean>(false);

  const handleOpenCreateModal = () => {
    if (user?.isGuest && monitors.length >= 1) {
      setIsGuestLimitModalOpen(true);
    } else {
      setIsCreateModalOpen(true);
    }
  };

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

    queryClient.invalidateQueries({ queryKey: ["ai-dashboard-summary"] });
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar onOpenCreateModal={handleOpenCreateModal} />

      <main className="mx-auto max-w-7xl space-y-6 sm:space-y-8 px-4 py-6 sm:py-8 sm:px-6 lg:px-8 animate-in fade-in duration-200">
        <GuestBanner monitorCount={monitors.length} />

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-foreground">
              <Radio className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />
              <span>All Monitors</span>
            </h1>

            <p className="mt-1 text-xs text-muted-foreground">
              Manage and view real-time status of all configured endpoints.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent disabled:opacity-50 active:scale-95"
              title="Refresh monitors"
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

        {/* Shared monitor list */}
        <MonitorList
          monitors={monitors}
          isPending={isPending}
          error={error}
          onRetry={() => void refetch()}
          onCreateMonitor={handleOpenCreateModal}
          columns="page"
        />
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
