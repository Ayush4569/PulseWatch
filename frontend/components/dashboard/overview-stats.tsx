"use client";

import { Activity, ShieldAlert, CheckCircle2, Clock } from "lucide-react";
import { formatLatency, formatUptime } from "../../lib/formatters";

interface OverviewStatsProps {
  totalMonitors: number;
  avgUptime: number | null;
  activeIncidentsCount: number;
  avgLatencyMs: number | null;
}

export function OverviewStats({
  totalMonitors,
  avgUptime,
  activeIncidentsCount,
  avgLatencyMs,
}: OverviewStatsProps) {
  const stats = [
    {
      title: "Total Monitors",
      value: totalMonitors.toString(),
      description: "Active endpoints tracked",
      icon: Activity,
      color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Average Uptime",
      value: formatUptime(avgUptime),
      description: "24-hour historical uptime",
      icon: CheckCircle2,
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Active Incidents",
      value: activeIncidentsCount.toString(),
      description: activeIncidentsCount > 0 ? "Requires immediate attention" : "All systems operational",
      icon: ShieldAlert,
      color: activeIncidentsCount > 0 ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Avg Response Time",
      value: formatLatency(avgLatencyMs),
      description: "Mean check latency",
      icon: Clock,
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="relative overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm backdrop-blur-sm transition-all hover:border-neutral-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-400">{stat.title}</span>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${stat.color}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-white">{stat.value}</span>
              <p className="mt-1 text-[11px] text-neutral-500">{stat.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
