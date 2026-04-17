"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { TimeSeriesChart } from "@/types";

interface FlexChartProps {
  chart: TimeSeriesChart;
  variant?: "area" | "bar";
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-rc-card border border-rc-border rounded-lg px-4 py-3 shadow-lg shadow-black/30">
      <p className="font-semibold text-white text-sm mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

export default function FlexChart({ chart, variant = "area" }: FlexChartProps) {
  const { title, dateKey, series, data } = chart;

  return (
    <div className="bg-rc-card rounded-xl border border-rc-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-4">
          {series.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-rc-textMuted">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {variant === "area" ? (
            <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <defs>
                {series.map((s) => (
                  <linearGradient key={s.key} id={`grad_${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={s.color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5c" />
              <XAxis
                dataKey={dateKey}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6a6a8a" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6a6a8a" }}
                tickFormatter={(v) =>
                  v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`
                }
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              {series.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2.5}
                  fill={`url(#grad_${s.key})`}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: s.color }}
                />
              ))}
            </AreaChart>
          ) : (
            <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3a3a5c" />
              <XAxis
                dataKey={dateKey}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6a6a8a" }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6a6a8a" }}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(58, 58, 92, 0.5)" }} />
              {series.map((s) => (
                <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[4, 4, 0, 0]} barSize={20} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function FlexChartSkeleton() {
  return (
    <div className="bg-rc-card rounded-xl border border-rc-border p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-36 skeleton rounded" />
        <div className="h-3 w-20 skeleton rounded" />
      </div>
      <div className="h-[300px] skeleton rounded-lg" />
    </div>
  );
}
