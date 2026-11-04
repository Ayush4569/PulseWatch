"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "../../../components/layout/navbar";
import { formatTimeAgo } from "../../../lib/formatters";
import { useIncidents } from "@/hooks/useIncidents";
import { getApiErrorMessage } from "@/lib/api/client";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const PAGE_SIZE = 10;

export default function IncidentsPage() {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "RESOLVED">("ACTIVE");
  const [activePage, setActivePage] = useState(1);
  const [resolvedPage, setResolvedPage] = useState(1);

  const {
    data: activeData,
    isPending: activePending,
    isFetching: activeFetching,
    error: activeError,
    refetch: refetchActive,
  } = useIncidents({ status: "OPEN", page: activePage, limit: PAGE_SIZE });

  const {
    data: resolvedData,
    isPending: resolvedPending,
    isFetching: resolvedFetching,
    error: resolvedError,
    refetch: refetchResolved,
  } = useIncidents({ status: "RESOLVED", page: resolvedPage, limit: PAGE_SIZE });

  const isCurrentActive = activeTab === "ACTIVE";
  const currentData = isCurrentActive ? activeData : resolvedData;
  const isPending = isCurrentActive ? activePending : resolvedPending;
  const isFetching = isCurrentActive ? activeFetching : resolvedFetching;
  const error = isCurrentActive ? activeError : resolvedError;
  const currentPage = isCurrentActive ? activePage : resolvedPage;
  const setCurrentPage = isCurrentActive ? setActivePage : setResolvedPage;

  const displayedIncidents = currentData?.incidents ?? [];
  const pagination = currentData?.pagination;

  const activeCount = activeData?.pagination.total ?? 0;
  const resolvedCount = resolvedData?.pagination.total ?? 0;

  const handleRefresh = async () => {
    await Promise.all([refetchActive(), refetchResolved()]);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-800/80 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <ShieldAlert className="h-6 w-6 text-red-400" />
              <span>Incidents Log</span>
            </h1>
            <p className="mt-1 text-xs text-neutral-400">
              Real-time incident detection and resolution tracking powered by health checks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Refresh Button */}
            <button
              onClick={() => void handleRefresh()}
              disabled={isFetching}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-50"
              title="Refresh incidents"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-neutral-400 ${
                  isFetching ? "animate-spin" : ""
                }`}
              />
              <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
            </button>

            {/* Tab Switcher */}
            <div className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 p-1">
              <button
                onClick={() => {
                  setActiveTab("ACTIVE");
                }}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "ACTIVE"
                    ? "bg-red-500/10 text-red-400 border border-red-500/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Active ({activeCount})</span>
              </button>
              <button
                onClick={() => {
                  setActiveTab("RESOLVED");
                }}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === "RESOLVED"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Resolved ({resolvedCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {isPending ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3">
            <RefreshCw className="h-7 w-7 animate-spin text-emerald-400" />
            <p className="text-sm text-neutral-400">Loading incidents...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-900 bg-red-950/30 p-6 text-center space-y-3">
            <p className="text-sm text-red-300">
              {getApiErrorMessage(error) || "Unable to load incidents."}
            </p>
            <button
              onClick={() => void handleRefresh()}
              className="inline-flex items-center gap-2 rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/30 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        ) : displayedIncidents.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-12 text-center space-y-3">
            {isCurrentActive ? (
              <>
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
                <h3 className="text-base font-semibold text-white">
                  No Active Incidents
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  All endpoints are operating normally. When a monitor experiences 3 consecutive failures, an active incident will trigger here.
                </p>
              </>
            ) : (
              <>
                <Clock className="mx-auto h-10 w-10 text-neutral-500" />
                <h3 className="text-base font-semibold text-white">
                  No Resolved Incidents
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                  Past incident recoveries will be archived and viewable here.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedIncidents.map((incident) => {
              const isOpen = incident.status === "OPEN";
              return (
                <div
                  key={incident.id}
                  className={`rounded-xl border p-5 shadow-lg transition-all ${
                    isOpen
                      ? "border-red-800/80 bg-red-950/20"
                      : "border-neutral-800 bg-neutral-900/60"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            isOpen
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              isOpen
                                ? "bg-red-500 animate-ping"
                                : "bg-emerald-400"
                            }`}
                          />
                          {isOpen ? "ACTIVE INCIDENT" : "RESOLVED"}
                        </span>

                        {incident.monitorUrl && (
                          <span className="font-mono text-xs text-neutral-300 font-medium">
                            {incident.monitorUrl}
                          </span>
                        )}

                        <span className="text-[11px] text-neutral-500">
                          (ID: <code className="text-neutral-400 font-mono">{incident.monitorId.slice(0, 8)}</code>)
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white mt-2">
                        {incident.failureReason}
                      </h3>

                      <p className="text-xs text-neutral-400">
                        Started {formatTimeAgo(incident.startedAt)}
                        {incident.resolvedAt &&
                          ` · Resolved ${formatTimeAgo(incident.resolvedAt)}`}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/monitors/${incident.monitorId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition shrink-0"
                    >
                      <span>View Monitor</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-col gap-3 border-t border-neutral-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-neutral-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} -{" "}
                  {Math.min(currentPage * PAGE_SIZE, pagination.total)} of{" "}
                  {pagination.total} incidents
                </p>

                <div className="flex items-center gap-3">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Previous
                  </button>

                  <span className="text-xs text-neutral-400">
                    {currentPage} / {pagination.totalPages}
                  </span>

                  <button
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() =>
                      setCurrentPage((p) =>
                        Math.min(p + 1, pagination.totalPages)
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
