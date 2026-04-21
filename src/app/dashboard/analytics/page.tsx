"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import {
  detectColumns,
  processData,
} from "@/lib/data-processor";
import type { RawRow, FilterState, SmartMapping, ProcessedData } from "@/types";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
} from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const [rawData, setRawData] = useState<RawRow[]>([]);
  const [smartMapping, setSmartMapping] = useState<SmartMapping | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: "", end: "" },
    category: "all",
    groupBy: "day",
  });

  useEffect(() => {
    const config = localStorage.getItem("dashboard_sheet_config");
    if (!config) {
      setIsLoading(false);
      return;
    }

    try {
      const { sheetId, sheetName } = JSON.parse(config);
      if (!sheetId) {
        setIsLoading(false);
        return;
      }

      const params = new URLSearchParams({ sheetId });
      if (sheetName) params.set("sheetName", sheetName);

      fetch(`/api/sheets?${params}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.error) throw new Error(json.error);
          const mapping = detectColumns(json.data);
          setRawData(json.data);
          setSmartMapping(mapping);
          const result = processData(json.data, mapping, filters);
          setProcessedData(result);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } catch {
      setIsLoading(false);
    }
  }, []);

  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      if (rawData.length > 0 && smartMapping) {
        const result = processData(rawData, smartMapping, newFilters);
        setProcessedData(result);
      }
    },
    [rawData, smartMapping]
  );

  if (!isLoading && !processedData) {
    return (
      <div className="flex min-h-screen dashboard-shell">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Header title="Analytics" />
          <div className="p-8 text-center py-20 dashboard-content-wrap">
            <BarChart3 className="w-12 h-12 text-rc-textDim mx-auto mb-4" />
            <p className="text-rc-textMuted mb-4">No data source connected</p>
            <Link href="/settings" className="text-rc-accent hover:text-rc-accentHover text-sm font-medium">
              Connect a Google Sheet →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen dashboard-shell">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Header 
          title="Analytics" 
          subtitle="Charts and revenue exploration"
          onSearch={setSearchQuery}
        />
        <div className="p-3 sm:p-5 lg:p-6 dashboard-content-wrap">
          {processedData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-max">
              {processedData.timeSeriesCharts
                .slice(0, 6)
                .filter((chart) =>
                  chart.series[0].label.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((chart, idx) => {
                const series = chart.series[0];
                const seriesKey = series.key;
                const colors = [
                  { gradient: "analyticsChart0", stroke: "#00d18f", start: "rgba(0, 209, 143, 0.35)", end: "rgba(0, 209, 143, 0.03)" },
                  { gradient: "analyticsChart1", stroke: "#3b82f6", start: "rgba(59, 130, 246, 0.35)", end: "rgba(59, 130, 246, 0.03)" },
                  { gradient: "analyticsChart2", stroke: "#8b5cf6", start: "rgba(139, 92, 246, 0.35)", end: "rgba(139, 92, 246, 0.03)" },
                  { gradient: "analyticsChart3", stroke: "#ec4899", start: "rgba(236, 72, 153, 0.35)", end: "rgba(236, 72, 153, 0.03)" },
                  { gradient: "analyticsChart4", stroke: "#f59e0b", start: "rgba(245, 158, 11, 0.35)", end: "rgba(245, 158, 11, 0.03)" },
                  { gradient: "analyticsChart5", stroke: "#10b981", start: "rgba(16, 185, 129, 0.35)", end: "rgba(16, 185, 129, 0.03)" },
                ];
                const color = colors[idx % colors.length];

                return (
                  <div key={idx} className="rounded-lg border border-rc-border bg-[#0f1218] overflow-hidden hover:border-rc-borderLight transition-colors">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-semibold text-rc-textMuted uppercase tracking-tight">{series.label}</h3>
                          <p className="text-2xl font-bold text-white mt-1">
                            {Number(chart.data[chart.data.length - 1]?.[seriesKey] || 0).toLocaleString('en-US', {
                              style: 'currency',
                              currency: 'USD',
                              maximumFractionDigits: 0
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-rc-textMuted mb-1">Last 30 days</p>
                          <p className="text-sm font-semibold text-emerald-400">+12.5%</p>
                        </div>
                      </div>

                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chart.data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id={color.gradient} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color.start} />
                                <stop offset="95%" stopColor={color.end} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2e3340" vertical={false} />
                            <XAxis dataKey={chart.dateKey} tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#9ba3b0" }} />
                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#9ba3b0" }} width={30} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#171b22",
                                border: "1px solid #2e3340",
                                borderRadius: "8px",
                                color: "#e1e4ea",
                                fontSize: "12px",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey={seriesKey}
                              stroke={color.stroke}
                              strokeWidth={1.5}
                              fill={`url(#${color.gradient})`}
                              dot={false}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                );
              })}
              {searchQuery && processedData.timeSeriesCharts.filter((chart) =>
                chart.series[0].label.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-12">
                  <p className="text-rc-textMuted mb-2">No charts match "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-sm text-rc-accent hover:text-rc-accentHover transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
