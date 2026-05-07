"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import {
  CircleDollarSign,
  Repeat,
  Users2,
  Filter,
  Timer,
  Undo2,
  ChevronRight,
  Search,
  BarChart3,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { cn, formatCurrency, formatNumber } from "@/lib/utils";
import type { ChartDataPoint } from "@/types";

const chartsMenu = [
  {
    label: "Revenue",
    icon: CircleDollarSign,
    colorClass: "text-[#66d9e8]",
    items: ["Cumulative Revenue", "ARR", "MRR", "Non-Subscription Purchases"],
  },
  {
    label: "Subscriptions",
    icon: Repeat,
    colorClass: "text-[#a5d8ff]",
    items: ["Active Subscriptions", "Active Subscriptions Movement", "New Paid Subscriptions", "Subscription Retention", "Subscription Status"],
  },
  {
    label: "Cohorts and LTV",
    icon: Users2,
    colorClass: "text-[#b2f2bb]",
    items: ["Cohort Explorer", "Realized LTV per Customer", "Realized LTV per Paying Customer"],
  },
  {
    label: "Conversion funnel",
    icon: Filter,
    colorClass: "text-[#ffd8a8]",
    items: ["New Customers", "Initial Conversion", "Trial Conversion", "Conversion to Paying"],
  },
  {
    label: "Trials",
    icon: Timer,
    colorClass: "text-[#eebefa]",
    items: ["Active Trials", "Active Trials Movement", "New Trials"],
  },
  {
    label: "Churn and refunds",
    icon: Undo2,
    colorClass: "text-[#ffc9c9]",
    items: ["Churn", "Refund Rate", "App Store Refund Requests", "Play Store Cancel Reasons", "Customer Center Survey Responses"],
  },
];

interface ChartData {
  data: ChartDataPoint[];
  title: string;
  series: Array<{
    key: string;
    label: string;
    color: string;
  }>;
  metadata?: {
    latest?: number;
    average?: number;
    change?: number;
    min?: number;
    max?: number;
  };
}

function ChartsPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Revenue: true,
  });
  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetId, setSheetId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("dashboard_sheet_config");
    if (stored) {
      try {
        const config = JSON.parse(stored);
        if (config.sheetId) {
          setSheetId(config.sheetId);
          // Also store the sheet name for chart API
          localStorage.setItem("connected_sheet_name", config.sheetName || "");
        }
      } catch (e) {
        console.error("Error parsing sheet config:", e);
      }
    }
  }, []);

  const toggleCategory = (label: string) => {
    setExpandedCategories((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleChartSelect = async (chartName: string) => {
    if (!sheetId) {
      setError("No sheet connected. Please connect a sheet in the Overview tab.");
      return;
    }

    setSelectedChart(chartName);
    setLoading(true);
    setError(null);

    try {
      const sheetName = localStorage.getItem("connected_sheet_name") || "";
      const params = new URLSearchParams({
        chart: chartName,
        sheetId: sheetId,
      });
      if (sheetName) {
        params.set("sheetName", sheetName);
      }

      const response = await fetch(`/api/chart?${params}`);

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch chart data");
      }

      const data = await response.json();
      setChartData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load chart");
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  const filteredCharts = chartsMenu.filter((category) => {
    const matchesSearch =
      category.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.items.some((item) => item.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const isCurrencyMetric = (title: string) => {
    return /revenue|arr|mrr|ltv|amount|sales|price|purchase/i.test(title);
  };

  const formatTooltipValue = (value: number, title: string) => {
    return isCurrencyMetric(title) ? formatCurrency(value) : formatNumber(Math.round(value));
  };

  return (
    <AuthGuard>
      <div className="flex min-h-screen dashboard-shell">
        <Sidebar />

        <main className="flex-1 min-w-0">
          <Header title="Charts" subtitle="Browse and view all revenue charts" onSearch={setSearchQuery} />

          <div className="flex flex-1 min-h-screen">
            {/* Charts Navigation Panel */}
            <div className="w-64 border-r border-[#2e3340] bg-[#141821] flex flex-col">
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* Back Button */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm text-[#8892a4] hover:text-white mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Overview
                </Link>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f7788]" />
                  <input
                    type="text"
                    placeholder="Search charts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0f1218] border border-[#2e3340] text-[13px] text-white placeholder-[#6f7788] outline-none focus:border-[#3a4150]"
                  />
                </div>

                {/* Chart Categories */}
                <div className="space-y-1">
                  {filteredCharts.map((category) => {
                    const CategoryIcon = category.icon;
                    const isExpanded = expandedCategories[category.label];

                    return (
                      <div key={category.label}>
                        <button
                          onClick={() => toggleCategory(category.label)}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold text-white hover:bg-[#1a1f2e] transition-colors group"
                        >
                          <span className="flex items-center gap-3">
                            <CategoryIcon className={cn("w-4 h-4 flex-shrink-0", category.colorClass)} />
                            <span>{category.label}</span>
                          </span>
                          <ChevronRight
                            className={cn(
                              "w-3.5 h-3.5 text-[#6f7788] transition-transform",
                              isExpanded && "rotate-90"
                            )}
                          />
                        </button>

                        {isExpanded && (
                          <div className="mt-1 space-y-1 ml-2">
                            {category.items.map((item) => (
                              <button
                                key={item}
                                onClick={() => handleChartSelect(item)}
                                className={cn(
                                  "w-full text-left px-3 py-2 rounded-lg text-[12px] transition-colors truncate",
                                  selectedChart === item
                                    ? "bg-[#1a1f2e] text-white font-medium"
                                    : "text-[#8892a4] hover:text-white hover:bg-[#0f1218]"
                                )}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 lg:p-8">
              {!sheetId ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-rc-surface border border-rc-border flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-rc-textDim" />
                  </div>
                  <h2 className="text-lg font-semibold text-white mb-2">No sheet connected</h2>
                  <p className="text-sm text-rc-textMuted max-w-md mx-auto mb-6">
                    Connect a Google Sheet in the Overview tab to view charts.
                  </p>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Go to Overview
                  </Link>
                </div>
              ) : !selectedChart ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-rc-surface border border-rc-border flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-rc-textDim" />
                  </div>
                  <h2 className="text-lg font-semibold text-white mb-2">Select a chart</h2>
                  <p className="text-sm text-rc-textMuted max-w-md mx-auto">
                    Choose a chart from the left panel to view detailed analytics and trends.
                  </p>
                </div>
              ) : loading ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                  <p className="text-sm text-rc-textMuted">Loading chart data...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-red-500" />
                  </div>
                  <h2 className="text-lg font-semibold text-white mb-2">Error loading chart</h2>
                  <p className="text-sm text-red-400 max-w-md mx-auto text-center">{error}</p>
                </div>
              ) : chartData ? (
                <div className="space-y-6">
                  {/* Chart Header */}
                  <div>
                    <h2 className="text-2xl font-semibold text-white mb-2">{chartData.title}</h2>
                    {chartData.metadata && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {chartData.metadata.latest !== undefined && (
                          <div className="bg-[#0f1218] border border-[#2e3340] rounded-lg p-3">
                            <p className="text-[12px] text-[#8892a4] mb-1">Latest</p>
                            <p className="text-lg font-semibold text-white">
                              {formatTooltipValue(chartData.metadata.latest, chartData.title)}
                            </p>
                          </div>
                        )}
                        {chartData.metadata.average !== undefined && (
                          <div className="bg-[#0f1218] border border-[#2e3340] rounded-lg p-3">
                            <p className="text-[12px] text-[#8892a4] mb-1">Average</p>
                            <p className="text-lg font-semibold text-white">
                              {formatTooltipValue(chartData.metadata.average, chartData.title)}
                            </p>
                          </div>
                        )}
                        {chartData.metadata.change !== undefined && (
                          <div className="bg-[#0f1218] border border-[#2e3340] rounded-lg p-3">
                            <p className="text-[12px] text-[#8892a4] mb-1">Change</p>
                            <p className={`text-lg font-semibold ${chartData.metadata.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {chartData.metadata.change >= 0 ? '+' : ''}{chartData.metadata.change.toFixed(1)}%
                            </p>
                          </div>
                        )}
                        {chartData.metadata.min !== undefined && (
                          <div className="bg-[#0f1218] border border-[#2e3340] rounded-lg p-3">
                            <p className="text-[12px] text-[#8892a4] mb-1">Min</p>
                            <p className="text-lg font-semibold text-white">
                              {formatTooltipValue(chartData.metadata.min, chartData.title)}
                            </p>
                          </div>
                        )}
                        {chartData.metadata.max !== undefined && (
                          <div className="bg-[#0f1218] border border-[#2e3340] rounded-lg p-3">
                            <p className="text-[12px] text-[#8892a4] mb-1">Max</p>
                            <p className="text-lg font-semibold text-white">
                              {formatTooltipValue(chartData.metadata.max, chartData.title)}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Chart */}
                  <div className="bg-[#0f1218] border border-[#2e3340] rounded-lg p-6">
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart
                        data={chartData.data}
                        margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                      >
                        <defs>
                          {chartData.series.map((series) => (
                            <linearGradient
                              key={series.key}
                              id={`gradient-${series.key}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={series.color}
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor={series.color}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2e3340" />
                        <XAxis
                          dataKey="date"
                          stroke="#6f7788"
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis
                          stroke="#6f7788"
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) =>
                            formatTooltipValue(value, chartData.title).split("$").pop() || ""
                          }
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#141821",
                            border: "1px solid #2e3340",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#white" }}
                          formatter={(value) =>
                            formatTooltipValue(value as number, chartData.title)
                          }
                        />
                        {chartData.series.length > 0 && (
                          <Legend
                            wrapperStyle={{
                              paddingTop: "20px",
                            }}
                          />
                        )}
                        {chartData.series.map((series) => (
                          <Area
                            key={series.key}
                            type="monotone"
                            dataKey={series.key}
                            stroke={series.color}
                            fill={`url(#gradient-${series.key})`}
                            name={series.label}
                            isAnimationActive={false}
                          />
                        ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

export default function ChartsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ChartsPageContent />
    </Suspense>
  );
}
