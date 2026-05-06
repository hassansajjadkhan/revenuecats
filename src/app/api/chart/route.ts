import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { detectColumns, processData, isPreAggregatedMetricsSheet, getPreAggregatedMetrics } from "@/lib/data-processor";
import type { RawRow, ChartDataPoint } from "@/types";

// Mark this route as dynamic since it depends on query parameters
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

    // Fetch sheet data
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use Google Sheets API via Supabase
    let data: RawRow[] = [];

    try {
      // Fallback: Construct data from sheet fetch endpoint
      const response = await fetch(
        `/api/sheets?sheetId=${sheetId}${sheetName ? `&sheetName=${encodeURIComponent(sheetName)}` : ""}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sheet data");
      }

      const { data: fetchedData } = await response.json();
      data = fetchedData;
    } catch (error) {
      console.error("Error fetching sheet data:", error);
      // Try again with simpler fetch
      try {
        const fallbackResponse = await fetch(
          `/api/sheets?sheetId=${sheetId}${sheetName ? `&sheetName=${encodeURIComponent(sheetName)}` : ""}`
        );

        if (!fallbackResponse.ok) {
          return NextResponse.json(
            { error: "Failed to fetch sheet data" },
            { status: 500 }
          );
        }

        const { data: fetchedData } = await fallbackResponse.json();
        data = fetchedData;
      } catch {
        return NextResponse.json(
          { error: "Failed to fetch sheet data" },
          { status: 500 }
        );
      }
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

    if (!isPreAggregated) {
      return NextResponse.json(
        { error: "This sheet does not appear to contain pre-aggregated metrics" },
        { status: 400 }
      );
    }

    const preAggMetrics = getPreAggregatedMetrics(allColumns);

    // Find matching metric
    const matchingMetric = preAggMetrics.find(
      (m) => m.toLowerCase() === chartName.toLowerCase()
    );

    if (!matchingMetric) {
      return NextResponse.json(
        {
          error: `Chart "${chartName}" not found. Available metrics: ${preAggMetrics.join(", ")}`,
        },
        { status: 404 }
      );
    }

    // Process data to extract time-series
    const processedData = processData(data, mapping);

    // Find the matching chart in time series
    const chart = processedData.timeSeriesCharts.find(
      (c) => c.title.toLowerCase() === chartName.toLowerCase()
    );

    if (!chart) {
      return NextResponse.json(
        { error: `Could not generate chart data for "${chartName}"` },
        { status: 500 }
      );
    }

    // Extract values for metadata
    const values = chart.data
      .map((point) => point[matchingMetric] as number)
      .filter((v) => typeof v === "number" && isFinite(v));

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
