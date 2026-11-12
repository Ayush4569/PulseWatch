"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatLatency } from "../../lib/formatters";
import { LatencyDataPoint } from "@/lib/types";

interface LatencyChartProps {
  data: LatencyDataPoint[];
  title?: string;
}

export function LatencyChart({
  data,
  title = "Latency Performance (ms)",
}: LatencyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-border bg-card/60 p-6 text-center">
        <p className="text-xs text-muted-foreground">
          No time-series check data recorded yet.
        </p>
        <p className="mt-1 text-[11px] text-muted-foreground/80">
          Live checks will populate this chart in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs transition-colors duration-200">
      <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-4">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
          {title}
        </h3>
        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          {data.length} datapoints
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              strokeOpacity={0.8}
              vertical={false}
            />

            <XAxis
              dataKey="checkedAt"
              stroke="var(--muted-foreground)"
              strokeOpacity={0.6}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              minTickGap={35}
            />

            <YAxis
              stroke="var(--muted-foreground)"
              strokeOpacity={0.6}
              tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}ms`}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as LatencyDataPoint;
                  return (
                    <div className="rounded-xl border border-border bg-popover/95 backdrop-blur-md p-3 shadow-xl text-xs text-popover-foreground transition-all">
                      <p className="text-muted-foreground text-[11px]">
                        {item.rawTime || item.checkedAt}
                      </p>
                      <p className="mt-1.5 font-bold text-foreground">
                        Latency:{" "}
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {formatLatency(item.latencyMs)}
                        </span>
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Status:{" "}
                        <span
                          className={`font-semibold ${
                            item.success
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {item.success ? "Success (200)" : "Failed"}
                        </span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="latencyMs"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#latencyGradient)"
              dot={
                data.length === 1
                  ? { r: 4, fill: "#10b981", strokeWidth: 0 }
                  : false
              }
              activeDot={{
                r: 5,
                fill: "#10b981",
                stroke: "var(--card)",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
