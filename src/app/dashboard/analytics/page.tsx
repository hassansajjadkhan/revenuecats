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
  Calendar,
  ChevronDown,
  Filter,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const [rawData, setRawData] = useState<RawRow[]>([]);
  const [smartMapping, setSmartMapping] = useState<SmartMapping | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHeader, setSelectedHeader] = useState("");
  const [searchCharts, setSearchCharts] = useState("");
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

  useEffect(() => {
    if (!processedData?.mapping?.numericColumns?.length) return;
    if (!selectedHeader) {
      setSelectedHeader(processedData.mapping.numericColumns[0]);
    }
  }, [processedData, selectedHeader]);

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
        <Header title="Analytics" subtitle="Charts and revenue exploration" />
        <div className="p-3 sm:p-5 lg:p-6 dashboard-content-wrap">
          {processedData && (
            <div className="rounded-xl border border-rc-border bg-[#0f1218]/80 overflow-hidden">
              <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] min-h-[720px]">
                <aside className="border-r border-rc-border bg-[#0d1016]">
                  <div className="h-12 px-4 flex items-center justify-between border-b border-rc-border">
                    <h3 className="text-sm font-semibold text-white">Charts</h3>
                    <Sparkles className="w-3.5 h-3.5 text-rc-textDim" />
                  </div>

                  <div className="p-3 border-b border-rc-border">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-rc-border bg-[#12161e]">
                      <Search className="w-3.5 h-3.5 text-rc-textDim" />
                      <input
                        value={searchCharts}
                        onChange={(e) => setSearchCharts(e.target.value)}
                        placeholder="Search charts..."
                        className="w-full bg-transparent text-sm text-rc-text placeholder:text-rc-textDim outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 space-y-2 max-h-[620px] overflow-y-auto">
                    <p className="text-xs text-rc-textMuted font-semibold uppercase tracking-wide px-1">Headers</p>
                    {processedData.mapping.numericColumns
                      .filter((header) =>
                        header.toLowerCase().includes(searchCharts.trim().toLowerCase())
                      )
                      .map((header) => {
                        const isSelected = header === selectedHeader;
                        return (
                          <button
                            key={header}
                            onClick={() => setSelectedHeader(header)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm border transition-colors ${
                              isSelected
                                ? "bg-[#151a22] border-rc-border text-white"
                                : "bg-transparent border-transparent text-rc-textMuted hover:bg-[#141921] hover:text-white"
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-[#00d18f] flex-shrink-0" />
                            <span className="truncate">{header}</span>
                          </button>
                        );
                      })}
                  </div>
                </aside>

                <section className="min-w-0">
                  <div className="h-12 px-4 border-b border-rc-border flex items-center">
                    <p className="text-sm text-rc-textMuted">
                      TruthSayer AI <span className="text-rc-textDim px-1">/</span> Charts <span className="text-rc-textDim px-1">/</span>{" "}
                      <span className="text-white font-medium">{selectedHeader || "Revenue"}</span>
                    </p>
                  </div>

                  <div className="p-4 sm:p-6">
                    {(() => {
                      const selectedChart =
                        processedData.timeSeriesCharts.find((chart) => chart.series[0]?.key === selectedHeader) ||
                        processedData.timeSeriesCharts[0];

                      const selectedSeries = selectedChart.series[0];
                      const seriesKey = selectedSeries.key;
                      const tablePoints = selectedChart.data.slice(-10);

                      return (
                        <>
                          <div className="flex items-start justify-between gap-3 mb-4">
                            <h2 className="text-4xl font-semibold tracking-tight text-white">
                              {selectedHeader || selectedChart.title.replace(" Over Time", "")}
                            </h2>
                            <div className="hidden sm:flex items-center gap-2">
                              <button className="px-3 py-1.5 rounded-lg border border-rc-border text-sm text-white bg-[#11151d] hover:bg-[#171c26] transition-colors">
                                Save chart
                              </button>
                              <button className="px-3 py-1.5 rounded-lg border border-rc-border text-sm text-white bg-[#11151d] hover:bg-[#171c26] transition-colors">
                                Share
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-rc-border bg-[#11151d] text-xs text-white">
                              <Filter className="w-3.5 h-3.5" /> Filter <ChevronDown className="w-3 h-3" />
                            </button>
                            <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-rc-border bg-[#11151d] text-xs text-white">
                              <SlidersHorizontal className="w-3.5 h-3.5" /> Segment <ChevronDown className="w-3 h-3" />
                            </button>
                            <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-rc-border bg-[#11151d] text-xs text-white">
                              <Calendar className="w-3.5 h-3.5" /> Last 90 days <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="rounded-lg border border-rc-border bg-[#10141b] p-3 sm:p-4">
                            <div className="h-[360px] sm:h-[400px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={selectedChart.data} margin={{ top: 8, right: 8, left: 0, bottom: 6 }}>
                                  <defs>
                                    <linearGradient id="analyticsRevenueArea" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#00d18f" stopOpacity={0.35} />
                                      <stop offset="95%" stopColor="#00d18f" stopOpacity={0.03} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#2e3340" vertical={false} />
                                  <XAxis
                                    dataKey={selectedChart.dateKey}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: "#9ba3b0" }}
                                  />
                                  <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: "#9ba3b0" }}
                                    tickFormatter={(value) => `US$${Number(value).toFixed(0)}`}
                                  />
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
                                    stroke="#00d18f"
                                    strokeWidth={2}
                                    fill="url(#analyticsRevenueArea)"
                                    dot={false}
                                  />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>

                            <div className="mt-4 border-t border-rc-border pt-3 overflow-x-auto">
                              <table className="w-full text-xs min-w-[860px]">
                                <thead>
                                  <tr className="text-rc-textMuted border-b border-rc-border">
                                    <th className="text-left py-2 px-2 font-medium">Summary</th>
                                    {tablePoints.map((point, idx) => (
                                      <th key={idx} className="text-left py-2 px-2 font-medium whitespace-nowrap">
                                        {String(point[selectedChart.dateKey] || "-")}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-b border-rc-border/60">
                                    <td className="py-2 px-2 text-white font-medium">{selectedSeries.label}</td>
                                    {tablePoints.map((point, idx) => (
                                      <td key={idx} className="py-2 px-2 text-white whitespace-nowrap">
                                        US${Number(point[seriesKey] || 0).toFixed(0)}
                                      </td>
                                    ))}
                                  </tr>
                                  <tr>
                                    <td className="py-2 px-2 text-rc-textMuted">Transactions</td>
                                    {tablePoints.map((point, idx) => (
                                      <td key={idx} className="py-2 px-2 text-rc-textMuted whitespace-nowrap">
                                        {Number(point.count || 0)}
                                      </td>
                                    ))}
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
