"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "../../../../components/layout/navbar";
import { LatencyChart } from "../../../../components/dashboard/latency-chart";
import { GuestBanner } from "@/components/dashboard/guest-banner";
import {
  StatsCardSkeleton,
  ChartSkeleton,
} from "../../../../components/dashboard/dashboard-skeletons";
import { Skeleton } from "@/components/ui/skeleton";
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
  ChevronDown,
  Pause,
  Play,
  Trash2,
  Loader2,
  ShieldCheck,
  Activity,
} from "lucide-react";

import { toast } from "sonner";
import { useMonitorAnalytics } from "@/hooks/useGetMonitorAnalytics";
import { useGetMonitorChartData } from "@/hooks/useMonitorCheckSeries";
import { useMonitorChecks } from "@/hooks/useMonitorChecks";
import { useMonitorDetails } from "@/hooks/useMonitorDetails";
import { useToggleMonitor, useDeleteMonitor } from "@/hooks/useMonitorActions";

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
  const router = useRouter();
  const resolvedParams = use(params);
  const monitorId = resolvedParams.id;

  const [page, setPage] = useState(1);
  const [range, setRange] = useState<Duration>("24h");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Monitor base info (isActive, url, interval)
  const {
    data: monitorDetails,
    refetch: refetchDetails,
  } = useMonitorDetails(monitorId);

  // Monitor analytics summary
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

  // Actions
  const toggleMutation = useToggleMonitor();
  const deleteMutation = useDeleteMonitor();

  const isPaused = monitorDetails ? monitorDetails.isActive === false : false;

  const refreshAll = async () => {
    try {
      await Promise.all([
        refetchDetails(),
        refetchAnalytics(),
        refetchSeries(),
        refetchChecks(),
      ]);

      toast.success("Monitor data refreshed");
    } catch {
      toast.error("Unable to refresh monitor data");
    }
  };

  const handleToggle = () => {
    toggleMutation.mutate({
      monitorId,
      isActive: isPaused,
    });
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(monitorId);
      router.push("/dashboard/monitors");
    } catch {
      // toast is handled in mutation hook
    }
  };

  if (analyticsPending) {
    return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-4 w-28" />
            <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-60" />
                <Skeleton className="h-4 w-80" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-28 rounded-lg" />
                <Skeleton className="h-9 w-20 rounded-lg" />
                <Skeleton className="h-9 w-28 rounded-lg" />
              </div>
            </div>
          </div>
          <StatsCardSkeleton />
          <ChartSkeleton />
        </main>
      </div>
    );
  }

  if (analyticsError || !analytics) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
          <p className="text-sm font-medium text-destructive">
            Unable to load monitor analytics.
          </p>

          <button
            onClick={() => void refetchAnalytics()}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-emerald-400 transition"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Transform backend chart response into LatencyChart's expected format.
  const chartData =
    series?.points.map((point) => {
      const date = new Date(point.checkedAt);
      const isMultiDay = range === "24h" || range === "3d";
      return {
        checkedAt: isMultiDay
          ? date.toLocaleDateString([], { month: "short", day: "numeric" }) +
            " " +
            date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        rawTime: date.toLocaleString(),
        latencyMs: point.latencyMs,
        success: point.success,
      };
    }) ?? [];

  const checks = checksData?.checks ?? [];
  const pagination = checksData?.pagination;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
        <GuestBanner monitorCount={1} />
        {/* Back button */}
        <div>
          <Link
            href="/dashboard/monitors"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Monitors
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">
                {getDomainFromUrl(analytics.url)}
              </h1>

              <a
                href={analytics.url}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-foreground transition"
                title="Open target URL in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>

              {/* Status Badge */}
              <div
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  isPaused
                    ? "border-muted-foreground/30 bg-muted text-muted-foreground"
                    : Number(analytics.failedChecks) > 0 &&
                      Number(analytics.successfulChecks) === 0
                    ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isPaused
                      ? "bg-muted-foreground"
                      : Number(analytics.failedChecks) > 0 &&
                        Number(analytics.successfulChecks) === 0
                      ? "bg-red-500 animate-ping"
                      : "bg-emerald-500 animate-pulse"
                  }`}
                />
                <span>
                  {isPaused
                    ? "Paused"
                    : Number(analytics.failedChecks) > 0 &&
                      Number(analytics.successfulChecks) === 0
                    ? "Failing"
                    : "Operational"}
                </span>
              </div>
            </div>

            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {analytics.url}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {/* Pause / Resume Button */}
            <button
              onClick={handleToggle}
              disabled={toggleMutation.isPending}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-medium transition disabled:opacity-50 shadow-xs active:scale-95 ${
                isPaused
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                  : "border-border bg-card text-foreground hover:bg-accent"
              }`}
            >
              {toggleMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isPaused ? (
                <Play className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Pause className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <span>{isPaused ? "Resume Monitoring" : "Pause Monitoring"}</span>
            </button>

            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/20 transition shadow-xs active:scale-95"
              title="Delete monitor"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => void refreshAll()}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs font-medium text-foreground hover:bg-accent transition shadow-xs active:scale-95"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-foreground">
                Delete Monitor?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to delete this monitor for{" "}
                <span className="font-semibold text-foreground">{analytics.url}</span>?
                All check history and related incident logs will be permanently removed.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={() => setShowDeleteModal(false)}
                  className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-accent transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleteMutation.isPending}
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 transition disabled:opacity-50 shadow-sm"
                >
                  {deleteMutation.isPending && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  <span>Delete Monitor</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Animated Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard
            label="24h Uptime"
            value={analytics.uptime}
            unit="%"
            decimals={1}
            footer="Target: 99.9% uptime SLA"
            icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
            className="animate-fade-in-up delay-75"
            progressBar={{
              value: analytics.uptime != null ? Number(analytics.uptime) : 100,
              colorClass:
                (analytics.uptime != null ? Number(analytics.uptime) : 100) >= 99
                  ? "bg-emerald-500"
                  : (analytics.uptime != null ? Number(analytics.uptime) : 100) >= 95
                  ? "bg-amber-500"
                  : "bg-red-500",
            }}
          />

          <MetricCard
            label="Average Latency"
            value={analytics.avgLatency}
            unit=" ms"
            decimals={0}
            footer={`Min: ${formatLatency(analytics.minLatency)} / Max: ${formatLatency(analytics.maxLatency)}`}
            icon={<Activity className="h-4 w-4 text-blue-500" />}
            className="animate-fade-in-up delay-150"
          />

          <MetricCard
            label="Total Checks"
            value={analytics.totalChecks}
            footer={`Passed: ${analytics.successfulChecks} · Failed: ${analytics.failedChecks}`}
            icon={<CheckCircle2 className="h-4 w-4 text-purple-500" />}
            className="animate-fade-in-up delay-200"
          />

          <MetricCard
            label="Check Interval"
            value={`${analytics.interval}s`}
            animate={false}
            footer={`Last check: ${analytics.lastCheckedAt ? formatTimeAgo(analytics.lastCheckedAt) : "Never"}`}
            icon={<Clock className="h-4 w-4 text-amber-500" />}
            className="animate-fade-in-up delay-300"
          />
        </div>

        {/* Latency chart */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Response Time History
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Individual health-check latency over time
              </p>
            </div>

            <div className="relative inline-flex items-center">
              <select
                value={range}
                onChange={(e) => setRange(e.target.value as Duration)}
                className="appearance-none rounded-lg border border-border bg-card pl-3 pr-8 py-1.5 text-xs font-medium text-foreground outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-xs cursor-pointer transition"
              >
                {ranges.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>

          {seriesPending ? (
            <LoadingPanel message="Loading latency history..." />
          ) : seriesError ? (
            <ErrorPanel message="Unable to load latency history." />
          ) : chartData.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-border bg-card/60 p-6 text-center">
              <Clock className="mb-3 h-7 w-7 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                No checks recorded
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
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
        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-500" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Recent Check Log
                </h3>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Individual health-check executions updated in real time
                </p>
              </div>
            </div>

            <span className="text-[11px] text-muted-foreground">
              {pagination?.total ?? 0} total records
            </span>
          </div>

          {checksPending ? (
            <LoadingPanel message="Loading check history..." />
          ) : checksError ? (
            <ErrorPanel message="Unable to load check history." />
          ) : checks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="mb-3 h-7 w-7 text-muted-foreground/60" />
              <p className="text-sm text-foreground">
                No check history available
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Check records will appear here after your monitor runs.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">HTTP Code</th>
                      <th className="px-5 py-3 font-semibold">Latency</th>
                      <th className="px-5 py-3 font-semibold">Time</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-border">
                    {checks.map((check) => (
                      <tr
                        key={check.id}
                        className="transition hover:bg-muted/40"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {check.success ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}

                            <span
                              className={
                                check.success
                                  ? "font-semibold text-emerald-600 dark:text-emerald-400"
                                  : "font-semibold text-red-600 dark:text-red-400"
                              }
                            >
                              {check.success ? "Success" : "Failed"}
                            </span>
                          </div>

                          {check.errorMessage && (
                            <p
                              className="mt-1 max-w-[220px] truncate text-[10px] text-red-500"
                              title={check.errorMessage}
                            >
                              {check.errorMessage}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-foreground/80">
                          {check.statusCode ?? "N/A"}
                        </td>

                        <td className="px-5 py-3.5 font-mono text-foreground font-semibold">
                          {formatLatency(check.latencyMs)}
                        </td>

                        <td className="px-5 py-3.5 text-muted-foreground">
                          <div>
                            {new Date(check.checkedAt).toLocaleString()}
                          </div>
                          <span className="text-[10px] text-muted-foreground/70">
                            {formatTimeAgo(check.checkedAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  {(page - 1) * PAGE_SIZE + 1}
                  {" - "}
                  {Math.min(page * PAGE_SIZE, pagination?.total ?? 0)}
                  {" of "}
                  {pagination?.total ?? 0} checks
                </p>

                <div className="flex items-center gap-3">
                  <button
                    disabled={page <= 1 || isPlaceholderData}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </button>

                  <span className="text-xs text-muted-foreground">
                    {page} / {pagination?.totalPages ?? 1}
                  </span>

                  <button
                    disabled={
                      !pagination ||
                      page >= pagination.totalPages ||
                      isPlaceholderData
                    }
                    onClick={() => setPage((prev) => prev + 1)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
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

// Smooth count-up interpolation hook for telemetry figures
function useAnimatedCounter(
  target: number | string | null | undefined,
  durationMs: number = 800,
  decimals: number = 0
): string {
  const numericTarget = target != null ? Number(target) : null;
  const [current, setCurrent] = useState(0);

  React.useEffect(() => {
    if (numericTarget == null || !Number.isFinite(numericTarget)) return;
    let startTime: number | null = null;
    let frameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      // Ease out cubic: fast rise, smooth settle
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * numericTarget);

      if (progress < 1) {
        frameId = requestAnimationFrame(step);
      } else {
        setCurrent(numericTarget);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [numericTarget, durationMs]);

  if (numericTarget == null || !Number.isFinite(numericTarget)) return "0";
  return current.toFixed(decimals);
}

// Reusable animated metric card with visual progress indicators
function MetricCard({
  label,
  value,
  unit = "",
  decimals = 0,
  animate = true,
  footer,
  icon,
  className = "",
  progressBar,
}: {
  label: string;
  value: number | string | null | undefined;
  unit?: string;
  decimals?: number;
  animate?: boolean;
  footer: string;
  icon?: React.ReactNode;
  className?: string;
  progressBar?: { value: number; colorClass: string };
}) {
  const isNumeric =
    value != null && value !== "" && Number.isFinite(Number(value));
  const numericValue = isNumeric ? Number(value) : null;
  const animatedNumber = useAnimatedCounter(
    animate && isNumeric ? numericValue : null,
    800,
    decimals
  );

  let displayValue: string;
  if (!isNumeric) {
    displayValue = value != null ? String(value) : "N/A";
  } else if (animate) {
    displayValue = `${animatedNumber}${unit ? `${unit}` : ""}`;
  } else {
    displayValue = `${numericValue!.toFixed(decimals)}${unit ? `${unit}` : ""}`;
  }

  return (
    <div
      className={`group rounded-xl border border-border bg-card p-4 shadow-xs hover:shadow-md hover:border-border/80 hover:-translate-y-0.5 transition-all duration-200 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        {icon && (
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/70 transition-transform group-hover:scale-110">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-1 text-2xl font-extrabold tracking-tight text-foreground font-mono">
        {displayValue}
      </div>

      {progressBar && (
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${progressBar.colorClass}`}
            style={{ width: `${Math.min(Math.max(progressBar.value, 0), 100)}%` }}
          />
        </div>
      )}

      <span className="mt-2 block text-[11px] text-muted-foreground truncate">
        {footer}
      </span>
    </div>
  );
}

function LoadingPanel({ message }: { message: string }) {
  return (
    <div className="flex h-48 flex-col items-center justify-center gap-3">
      <RefreshCw className="h-6 w-6 animate-spin text-emerald-500" />
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div className="flex h-48 items-center justify-center text-xs text-destructive">
      {message}
    </div>
  );
}
