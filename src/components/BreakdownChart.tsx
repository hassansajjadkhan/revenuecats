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
    <div className="bg-rc-card rounded-xl border border-rc-border p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-white mb-6">{title}</h3>

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
                stroke="#3a3a5c"
                horizontal={false}
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#6a6a8a" }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <YAxis
                type="category"
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9393b0" }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(58, 58, 92, 0.5)" }} />
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
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-rc-surface transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-rc-text">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(item.value)}
                </span>
                <span className="text-xs text-rc-textDim w-12 text-right">
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
