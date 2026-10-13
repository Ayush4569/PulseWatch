"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "../../../components/layout/navbar";
import { formatTimeAgo } from "../../../lib/formatters";
import { MOCK_INCIDENTS } from "../../../lib/mock-data";
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

export default function IncidentsPage() {
  const [activeTab, setActiveTab] = useState<"ACTIVE" | "RESOLVED">("ACTIVE");

  const activeIncidents = MOCK_INCIDENTS.filter((i) => i.status === "OPEN");
  const resolvedIncidents = MOCK_INCIDENTS.filter((i) => i.status === "RESOLVED");

  const displayedIncidents = activeTab === "ACTIVE" ? activeIncidents : resolvedIncidents;

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
            <p className="mt-1 text-xs text-neutral-400">Real-time incident detection and resolution tracking.</p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-900 p-1">
            <button
              onClick={() => setActiveTab("ACTIVE")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "ACTIVE"
                  ? "bg-red-500/10 text-red-400 border border-red-500/30"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Active ({activeIncidents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab("RESOLVED")}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                activeTab === "RESOLVED"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Resolved ({resolvedIncidents.length})</span>
            </button>
          </div>
        </div>

        {/* Incidents List */}
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
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          isOpen
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isOpen ? "bg-red-500 animate-ping" : "bg-emerald-400"
                          }`}
                        />
                        {isOpen ? "ACTIVE INCIDENT" : "RESOLVED"}
                      </span>
                      <span className="text-xs font-medium text-neutral-400">
                        Monitor ID: <code className="text-neutral-300 font-mono">{incident.monitorId}</code>
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mt-2">
                      {incident.failureReason}
                    </h3>

                    <p className="text-xs text-neutral-400">
                      Started {formatTimeAgo(incident.startedAt)}
                      {incident.resolvedAt && ` · Resolved ${formatTimeAgo(incident.resolvedAt)}`}
                    </p>
                  </div>

                  <Link
                    href={`/dashboard/monitors/${incident.monitorId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition"
                  >
                    <span>View Monitor</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
