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
import type { CategoryBreakdown } from "@/types";

interface FlexBreakdownProps {
  breakdown: CategoryBreakdown;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-[#171b22] border border-rc-border rounded-lg px-3 py-2.5 shadow-lg">
      <p className="font-medium text-white text-xs">{item.name}</p>
      <p className="text-xs text-rc-textMuted">
        {typeof item.value === "number" ? item.value.toLocaleString() : item.value}
      </p>
      <p className="text-xs text-rc-textDim">{item.percentage}% of total</p>
    </div>
  );
}

export default function FlexBreakdown({ breakdown }: FlexBreakdownProps) {
  const { title, items } = breakdown;

  return (
    <div className="bg-rc-card rounded-lg border border-rc-border p-4 animate-fade-in hover:border-rc-borderLight transition-colors">
      <h3 className="text-sm font-semibold text-white mb-4">{title}</h3>

      <div className="h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={items} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2e3340" horizontal={false} />
            <XAxis
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
            />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#9ba3b0" }}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(46, 51, 64, 0.25)" }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
              {items.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 space-y-1.5">
        {items.slice(0, 3).map((item, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-rc-text truncate">{item.name}</span>
            </div>
            <span className="text-rc-textMuted font-medium">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
