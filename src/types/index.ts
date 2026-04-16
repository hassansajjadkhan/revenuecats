export interface SheetConfig {
  sheetId: string;
  sheetName?: string;
  apiKey?: string;
}

export interface RawRow {
  [key: string]: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
  prefix?: string;
  suffix?: string;
}

export interface ChartDataPoint {
  date?: string;
  label?: string;
  [key: string]: string | number | undefined;
}

export interface BreakdownItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface FilterState {
  dateRange: {
    start: string;
    end: string;
  };
  category: string;
  groupBy: "day" | "week" | "month";
}

export type ColumnType = "date" | "number" | "category" | "text";

export interface DetectedColumn {
  name: string;
  type: ColumnType;
  /** % of rows that matched this type (0-1) */
  confidence: number;
  /** Number of unique values */
  uniqueCount: number;
  /** Sample values */
  samples: string[];
}

export interface SmartMapping {
  dateColumns: string[];
  numericColumns: string[];
  categoryColumns: string[];
  textColumns: string[];
  /** Best guess primary date column */
  primaryDate: string | null;
  /** Best guess primary numeric column */
  primaryNumeric: string | null;
  /** Best guess primary category column */
  primaryCategory: string | null;
  /** All detected column info */
  detected: DetectedColumn[];
}

export interface ProcessedData {
  metrics: DashboardMetric[];
  timeSeriesCharts: TimeSeriesChart[];
  categoryBreakdowns: CategoryBreakdown[];
  numericComparisons: ChartDataPoint[];
  growthData: ChartDataPoint[];
  rawData: RawRow[];
  columns: string[];
  mapping: SmartMapping;
}

export interface TimeSeriesChart {
  title: string;
  dateKey: string;
  series: { key: string; label: string; color: string }[];
  data: ChartDataPoint[];
}

export interface CategoryBreakdown {
  title: string;
  categoryKey: string;
  numericKey: string;
  items: BreakdownItem[];
}

// Keep legacy for backward compat
export interface ColumnMapping {
  date: string;
  revenue: string;
  category: string;
  quantity?: string;
  customer?: string;
}
