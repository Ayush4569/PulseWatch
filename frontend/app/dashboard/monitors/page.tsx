"use client";

import React, { useState, useMemo } from "react";
import { Navbar } from "../../../components/layout/navbar";
import { MonitorCard } from "../../../components/dashboard/monitor-card";
import { CreateMonitorModal } from "../../../components/dashboard/create-monitor-modal";
import { MOCK_MONITORS, MOCK_ANALYTICS } from "../../../lib/mock-data";
import { Monitor } from "../../../lib/types";
import { Plus, Radio, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<Monitor[]>(MOCK_MONITORS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredMonitors = useMemo(() => {
    if (!searchQuery.trim()) return monitors;
    const q = searchQuery.toLowerCase();
    return monitors.filter((m) => m.url.toLowerCase().includes(q));
  }, [monitors, searchQuery]);

  const handleMonitorCreated = (newMonitor: Monitor) => {
    setMonitors((prev) => [newMonitor, ...prev]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500 selection:text-black">
      <Navbar onOpenCreateModal={() => setIsCreateModalOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800/80 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <Radio className="h-6 w-6 text-emerald-400" />
              <span>All Monitors</span>
            </h1>
            <p className="mt-1 text-xs text-neutral-400">Manage and view real-time status of all configured endpoints.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.info("Refreshed static preview data")}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition"
            >
              <RefreshCw className="h-3.5 w-3.5 text-neutral-400" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 transition"
            >
              <Plus className="h-4 w-4" />
              <span>New Monitor</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by URL or hostname..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900 py-2 pl-9 pr-3 text-xs text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Monitors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMonitors.map((m) => {
            const a = MOCK_ANALYTICS[m.id];
            const enriched: Monitor = {
              ...m,
              uptime: a?.uptime !== null && a?.uptime !== undefined ? Number(a.uptime) : m.uptime,
              lastLatencyMs: m.lastLatencyMs ?? (a?.avgLatency ? Number(a.avgLatency) : null),
            };
            return <MonitorCard key={m.id} monitor={enriched} />;
          })}
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
