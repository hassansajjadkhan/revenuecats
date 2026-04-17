"use client";

import { useEffect, useState, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import FlexChart from "@/components/FlexChart";
import FlexBreakdown from "@/components/FlexBreakdown";
import FilterBar from "@/components/FilterBar";
import DetectedColumns from "@/components/DetectedColumns";
import {
  detectColumns,
  processData,
  getUniqueCategories,
} from "@/lib/data-processor";
import type { RawRow, FilterState, SmartMapping, ProcessedData } from "@/types";
import { BarChart3 } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const [rawData, setRawData] = useState<RawRow[]>([]);
  const [smartMapping, setSmartMapping] = useState<SmartMapping | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
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
          setCategories(getUniqueCategories(json.data, mapping.primaryCategory));
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
      <div className="flex min-h-screen bg-rc-bg">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Header title="Analytics" />
          <div className="p-8 text-center py-20">
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
    <div className="flex min-h-screen bg-rc-bg">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <Header title="Analytics" subtitle="Detailed data analysis" />
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
          {processedData && (
            <>
              {processedData.mapping && <DetectedColumns mapping={processedData.mapping} />}
              <FilterBar filters={filters} onFilterChange={handleFilterChange} categories={categories} />
              {processedData.timeSeriesCharts.map((chart, i) => (
                <FlexChart key={chart.title} chart={chart} variant={i === 0 ? "area" : "bar"} />
              ))}
              {processedData.categoryBreakdowns.map((bd) => (
                <FlexBreakdown key={bd.title} breakdown={bd} />
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
