"use client";

import React, { use } from "react";
import Link from "next/link";
import { Navbar } from "../../../../components/layout/navbar";
import { LatencyChart } from "../../../../components/dashboard/latency-chart";
import { MOCK_MONITORS, MOCK_ANALYTICS } from "../../../../lib/mock-data";
import { formatLatency, formatUptime, formatTimeAgo, getDomainFromUrl } from "../../../../lib/formatters";
import { ArrowLeft, ExternalLink, Clock, CheckCircle2, RefreshCw, Zap } from "lucide-react";
import { toast } from "sonner";

interface MonitorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function MonitorDetailPage({ params }: MonitorDetailPageProps) {
  const resolvedParams = use(params);
  const monitorId = resolvedParams.id;

  const monitor = MOCK_MONITORS.find((m) => m.id === monitorId) || MOCK_MONITORS[0];
  const analytics = MOCK_ANALYTICS[monitor.id] || MOCK_ANALYTICS["mon-1"];

  const mockTimePoints = [
    { time: "10:00:00", latencyMs: 142, success: true },
    { time: "10:00:30", latencyMs: 155, success: true },
    { time: "10:01:00", latencyMs: 138, success: true },
    { time: "10:01:30", latencyMs: 210, success: true },
    { time: "10:02:00", latencyMs: 145, success: true },
    { time: "10:02:30", latencyMs: 160, success: true },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back Button */}
        <div>
          <Link
            href="/dashboard/monitors"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Monitors</span>
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-neutral-800/80 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{getDomainFromUrl(monitor.url)}</h1>
              <a
                href={monitor.url}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-white transition"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <span className="flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Operational
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-400 font-mono">{monitor.url}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => toast.info("Refreshed metric preview")}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition"
            >
              <RefreshCw className="h-3.5 w-3.5 text-neutral-400" />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <span className="text-xs font-medium text-neutral-400">24h Uptime</span>
            <div className="mt-2 text-2xl font-bold text-white">
              {formatUptime(analytics.uptime)}
            </div>
            <span className="mt-1 block text-[11px] text-neutral-500">Target: 99.9%</span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <span className="text-xs font-medium text-neutral-400">Average Latency</span>
            <div className="mt-2 text-2xl font-bold text-white">
              {formatLatency(analytics.avgLatency)}
            </div>
            <span className="mt-1 block text-[11px] text-neutral-500">
              Min: {formatLatency(analytics.minLatency)} / Max: {formatLatency(analytics.maxLatency)}
            </span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <span className="text-xs font-medium text-neutral-400">Total Checks</span>
            <div className="mt-2 text-2xl font-bold text-white">
              {analytics.totalChecks.toString()}
            </div>
            <span className="mt-1 block text-[11px] text-neutral-500">
              Pass: {analytics.successfulChecks.toString()} / Fail: {analytics.failedChecks.toString()}
            </span>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <span className="text-xs font-medium text-neutral-400">Check Interval</span>
            <div className="mt-2 text-2xl font-bold text-white flex items-center gap-1.5">
              <Clock className="h-5 w-5 text-emerald-400" />
              <span>{monitor.interval}s</span>
            </div>
            <span className="mt-1 block text-[11px] text-neutral-500">
              Last check: {formatTimeAgo(monitor.lastCheckedAt)}
            </span>
          </div>
        </div>

        {/* Time Series Latency Chart */}
        <LatencyChart data={mockTimePoints} title={`Response Time Stream — ${getDomainFromUrl(monitor.url)}`} />

        {/* Live Check Stream table for this monitor */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Check Log</h3>
            </div>
            <span className="text-[11px] text-neutral-500">Static preview</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 font-semibold">
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Latency</th>
                  <th className="py-2.5 px-3">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {mockTimePoints.map((pt, idx) => (
                  <tr key={idx} className="hover:bg-neutral-800/40 transition">
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span className="font-semibold text-emerald-400">Success</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-white">{formatLatency(pt.latencyMs)}</td>
                    <td className="py-2.5 px-3 text-neutral-400">{pt.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
