"use client";

import React, { useState } from "react";
import { X, Globe, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { CreateMonitor } from "../../lib/types";
import { createMonitorApi } from "@/lib/api/monitor";
import { getApiErrorMessage } from "@/lib/api/client";

interface CreateMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMonitorCreated?: (newMonitor: CreateMonitor) => void;
}

export function CreateMonitorModal({
  isOpen,
  onClose,
  onMonitorCreated,
}: CreateMonitorModalProps) {
  const [url, setUrl] = useState<string>("");
  const [interval, setInterval] = useState<number>(60);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);
    try {
      const { data: monitor } = await createMonitorApi({
        interval,
        url: trimmedUrl,
      });
      if (onMonitorCreated && monitor) {
        onMonitorCreated(monitor);
      }
      toast.success("Monitor created successfully", {
        description: `Tracking ${monitor?.url} every ${monitor?.interval}s`,
      });
      setUrl("");
      setInterval(60);
      onClose();
    } catch (error) {
      const message = getApiErrorMessage(error);
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Create New Monitor
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configure uptime & latency monitoring for your HTTPS endpoint.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition active:scale-95"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-600 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Target URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="url"
                required
                placeholder="https://api.yourdomain.com/health"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground placeholder-muted-foreground focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Check Interval
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <select
                value={interval}
                onChange={(e) => setInterval(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
              >
                <option value={30}>Every 30 seconds</option>
                <option value={60}>Every 1 minute</option>
                <option value={300}>Every 5 minutes</option>
                <option value={600}>Every 10 minutes</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-border px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 dark:bg-emerald-500 px-4 py-2 text-xs font-semibold text-white dark:text-neutral-950 transition hover:bg-emerald-500 dark:hover:bg-emerald-400 disabled:opacity-50 active:scale-95 shadow-sm"
            >
              {isSubmitting ? "Creating..." : "Start Monitoring"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
