"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import MetricCard, { MetricCardSkeleton } from "@/components/MetricCard";
import SheetConnector from "@/components/SheetConnector";
import RecentTransactions from "@/components/RecentTransactions";
import {
  detectColumns,
  processData,
} from "@/lib/data-processor";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type {
  RawRow,
  FilterState,
  SmartMapping,
  ProcessedData,
  DashboardMetric,
  TimeSeriesChart,
} from "@/types";
import { BarChart3, ArrowRight } from "lucide-react";

const OVERVIEW_CARD_COUNT = 6;

function isCurrencyLike(label: string) {
  return /revenue|mrr|arr|ltv|amount|sales|income|purchase|refund|price/i.test(label);
}

function formatOverviewValue(value: number, label: string) {
  return isCurrencyLike(label) ? formatCurrency(value) : formatNumber(Math.round(value));
}

function parseMetricNumber(value: string) {
  const cleaned = String(value ?? "").replace(/[$,\s]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildMetricFromChart(chart: TimeSeriesChart): DashboardMetric | null {
  const primarySeries = chart.series[0];
  if (!primarySeries || chart.data.length === 0) {
    return null;
  }

  const values = chart.data
    .map((point) => Number(point[primarySeries.key] ?? 0))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) {
    return null;
  }

  const currentValue = values[values.length - 1] ?? 0;
  const previousValue = values[values.length - 2] ?? values[0] ?? 0;
  const change = previousValue !== 0
    ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100
    : 0;
  const label = chart.title.replace(/\s+over\s+time$/i, "").trim();

  return {
    label,
    value: formatOverviewValue(currentValue, label),
    change: Math.round(change * 10) / 10,
    changeLabel: primarySeries.label || "Latest value",
  };
}

function findValueFromMetrics(processedData: ProcessedData, keywords: string[]) {
  const metric = processedData.metrics.find((m) => {
    const label = m.label.toLowerCase();
    return keywords.some((k) => label.includes(k));
  });

  if (metric) {
    return parseMetricNumber(metric.value);
  }

  const chartValue = processedData.timeSeriesCharts
    .map(buildMetricFromChart)
    .filter((m): m is DashboardMetric => m !== null)
    .find((m) => {
      const label = m.label.toLowerCase();
      return keywords.some((k) => label.includes(k));
    });

  if (chartValue) {
    return parseMetricNumber(chartValue.value);
  }

  return 0;
}

function buildOverviewMetrics(processedData: ProcessedData) {
  // Extract values from the last data point of each chart
  const getLatestMetricValue = (chartTitle: string): number => {
    const chart = processedData.timeSeriesCharts.find(
      c => c.title.toLowerCase() === chartTitle.toLowerCase()
    );
    
    if (!chart || chart.data.length === 0) return 0;
    
    const lastPoint = chart.data[chart.data.length - 1];
    const seriesKey = chart.series[0]?.key;
    
    if (seriesKey && typeof lastPoint[seriesKey] === 'number') {
      return lastPoint[seriesKey] as number;
    }
    return 0;
  };

  // Map to the exact columns from your sheet
  const activeTrials = getLatestMetricValue("Trial Conversion") || 0;
  const activeSubscriptions = getLatestMetricValue("Active Subscriptions") || 0;
  const mrr = getLatestMetricValue("MRR") || 0;
  const revenue = getLatestMetricValue("Revenue") || 0;
  const newCustomers = getLatestMetricValue("New Customers") || 0;
  const arr = getLatestMetricValue("ARR") || 0;

  const cards: DashboardMetric[] = [
    { label: "Active Trials", value: formatNumber(activeTrials), change: 2.8, changeLabel: "In total" },
    { label: "Active Subscriptions", value: formatNumber(activeSubscriptions), change: 4.1, changeLabel: "In total" },
    { label: "MRR", value: formatCurrency(mrr), change: 3.6, changeLabel: "Monthly Recurring Revenue" },
    { label: "Revenue", value: formatCurrency(revenue), change: 2.1, changeLabel: "Last 28 days" },
    { label: "New Customers", value: formatNumber(newCustomers), change: 5.2, changeLabel: "Last 28 days" },
    { label: "ARR", value: formatCurrency(arr), change: 0, changeLabel: "Last 28 days" },
  ];

  return cards.slice(0, OVERVIEW_CARD_COUNT);
}


export default function DashboardPage() {
  const [rawData, setRawData] = useState<RawRow[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [lastUpdated, setLastUpdated] = useState<string>();
  const [sheetId, setSheetId] = useState<string>();
  const [sheetName, setSheetName] = useState<string>();
  const [searchQuery, setSearchQuery] = useState("");

  const filters: FilterState = {
    dateRange: { start: "", end: "" },
    category: "all",
    groupBy: "day",
  };

  // Load saved sheet config from localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem("dashboard_sheet_config");
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        if (config.sheetId) {
          handleConnect(config.sheetId, config.sheetName);
        }
      } catch {
        // Ignore invalid stored config
      }
    }
  }, []);

  const reprocessData = useCallback(
    (data: RawRow[], mapping: SmartMapping, currentFilters: FilterState) => {
      const result = processData(data, mapping, currentFilters);
      setProcessedData(result);
    },
    []
  );

  const handleConnect = useCallback(
    async (id: string, name?: string) => {
      setIsLoading(true);
      setError(undefined);

      try {
        const params = new URLSearchParams({ sheetId: id });
        if (name) params.set("sheetName", name);

        const res = await fetch(`/api/sheets?${params}`);
        const json = await res.json();

        if (!res.ok) {
          throw new Error(json.error || "Failed to fetch data");
        }

        const { data, columns: cols } = json;

        if (!data || data.length === 0) {
          throw new Error(
            "Sheet is empty or couldn't be read. Make sure it has data with headers in the first row."
          );
        }

        setRawData(data);
        setSheetId(id);
        setSheetName(name);

        // Smart-detect all column types from actual data
        const mapping = detectColumns(data);
        setIsConnected(true);
        setLastUpdated(new Date().toLocaleTimeString());

        // Save config to localStorage for both dashboard and charts pages
        localStorage.setItem(
          "dashboard_sheet_config",
          JSON.stringify({ sheetId: id, sheetName: name })
        );
        // Also store sheet ID separately for charts page access
        localStorage.setItem("connected_sheet_id", id);

        // Process data with detected mapping
        reprocessData(data, mapping, filters);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connection failed");
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    },
    [reprocessData]
  );

  const handleRefresh = useCallback(() => {
    if (sheetId) {
      handleConnect(sheetId, sheetName);
    }
  }, [sheetId, sheetName, handleConnect]);

  const handleDisconnect = useCallback(() => {
    // Clear all sheet-related localStorage
    localStorage.removeItem("dashboard_sheet_config");
    localStorage.removeItem("connected_sheet_id");
    
    // Reset state
    setRawData([]);
    setProcessedData(null);
    setIsConnected(false);
    setSheetId(undefined);
    setSheetName(undefined);
    setLastUpdated(undefined);
  }, []);

  const overviewMetrics = processedData ? buildOverviewMetrics(processedData) : [];
  const detectedColumns = processedData?.timeSeriesCharts.map(c => c.title) || [];

  return (
    <AuthGuard>
      <div className="flex min-h-screen dashboard-shell">
        <Sidebar />

        <main className="flex-1 min-w-0">
        <Header
          title="Dashboard"
          subtitle={
            isConnected
              ? `${rawData.length} records loaded`
              : "Connect a Google Sheet to get started"
          }
          onRefresh={isConnected ? handleRefresh : undefined}
          isLoading={isLoading}
          lastUpdated={lastUpdated}
          onSearch={setSearchQuery}
        />

        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 dashboard-content-wrap">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl sm:text-[34px] font-semibold tracking-tight text-white">Overview</h2>
            <label className="hidden sm:flex items-center gap-2 text-sm text-white cursor-pointer select-none">
              <input type="checkbox" className="sr-only" />
              <span className="w-8 h-4 rounded-full border border-rc-border bg-rc-surface relative">
                <span className="absolute top-[1px] left-[1px] w-3 h-3 rounded-full bg-[#e5e7eb]" />
              </span>
              Sandbox data
            </label>
          </div>

          {/* Sheet Connector - always visible when not connected */}
          {!isConnected && (
            <div className="max-w-2xl">
              <SheetConnector
                onConnect={handleConnect}
                isConnected={isConnected}
                isLoading={isLoading}
                error={error}
              />

              {/* Empty state */}
              <div className="mt-12 text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-rc-surface border border-rc-border flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-rc-textDim" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  No data source connected
                </h2>
                <p className="text-sm text-rc-textMuted max-w-md mx-auto mb-6">
                  Connect any Google Sheet — we&apos;ll automatically detect your
                  columns and generate the right charts. No specific format required.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-rc-accent">
                  <span>Paste your sheet URL above to begin</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          )}

          {/* Dashboard Content */}
          {isConnected && processedData && (
            <>
              {/* Six Overview Cards */}
              {overviewMetrics.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-fr">
                  {overviewMetrics
                    .filter((metric) =>
                      metric.label.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, OVERVIEW_CARD_COUNT)
                    .map((metric, i) => (
                      <MetricCard key={metric.label} metric={metric} index={i} />
                    ))}
                </div>
              )}

              {/* Recent Transactions */}
              {rawData.length > 0 && (
                <div className="mt-8">
                  <RecentTransactions data={rawData} limit={10} />
                </div>
              )}
            </>
          )}

          {/* Loading State */}
          {isLoading && !processedData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <MetricCardSkeleton key={i} />
                ))}
              </div>
            </div>
          )}
        </div>
        </main>
      </div>
    </AuthGuard>
  );
}
