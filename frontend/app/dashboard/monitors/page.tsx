"use client";

import { useState } from "react";
import { Navbar } from "../../../components/layout/navbar";
import { CreateMonitorModal } from "../../../components/dashboard/create-monitor-modal";
import { MonitorList } from "../../../components/dashboard/monitor-list";
import { Plus, Radio, RefreshCw } from "lucide-react";
import { useMonitors } from "@/hooks/useListMonitors";
import { queryClient } from "@/lib/query-client";
import { CreateMonitor, Monitor } from "@/lib/types";

export default function MonitorsPage() {
  const {
    data: monitors = [],
    isPending,
    isFetching,
    error,
    refetch,
  } = useMonitors();

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState<boolean>(false);
   
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
              <Radio className="h-6 w-6 text-emerald-400" />
              <span>All Monitors</span>
            </h1>

            <p className="mt-1 text-xs text-neutral-400">
              Manage and view real-time status of all configured endpoints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              title="Refresh monitors"
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
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-neutral-950 transition hover:bg-emerald-400"
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
          onCreateMonitor={() => setIsCreateModalOpen(true)}
          columns="page"
          showSearch
        />
      </main>

      <CreateMonitorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMonitorCreated={handleMonitorCreated}
      />
    </div>
  );
}