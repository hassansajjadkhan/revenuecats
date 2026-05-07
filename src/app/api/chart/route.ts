import { NextRequest, NextResponse } from "next/server";
import { fetchSheetData } from "@/lib/google-sheets";
import { detectColumns, processData, isPreAggregatedMetricsSheet, getPreAggregatedMetrics } from "@/lib/data-processor";
import type { RawRow, ChartDataPoint } from "@/types";

// Mark this route as dynamic since it depends on query parameters
export const dynamic = "force-dynamic";

interface ChartResponse {
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
  error?: string;
}

const CHART_COLORS = [
  "#66d9e8", "#a5d8ff", "#b2f2bb", "#ffd8a8",
  "#eebefa", "#ffc9c9", "#ff6b6b", "#4ecdc4",
];

function calculateMetadata(values: number[]): ChartResponse["metadata"] {
  if (values.length === 0) return undefined;

  const latest = values[values.length - 1];
  const previous = values[values.length - 2] ?? values[0];
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const change = previous !== 0 ? ((latest - previous) / previous) * 100 : 0;

  return { latest, average, change, min, max };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chartName = searchParams.get("chart");
    const sheetId = searchParams.get("sheetId");
    const sheetName = searchParams.get("sheetName");

    if (!chartName || !sheetId) {
      return NextResponse.json(
        { error: "Missing required parameters: chart and sheetId" },
        { status: 400 }
      );
    }

    // Fetch sheet data directly using the library function
    let data: RawRow[] = [];

    try {
      data = await fetchSheetData(sheetId, sheetName || undefined);
    } catch (error) {
      console.error("Error fetching sheet data:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to fetch sheet data" },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No data found in sheet" },
        { status: 404 }
      );
    }

    // Detect columns and check if pre-aggregated
    const mapping = detectColumns(data);
    const allColumns = Object.keys(data[0] || {});
    const isPreAggregated = isPreAggregatedMetricsSheet(allColumns);

    const preAggMetrics = getPreAggregatedMetrics(allColumns);
    
    console.log("Chart API Debug:", {
      sheetId,
      columns: allColumns,
      numRows: data.length,
      isPreAggregated,
      preAggMetrics,
      requestedChart: chartName,
    });

    if (!isPreAggregated) {
      console.error("Not pre-aggregated:", {
        columns: allColumns,
        dateColumns: mapping.dateColumns,
      });
      return NextResponse.json(
        { 
          error: `This sheet does not appear to contain pre-aggregated metrics.\n\nColumns found: ${allColumns.join(", ")}\n\nDate columns: ${mapping.dateColumns.join(", ") || "None detected"}\n\nMake sure your sheet has a Date column and metric columns (like Revenue, MRR, ARR, etc.).`,
          debug: { allColumns, isPreAggregated, preAggMetrics }
        },
        { status: 400 }
      );
    }

    // Find matching metric with fuzzy matching
    const findBestMetricMatch = (requested: string, available: string[]): string | null => {
      const req = requested.toLowerCase().trim();
      
      // Exact match first
      const exact = available.find((m: string) => m.toLowerCase() === req);
      if (exact) return exact;
      
      // Partial match - check if column contains all key words from request
      const requestWords = req.split(/\s+/).filter((w: string) => w.length > 2);
      let bestMatch: { metric: string; score: number } | null = null;
      
      for (const metric of available) {
        const metricLower = metric.toLowerCase();
        const metricWords = metricLower.split(/[\s_-]+/).filter((w: string) => w.length > 0);
        
        // Count how many request words are in this metric
        let matchCount = 0;
        for (const word of requestWords) {
          if (metricWords.some((mw: string) => mw.includes(word) || word.includes(mw))) {
            matchCount++;
          }
        }
        
        // If any words match, calculate a score
        if (matchCount > 0) {
          const score = matchCount / Math.max(requestWords.length, metricWords.length);
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { metric, score };
          }
        }
      }
      
      // Return best match if score is decent (at least 50% match)
      return bestMatch && bestMatch.score >= 0.5 ? bestMatch.metric : null;
    };

    const matchingMetric = findBestMetricMatch(chartName, preAggMetrics);

    if (!matchingMetric) {
      console.error("Metric not found:", {
        requested: chartName,
        available: preAggMetrics,
      });
      return NextResponse.json(
        {
          error: `Chart "${chartName}" not found. Available metrics: ${preAggMetrics.join(", ")}`,
          debug: { preAggMetrics, availableCharts: preAggMetrics }
        },
        { status: 404 }
      );
    }

    // Process data to extract time-series
    const processedData = processData(data, mapping);

    // Find the matching chart in time series using fuzzy matching
    const findBestChartMatch = (requested: string, available: any[]): any | null => {
      const req = requested.toLowerCase().trim();
      
      // Exact match first
      const exact = available.find((c: any) => c.title.toLowerCase() === req);
      if (exact) return exact;
      
      // Partial match
      const requestWords = req.split(/\s+/).filter((w: string) => w.length > 2);
      let bestMatch: { chart: any; score: number } | null = null;
      
      for (const chart of available) {
        const chartLower = chart.title.toLowerCase();
        const chartWords = chartLower.split(/[\s_-]+/).filter((w: string) => w.length > 0);
        
        let matchCount = 0;
        for (const word of requestWords) {
          if (chartWords.some((cw: string) => cw.includes(word) || word.includes(cw))) {
            matchCount++;
          }
        }
        
        if (matchCount > 0) {
          const score = matchCount / Math.max(requestWords.length, chartWords.length);
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { chart, score };
          }
        }
      }
      
      return bestMatch && bestMatch.score >= 0.5 ? bestMatch.chart : null;
    };

    const chart = findBestChartMatch(chartName, processedData.timeSeriesCharts);

    if (!chart) {
      return NextResponse.json(
        { error: `Could not generate chart data for "${chartName}". Available: ${processedData.timeSeriesCharts.map(c => c.title).join(", ")}` },
        { status: 500 }
      );
    }

    // Extract values for metadata
    const values = chart.data
      .map((point: ChartDataPoint) => point[matchingMetric] as number)
      .filter((v: number) => typeof v === "number" && isFinite(v));

    const response: ChartResponse = {
      data: chart.data,
      title: chart.title,
      series: chart.series,
      metadata: calculateMetadata(values),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chart API Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
