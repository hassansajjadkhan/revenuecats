"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface GrowthChartProps {
  data: ChartDataPoint[];
  title?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="custom-tooltip">
      <p className="label">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="value" style={{ color: entry.color }}>
          {entry.name === "cumulative"
            ? `Cumulative: ${formatCurrency(entry.value)}`
            : `Revenue: ${formatCurrency(entry.value)}`}
        </p>
      ))}
    </div>
  );
}

export default function GrowthChart({
  data,
  title = "Cumulative Revenue Growth",
}: GrowthChartProps) {
  return (
    <div className="bg-rc-card rounded-xl border border-rc-border p-3 sm:p-5 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
            <span className="text-xs text-rc-textMuted">Cumulative</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-xs text-rc-textMuted">Per Period</span>
          </div>
        </div>
      </div>

      <div className="h-[220px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3340" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#8b5cf6"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: "#8b5cf6" }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#06b6d4"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
              activeDot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#06b6d4" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
