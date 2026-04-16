"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "@/types";

interface TransactionChartProps {
  data: ChartDataPoint[];
  title?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="custom-tooltip">
      <p className="label">{label}</p>
      <p className="value">Transactions: {payload[0].value}</p>
    </div>
  );
}

export default function TransactionChart({
  data,
  title = "Transaction Volume",
}: TransactionChartProps) {
  return (
    <div className="bg-white rounded-xl border border-surface-border p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-gray-900 mb-6">{title}</h3>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
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
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
            <Bar
              dataKey="transactions"
              fill="#06b6d4"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
