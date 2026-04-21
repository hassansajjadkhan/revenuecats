"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import MetricCard, { MetricCardSkeleton } from "@/components/MetricCard";
import FlexChart, { FlexChartSkeleton } from "@/components/FlexChart";
import GrowthChart from "@/components/GrowthChart";
import FlexBreakdown from "@/components/FlexBreakdown";
import FilterBar from "@/components/FilterBar";
import SheetConnector from "@/components/SheetConnector";
import DataTable from "@/components/DataTable";
import DetectedColumns from "@/components/DetectedColumns";
import {
  detectColumns,
  processData,
  getUniqueCategories,
} from "@/lib/data-processor";
import type { RawRow, FilterState, SmartMapping, ProcessedData } from "@/types";
import { BarChart3, ArrowRight } from "lucide-react";

export default function DashboardPage() {
  const [rawData, setRawData] = useState<RawRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [smartMapping, setSmartMapping] = useState<SmartMapping | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [lastUpdated, setLastUpdated] = useState<string>();
  const [sheetId, setSheetId] = useState<string>();
  const [sheetName, setSheetName] = useState<string>();
  const [categories, setCategories] = useState<string[]>([]);
  const [showTable, setShowTable] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    dateRange: { start: "", end: "" },
    category: "all",
    groupBy: "day",
  });

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
      const cats = getUniqueCategories(data, mapping.primaryCategory);
      setCategories(cats);
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
        setColumns(cols);
        setSheetId(id);
        setSheetName(name);

        // Smart-detect all column types from actual data
        const mapping = detectColumns(data);
        setSmartMapping(mapping);
        setIsConnected(true);
        setLastUpdated(new Date().toLocaleTimeString());

        // Save config
        localStorage.setItem(
          "dashboard_sheet_config",
          JSON.stringify({ sheetId: id, sheetName: name })
        );

        // Process data with detected mapping
        reprocessData(data, mapping, filters);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Connection failed");
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, reprocessData]
  );

  const handleFilterChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      if (rawData.length > 0 && smartMapping) {
        reprocessData(rawData, smartMapping, newFilters);
      }
    },
    [rawData, smartMapping, reprocessData]
  );

  const handleRefresh = useCallback(() => {
    if (sheetId) {
      handleConnect(sheetId, sheetName);
    }
  }, [sheetId, sheetName, handleConnect]);

  return (
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
              {/* Detected columns info */}
              {processedData.mapping && (
                <DetectedColumns mapping={processedData.mapping} />
              )}

              {/* Filters */}
              <FilterBar
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
              />

              {/* Metric Cards */}
              {processedData.metrics.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {processedData.metrics.map((metric, i) => (
                    <MetricCard key={metric.label} metric={metric} index={i} />
                  ))}
                </div>
              )}

              {/* Time Series Charts */}
              {processedData.timeSeriesCharts.length > 0 && (
                <>
                  {/* First chart full width */}
                  <FlexChart chart={processedData.timeSeriesCharts[0]} variant="area" />

                  {/* Remaining charts in grid */}
                  {processedData.timeSeriesCharts.length > 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      {processedData.timeSeriesCharts.slice(1).map((chart, i) => (
                        <FlexChart
                          key={chart.title}
                          chart={chart}
                          variant={i === processedData.timeSeriesCharts.length - 2 ? "bar" : "area"}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Growth Chart */}
              {processedData.growthData.length > 0 && (
                <GrowthChart data={processedData.growthData} />
              )}

              {/* Category Breakdowns */}
              {processedData.categoryBreakdowns.map((bd) => (
                <FlexBreakdown key={bd.title} breakdown={bd} />
              ))}

              {/* Data Table Toggle */}
              <div>
                <button
                  onClick={() => setShowTable(!showTable)}
                  className="text-sm font-medium text-rc-accent hover:text-rc-accentHover transition-colors"
                >
                  {showTable ? "Hide raw data" : "Show raw data table"}
                </button>

                {showTable && (
                  <div className="mt-4">
                    <DataTable
                      data={processedData.rawData}
                      columns={processedData.columns}
                    />
                  </div>
                )}
              </div>

              {/* Sheet Connector at bottom */}
              <div className="pt-4 border-t border-rc-border">
                <SheetConnector
                  onConnect={handleConnect}
                  isConnected={isConnected}
                  isLoading={isLoading}
                  error={error}
                />
              </div>
            </>
          )}

          {/* Loading State */}
          {isLoading && !processedData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <MetricCardSkeleton key={i} />
                ))}
              </div>
              <FlexChartSkeleton />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
