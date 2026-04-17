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
    <div className="bg-rc-card rounded-xl border border-rc-border p-5 animate-fade-in">
      <h3 className="text-sm font-semibold text-white mb-6">{title}</h3>

      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
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
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(46, 51, 64, 0.5)" }} />
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
