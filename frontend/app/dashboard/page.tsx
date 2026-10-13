"use client";

import React, { useState, useMemo } from "react";
import { Navbar } from "../../components/layout/navbar";
import { OverviewStats } from "../../components/dashboard/overview-stats";
import { MonitorCard } from "../../components/dashboard/monitor-card";
import { CreateMonitorModal } from "../../components/dashboard/create-monitor-modal";
import { LiveActivity } from "../../components/dashboard/live-activity";
import { MOCK_MONITORS, MOCK_ANALYTICS, MOCK_RECENT_CHECKS, MOCK_INCIDENTS } from "../../lib/mock-data";
import { Monitor } from "../../lib/types";
import { Plus, Radio, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  const [monitors, setMonitors] = useState<Monitor[]>(MOCK_MONITORS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const aggregatedStats = useMemo(() => {
    const total = monitors.length;
    const activeIncidentsCount = MOCK_INCIDENTS.filter((i) => i.status === "OPEN").length;
    return {
      total,
      avgUptime: 98.22,
      activeIncidentsCount,
      avgLatencyMs: 255,
    };
  }, [monitors]);

  const handleMonitorCreated = (newMonitor: Monitor) => {
    setMonitors((prev) => [newMonitor, ...prev]);
  };

  const filteredMonitors = useMemo(() => {
    if (!searchQuery.trim()) return monitors;
    const q = searchQuery.toLowerCase();
    return monitors.filter((m) => m.url.toLowerCase().includes(q));
  }, [monitors, searchQuery]);

  const getMonitorUrlById = (id: string) => {
    const found = monitors.find((m) => m.id === id);
    return found ? found.url : `Monitor ${id}`;
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500 selection:text-black">
      <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800/80 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Monitoring Overview</span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </h1>
            <p className="mt-1 text-xs text-neutral-400">
              Live uptime, latency, and incident metrics across all your endpoints.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.info("Refreshed static preview data")}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition"
              title="Refresh data"
            >
              <RefreshCw className="h-3.5 w-3.5 text-neutral-400" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 transition shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>New Monitor</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <OverviewStats
          totalMonitors={aggregatedStats.total}
          avgUptime={aggregatedStats.avgUptime}
          activeIncidentsCount={aggregatedStats.activeIncidentsCount}
          avgLatencyMs={aggregatedStats.avgLatencyMs}
        />

        {/* Main Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Monitors List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Radio className="h-4 w-4 text-emerald-400" />
                <span>Active Endpoints ({filteredMonitors.length})</span>
              </h2>

              {/* Search Bar */}
              <div className="relative w-48 sm:w-64">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Filter endpoints..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-1.5 pl-8 pr-3 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Monitors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMonitors.map((m) => {
                const analyticsData = MOCK_ANALYTICS[m.id];
                const enrichedMonitor: Monitor = {
                  ...m,
                  uptime: analyticsData?.uptime !== null && analyticsData?.uptime !== undefined ? Number(analyticsData.uptime) : m.uptime,
                  lastLatencyMs: m.lastLatencyMs ?? (analyticsData?.avgLatency ? Number(analyticsData.avgLatency) : null),
                };
                return <MonitorCard key={m.id} monitor={enrichedMonitor} />;
              })}
            </div>
          </div>

          {/* Right Column: Live Stream */}
          <div className="space-y-6">
            <LiveActivity checks={MOCK_RECENT_CHECKS} getMonitorUrl={getMonitorUrlById} />
          </div>
        </div>
      </main>

      {/* Modal */}
      <CreateMonitorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMonitorCreated={handleMonitorCreated}
      />
    </div>
  );
}
