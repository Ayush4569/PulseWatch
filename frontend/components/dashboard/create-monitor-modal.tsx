"use client";

import React, { useState } from "react";
import { X, Globe, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Monitor } from "../../lib/types";

interface CreateMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMonitorCreated?: (newMonitor: Monitor) => void;
}

export function CreateMonitorModal({ isOpen, onClose, onMonitorCreated }: CreateMonitorModalProps) {
  const [url, setUrl] = useState<string>("");
  const [interval, setInterval] = useState<number>(60);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError("URL is required.");
      return;
    }

    if (!trimmedUrl.startsWith("https://")) {
      setError("URL must start with https:// (e.g. https://api.example.com)");
      return;
    }

    const newMonitor: Monitor = {
      id: `mon-${Date.now()}`,
      url: trimmedUrl,
      interval: Number(interval),
      isActive: true,
      createdAt: new Date().toISOString(),
      lastStatus: "UP",
      lastLatencyMs: 95,
      lastCheckedAt: new Date().toISOString(),
      uptime: 100,
    };

    toast.success("Monitor created (UI Static)", {
      description: `Configured ${newMonitor.url} every ${newMonitor.interval}s`,
    });

    if (onMonitorCreated) {
      onMonitorCreated(newMonitor);
    }

    setUrl("");
    setInterval(60);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Create New Monitor</h2>
            <p className="text-xs text-neutral-400">Configure uptime & latency monitoring for your HTTPS endpoint.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-950/50 border border-red-800/50 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Target URL <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="url"
                required
                placeholder="https://api.yourdomain.com/health"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-sm text-white placeholder-neutral-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <p className="mt-1 text-[11px] text-neutral-500">Requires secure <code className="text-neutral-400">https://</code> URLs.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              Check Interval <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              <select
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 py-2 pl-9 pr-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value={30}>Every 30 seconds</option>
                <option value={60}>Every 1 minute (60s)</option>
                <option value={300}>Every 5 minutes (300s)</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-neutral-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-neutral-800 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-neutral-950 hover:bg-emerald-400 transition"
            >
              <span>Start Monitoring</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
