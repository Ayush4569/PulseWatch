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

interface LatencyDataPoint {
  time: string;
  latencyMs: number;
  success: boolean;
}

interface LatencyChartProps {
  data: LatencyDataPoint[];
  title?: string;
}

export function LatencyChart({ data, title = "Latency Performance (ms)" }: LatencyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 text-center">
        <p className="text-xs text-neutral-400">No time-series check data recorded yet.</p>
        <p className="mt-1 text-[11px] text-neutral-500">Live checks will populate this chart in real time.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">{title}</h3>
        <span className="text-[11px] font-medium text-emerald-400">{data.length} datapoints</span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#737373"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#737373"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `${val}ms`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as LatencyDataPoint;
                  return (
                    <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-2.5 shadow-xl text-xs">
                      <p className="text-neutral-400 text-[11px]">{item.time}</p>
                      <p className="mt-1 font-bold text-white">
                        Latency: <span className="text-emerald-400">{formatLatency(item.latencyMs)}</span>
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        Status: <span className={item.success ? "text-emerald-400" : "text-red-400"}>
                          {item.success ? "Success" : "Failed"}
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
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
