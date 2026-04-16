"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { BreakdownItem } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface BreakdownChartProps {
  data: BreakdownItem[];
  title?: string;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload as BreakdownItem;

  return (
    <div className="custom-tooltip">
      <p className="label">{item.name}</p>
      <p className="value">{formatCurrency(item.value)}</p>
      <p className="value">{item.percentage}% of total</p>
    </div>
  );
}

export default function BreakdownChart({
  data,
  title = "Revenue by Category",
}: BreakdownChartProps) {
  return (
    <div className="bg-white rounded-xl border border-surface-border p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-gray-900 mb-6">{title}</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 10, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                horizontal={false}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend list */}
        <div className="space-y-3">
          {data.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(item.value)}
                </span>
                <span className="text-xs text-gray-400 w-12 text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
