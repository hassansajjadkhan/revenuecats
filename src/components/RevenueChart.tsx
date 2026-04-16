"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface RevenueChartProps {
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
          {entry.name === "revenue"
            ? `Revenue: ${formatCurrency(entry.value)}`
            : `${entry.name}: ${entry.value}`}
        </p>
      ))}
    </div>
  );
}

export default function RevenueChart({
  data,
  title = "Revenue Over Time",
}: RevenueChartProps) {
  return (
    <div className="bg-white rounded-xl border border-surface-border p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            <span className="text-xs text-gray-500">Revenue</span>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2.5}
              fill="url(#revenueGradient)"
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: "#3b82f6" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function RevenueChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-surface-border p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-36 skeleton rounded" />
        <div className="h-3 w-20 skeleton rounded" />
      </div>
      <div className="h-[300px] skeleton rounded-lg" />
    </div>
  );
}
