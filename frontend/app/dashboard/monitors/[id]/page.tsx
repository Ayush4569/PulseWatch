
"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { Navbar } from "../../../../components/layout/navbar";
import { LatencyChart } from "../../../../components/dashboard/latency-chart";
import {
  formatLatency,
  formatUptime,
  formatTimeAgo,
  getDomainFromUrl,
} from "../../../../lib/formatters";

import {
  ArrowLeft,
  ExternalLink,
  Clock,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { toast } from "sonner";
import { useMonitorAnalytics } from "@/hooks/useGetMonitorAnalytics";
import { useGetMonitorChartData } from "@/hooks/useMonitorCheckSeries";
import { useMonitorChecks } from "@/hooks/useMonitorChecks";


import type { Duration } from "@/lib/types";

interface MonitorDetailPageProps {
  params: Promise<{ id: string }>;
}

const PAGE_SIZE = 10;

const ranges: { label: string; value: Duration }[] = [
  { label: "1 Hour", value: "1h" },
  { label: "6 Hours", value: "6h" },
  { label: "24 Hours", value: "24h" },
  { label: "3 Days", value: "3d" },
];

export default function MonitorDetailPage({
  params,
}: MonitorDetailPageProps) {
  const resolvedParams = use(params);
  const monitorId = resolvedParams.id;

  const [page, setPage] = useState(1);
  const [range, setRange] = useState<Duration>("24h");

  
  const {
    isPending: analyticsPending,
    error: analyticsError,
    data: analytics,
    refetch: refetchAnalytics,
  } = useMonitorAnalytics(monitorId);

  // Latency chart
  const {
    isPending: seriesPending,
    error: seriesError,
    data: series,
    refetch: refetchSeries,
  } = useGetMonitorChartData(monitorId, range);

  // Paginated check history
  const {
    isPending: checksPending,
    isPlaceholderData,
    error: checksError,
    data: checksData,
    refetch: refetchChecks,
  } = useMonitorChecks(monitorId, page, PAGE_SIZE);

  const refreshAll = async () => {
    try {
      await Promise.all([
        refetchAnalytics(),
        refetchSeries(),
        refetchChecks(),
      ]);

      toast.success("Monitor data refreshed");
    } catch {
      toast.error("Unable to refresh monitor data");
    }
  };

  if (analyticsPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-7 w-7 animate-spin text-emerald-400" />
          <p className="text-sm text-neutral-400">
            Loading monitor analytics...
          </p>
        </div>
      </div>
    );
  }

  if (analyticsError || !analytics) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-neutral-950">
        <p className="text-sm text-neutral-300">
          Unable to load monitor analytics.
        </p>

        <button
          onClick={() => void refetchAnalytics()}
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400"
        >
          Try again
        </button>
      </div>
    );
  }

  // Transform backend chart response into LatencyChart's expected format.
  const chartData =
    series?.points.map((point) => ({
      checkedAt: new Date(point.checkedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      latencyMs: point.latencyMs,
      success: point.success,
    })) ?? [];

  const checks = checksData?.checks ?? [];
  const pagination = checksData?.pagination;


  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* Back button */}
        <div>
          <Link
            href="/dashboard/monitors"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Monitors
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-neutral-800/80 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white">
                {getDomainFromUrl(analytics.url)}
              </h1>

              <a
                href={analytics.url}
                target="_blank"
                rel="noreferrer"
                className="text-neutral-400 hover:text-white transition"
              >
                <ExternalLink className="h-4 w-4" />
              </a>

           
            </div>

            <p className="mt-1 font-mono text-xs text-neutral-400">
              {analytics.url}
            </p>
          </div>

          <button
            onClick={() => void refreshAll()}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh Metrics
          </button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard
            label="24h Uptime"
            value={formatUptime(analytics.uptime)}
            footer="Target: 99.9%"
          />

          <MetricCard
            label="Average Latency"
            value={formatLatency(analytics.avgLatency)}
            footer={`Min: ${formatLatency(analytics.minLatency)} / Max: ${formatLatency(analytics.maxLatency)}`}
          />

          <MetricCard
            label="Total Checks"
            value={analytics.totalChecks.toString()}
            footer={`Pass: ${analytics.successfulChecks} / Fail: ${analytics.failedChecks}`}
          />

          <MetricCard
            label="Check Interval"
            value={`${analytics.interval}s`}
            footer={`Last check: ${analytics.lastCheckedAt ? formatTimeAgo(analytics.lastCheckedAt) : "Never"}`}
            icon={<Clock className="h-5 w-5 text-emerald-400" />}
          />
        </div>

        {/* Latency chart */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-white">
                Response Time History
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Individual health-check latency over time
              </p>
            </div>

            <select
              value={range}
              onChange={(e) => setRange(e.target.value as Duration)}
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-300 outline-none focus:border-emerald-500"
            >
              {ranges.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {seriesPending ? (
            <LoadingPanel message="Loading latency history..." />
          ) : seriesError ? (
            <ErrorPanel message="Unable to load latency history." />
          ) : chartData.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 text-center">
              <Clock className="mb-3 h-7 w-7 text-neutral-500" />
              <p className="text-sm font-medium text-neutral-300">
                No checks recorded
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                No health checks were recorded during this time range.
              </p>
            </div>
          ) : (
            <LatencyChart
              data={chartData}
              title={`Response Time — ${getDomainFromUrl(analytics.url)}`}
            />
          )}
        </section>

        {/* Recent check log */}
        <section className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60">
          <div className="flex flex-col gap-3 border-b border-neutral-800 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Recent Check Log
                </h3>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Individual health-check executions
                </p>
              </div>
            </div>

            <span className="text-[11px] text-neutral-500">
              {pagination?.total ?? 0} total records
            </span>
          </div>

          {checksPending ? (
            <LoadingPanel message="Loading check history..." />
          ) : checksError ? (
            <ErrorPanel message="Unable to load check history." />
          ) : checks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="mb-3 h-7 w-7 text-neutral-600" />
              <p className="text-sm text-neutral-300">
                No check history available
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Check records will appear here after your monitor runs.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-neutral-800 bg-neutral-950/40 text-neutral-400">
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">HTTP Code</th>
                      <th className="px-5 py-3 font-semibold">Latency</th>
                      <th className="px-5 py-3 font-semibold">Time</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-neutral-800/60">
                    {checks.map((check) => (
                      <tr
                        key={check.id}
                        className="transition hover:bg-neutral-800/40"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {check.success ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-400" />
                            )}

                            <span
                              className={
                                check.success
                                  ? "font-semibold text-emerald-400"
                                  : "font-semibold text-red-400"
                              }
                            >
                              {check.success ? "Success" : "Failed"}
                            </span>
                          </div>

                          {check.errorMessage && (
                            <p
                              className="mt-1 max-w-[220px] truncate text-[10px] text-red-400"
                              title={check.errorMessage}
                            >
                              {check.errorMessage}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-neutral-300">
                          {check.statusCode ?? "N/A"}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-white">
                          {formatLatency(check.latencyMs)}
                        </td>

                        <td className="px-5 py-3.5 text-neutral-400">
                          <div>
                            {new Date(check.checkedAt).toLocaleString()}
                          </div>
                          <span className="text-[10px] text-neutral-600">
                            {formatTimeAgo(check.checkedAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-neutral-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-neutral-500">
                  Showing{" "}
                  {((page - 1) * PAGE_SIZE) + 1}
                  {" - "}
                  {Math.min(page * PAGE_SIZE, pagination?.total ?? 0)}
                  {" of "}
                  {pagination?.total ?? 0} checks
                </p>

                <div className="flex items-center gap-3">
                  <button
                    disabled={page <= 1 || isPlaceholderData}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </button>

                  <span className="text-xs text-neutral-400">
                    {page} / {pagination?.totalPages ?? 1}
                  </span>

                  <button
                    disabled={
                      !pagination ||
                      page >= pagination.totalPages ||
                      isPlaceholderData
                    }
                    onClick={() => setPage((prev) => prev + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

// Reusable metric card
function MetricCard({
  label,
  value,
  footer,
  icon,
}: {
  label: string;
  value: string;
  footer: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <span className="text-xs font-medium text-neutral-400">
        {label}
      </span>

      <div className="mt-2 flex items-center gap-1.5 text-2xl font-bold text-white">
        {icon}
        {value}
      </div>

      <span className="mt-1 block text-[11px] text-neutral-500">
        {footer}
      </span>
    </div>
  );
}

function LoadingPanel({ message }: { message: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-3">
      <RefreshCw className="h-6 w-6 animate-spin text-emerald-400" />
      <p className="text-xs text-neutral-400">{message}</p>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="flex h-48 items-center justify-center text-xs text-red-400">
      {message}
    </div>
  );
}
