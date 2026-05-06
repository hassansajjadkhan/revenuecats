import {
  format,
  parseISO,
  isValid,
  startOfWeek,
  startOfMonth,
  parse,
} from "date-fns";
import type {
  RawRow,
  ProcessedData,
  DashboardMetric,
  ChartDataPoint,
  BreakdownItem,
  SmartMapping,
  DetectedColumn,
  FilterState,
  TimeSeriesChart,
  CategoryBreakdown,
  ColumnType,
} from "@/types";
import { CHART_COLORS, formatCurrency, formatNumber } from "./utils";

// ─── Date Parsing ───────────────────────────────────────────────────────────

const DATE_FORMATS = [
  "yyyy-MM-dd",
  "MM/dd/yyyy",
  "M/d/yyyy",
  "dd/MM/yyyy",
  "d/M/yyyy",
  "MM-dd-yyyy",
  "dd-MM-yyyy",
  "MMM dd, yyyy",
  "MMMM dd, yyyy",
  "MM/dd/yy",
  "M/d/yy",
  "yyyy/MM/dd",
  "dd MMM yyyy",
  "MMM dd yyyy",
  "yyyy.MM.dd",
  "dd.MM.yyyy",
];

export function tryParseDate(value: string): Date | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Try ISO format first
  const iso = parseISO(trimmed);
  if (isValid(iso) && iso.getFullYear() > 1990 && iso.getFullYear() < 2100) return iso;

  for (const fmt of DATE_FORMATS) {
    try {
      const parsed = parse(trimmed, fmt, new Date());
      if (isValid(parsed) && parsed.getFullYear() > 1990 && parsed.getFullYear() < 2100) {
        return parsed;
      }
    } catch {
      continue;
    }
  }

  // Try native Date as last resort
  const native = new Date(trimmed);
  if (isValid(native) && native.getFullYear() > 1990 && native.getFullYear() < 2100) {
    return native;
  }

  return null;
}

function parseNumber(value: string): number {
  if (!value || typeof value !== "string") return 0;
  const cleaned = value.replace(/[$€£¥₹,\s%]/g, "").trim();
  if (!cleaned) return 0;
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function isNumericValue(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  const cleaned = value.replace(/[$€£¥₹,\s%.+-]/g, "").trim();
  if (!cleaned) return false;
  return !isNaN(parseFloat(cleaned));
}

// ─── Smart Column Detection ─────────────────────────────────────────────────

export function detectColumns(data: RawRow[]): SmartMapping {
  if (data.length === 0) {
    return {
      dateColumns: [],
      numericColumns: [],
      categoryColumns: [],
      textColumns: [],
      primaryDate: null,
      primaryNumeric: null,
      primaryCategory: null,
      detected: [],
    };
  }

  const columns = Object.keys(data[0]);
  const sampleSize = Math.min(data.length, 50);
  const sampleData = data.slice(0, sampleSize);

  const detected: DetectedColumn[] = [];

  for (const col of columns) {
    const values = sampleData.map((r) => r[col]).filter((v) => v != null && v.toString().trim() !== "");
    if (values.length === 0) continue;

    const uniqueValues = new Set(values);
    const uniqueCount = uniqueValues.size;

    let dateCount = 0;
    let numericCount = 0;

    for (const val of values) {
      if (tryParseDate(val)) dateCount++;
      if (isNumericValue(val)) numericCount++;
    }

    const dateConfidence = values.length > 0 ? dateCount / values.length : 0;
    const numericConfidence = values.length > 0 ? numericCount / values.length : 0;

    let type: ColumnType;
    if (dateConfidence >= 0.7 && uniqueCount > 3) {
      type = "date";
    } else if (numericConfidence >= 0.7) {
      type = "number";
    } else if (uniqueCount <= Math.max(20, sampleSize * 0.4)) {
      type = "category";
    } else {
      type = "text";
    }

    // Boost with column name hints
    const lower = col.toLowerCase();
    const dateHints = ["date", "time", "day", "month", "year", "created", "updated", "timestamp", "period"];
    const numericHints = [
      "revenue", "amount", "sales", "total", "price", "income", "value", "cost",
      "profit", "quantity", "qty", "count", "units", "rate", "fee", "tax",
      "discount", "balance", "budget", "spend", "earning", "wage", "salary",
      "score", "rating", "number", "num", "sum", "avg", "average", "percent",
      "growth", "mrr", "arr", "ltv", "cac", "arpu",
    ];
    const categoryHints = [
      "category", "type", "product", "plan", "tier", "segment", "source",
      "channel", "status", "region", "country", "city", "state", "department",
      "team", "group", "class", "level", "brand", "vendor", "platform",
      "gender", "age_group", "industry",
    ];

    if (type !== "date" && dateHints.some((h) => lower.includes(h)) && dateConfidence > 0.3) {
      type = "date";
    }
    if (type !== "number" && numericHints.some((h) => lower.includes(h)) && numericConfidence > 0.3) {
      type = "number";
    }
    if (type !== "category" && type !== "date" && type !== "number" && categoryHints.some((h) => lower.includes(h))) {
      type = "category";
    }

    const confidence =
      type === "date" ? dateConfidence
        : type === "number" ? numericConfidence
          : type === "category" ? Math.min(1, 1 - uniqueCount / sampleSize)
            : 0.5;

    detected.push({
      name: col,
      type,
      confidence,
      uniqueCount,
      samples: Array.from(uniqueValues).slice(0, 5),
    });
  }

  const dateColumns = detected.filter((c) => c.type === "date").map((c) => c.name);
  const numericColumns = detected.filter((c) => c.type === "number").map((c) => c.name);
  const categoryColumns = detected.filter((c) => c.type === "category").map((c) => c.name);
  const textColumns = detected.filter((c) => c.type === "text").map((c) => c.name);

  // Pick best primary columns
  const primaryDate = dateColumns.length > 0
    ? dateColumns.sort((a, b) => {
        const da = detected.find((d) => d.name === a)!;
        const db = detected.find((d) => d.name === b)!;
        return db.confidence - da.confidence;
      })[0]
    : null;

  const primaryNumeric = numericColumns.length > 0
    ? numericColumns.sort((a, b) => {
        const da = detected.find((d) => d.name === a)!;
        const db = detected.find((d) => d.name === b)!;
        return db.confidence - da.confidence || db.uniqueCount - da.uniqueCount;
      })[0]
    : null;

  const primaryCategory = categoryColumns.length > 0
    ? categoryColumns.sort((a, b) => {
        const da = detected.find((d) => d.name === a)!;
        const db = detected.find((d) => d.name === b)!;
        const scoreA = da.uniqueCount >= 2 && da.uniqueCount <= 15 ? 1 : 0;
        const scoreB = db.uniqueCount >= 2 && db.uniqueCount <= 15 ? 1 : 0;
        return scoreB - scoreA || da.uniqueCount - db.uniqueCount;
      })[0]
    : null;

  return {
    dateColumns,
    numericColumns,
    categoryColumns,
    textColumns,
    primaryDate,
    primaryNumeric,
    primaryCategory,
    detected,
  };
}

// ─── Data Processing ────────────────────────────────────────────────────────

function safeDateLabel(dateKey: string, groupBy: string): string {
  if (groupBy === "month") return dateKey;
  try {
    return format(parseISO(dateKey), "MMM dd");
  } catch {
    return dateKey;
  }
}

// ─── Pre-Aggregated Metrics Detection ───────────────────────────────────────

const PRE_AGGREGATED_METRIC_PATTERNS = [
  // Revenue metrics
  "arr", "mrr", "revenue", "cumulative", "non-subscription", "purchase", "income",
  // Subscription & user metrics
  "subscription", "active", "new", "paid", "retention", "movement", "users", "count",
  // Customer metrics
  "customer", "ltv", "realized", "cohort", "lifetime",
  // Risk metrics
  "churn", "refund", "cancel", "monthly",
  // Trial & funnel metrics
  "trial", "conversion", "initial", "rate", "recovery",
  // Other metrics
  "status", "survey", "response", "value", "average", "total", "sum", "percent", "growth"
];

export function isPreAggregatedMetricsSheet(columns: string[]): boolean {
  const lowerColumns = columns.map(c => c.toLowerCase());
  
  // Check if has a date column
  const hasDate = lowerColumns.some(c => c.includes("date") || c.includes("period"));
  if (!hasDate) return false;
  
  // Count numeric-looking columns (anything that's not an obvious ID/key column)
  const numericCount = columns.filter(col => {
    const lower = col.toLowerCase();
    // Exclude obvious ID/key columns
    if (lower.includes("id") || lower.includes("key") || lower.includes("email")) {
      return false;
    }
    // Exclude the date column itself
    if (lower.includes("date") || lower.includes("period")) {
      return false;
    }
    // Everything else is a potential metric column
    return true;
  }).length;
  
  // If we have date + at least 1 other column, it's likely pre-aggregated
  return hasDate && numericCount >= 1;
}

export function getPreAggregatedMetrics(columns: string[]): string[] {
  return columns.filter(col => {
    const lower = col.toLowerCase();
    // Exclude date columns
    if (lower.includes("date") || lower.includes("period")) {
      return false;
    }
    // Exclude obvious ID/key columns
    if (lower.includes("id") || lower.includes("key") || lower.includes("email")) {
      return false;
    }
    // Everything else is a metric
    return true;
  });
}

export function processData(
  rawData: RawRow[],
  mapping: SmartMapping,
  filters?: FilterState
): ProcessedData {
  const { primaryDate, primaryNumeric, primaryCategory, numericColumns, categoryColumns } = mapping;

  // === FILTER ===
  let filtered = [...rawData];

  if (primaryDate && filters?.dateRange.start) {
    const start = parseISO(filters.dateRange.start);
    if (isValid(start)) {
      filtered = filtered.filter((row) => {
        const d = tryParseDate(row[primaryDate]);
        return d ? d >= start : true;
      });
    }
  }
  if (primaryDate && filters?.dateRange.end) {
    const end = parseISO(filters.dateRange.end);
    if (isValid(end)) {
      filtered = filtered.filter((row) => {
        const d = tryParseDate(row[primaryDate]);
        return d ? d <= end : true;
      });
    }
  }
  if (primaryCategory && filters?.category && filters.category !== "all") {
    filtered = filtered.filter((row) => row[primaryCategory] === filters.category);
  }

  // Sort by date if available
  if (primaryDate) {
    filtered.sort((a, b) => {
      const da = tryParseDate(a[primaryDate]);
      const db = tryParseDate(b[primaryDate]);
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.getTime() - db.getTime();
    });
  }

  const groupBy = filters?.groupBy || "day";

  // === TIME SERIES CHARTS ===
  const timeSeriesCharts: TimeSeriesChart[] = [];

  // Check if this is a pre-aggregated metrics sheet
  const allColumns = Object.keys(filtered[0] || {});
  const isPreAggregated = isPreAggregatedMetricsSheet(allColumns);
  const preAggMetrics = isPreAggregated ? getPreAggregatedMetrics(allColumns) : [];

  if (isPreAggregated && primaryDate && preAggMetrics.length > 0) {
    // Handle pre-aggregated metrics directly as time-series data
    for (const metricCol of preAggMetrics.slice(0, 10)) {
      const chartData: ChartDataPoint[] = filtered
        .filter(row => tryParseDate(row[primaryDate]))
        .map(row => {
          const dateVal = tryParseDate(row[primaryDate]);
          const dateStr = dateVal ? format(dateVal, "yyyy-MM-dd") : "";
          return {
            date: safeDateLabel(dateStr, "day"),
            [metricCol]: parseNumber(row[metricCol]),
            raw_date: dateStr,
          };
        })
        .filter(point => point.raw_date); // Remove entries with invalid dates

      if (chartData.length > 0) {
        timeSeriesCharts.push({
          title: metricCol,
          dateKey: "date",
          series: [{
            key: metricCol,
            label: metricCol,
            color: CHART_COLORS[timeSeriesCharts.length % CHART_COLORS.length],
          }],
          data: chartData,
        });
      }
    }
  } else if (primaryDate && numericColumns.length > 0) {
    // Handle transaction-level data (original logic)
    for (const numCol of numericColumns.slice(0, 4)) {
      const aggregated = new Map<string, number>();
      const countByDate = new Map<string, number>();

      for (const row of filtered) {
        const date = tryParseDate(row[primaryDate]);
        if (!date) continue;

        let key: string;
        if (groupBy === "week") key = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
        else if (groupBy === "month") key = format(startOfMonth(date), "yyyy-MM");
        else key = format(date, "yyyy-MM-dd");

        aggregated.set(key, (aggregated.get(key) || 0) + parseNumber(row[numCol]));
        countByDate.set(key, (countByDate.get(key) || 0) + 1);
      }

      const chartData: ChartDataPoint[] = Array.from(aggregated.entries()).map(([dk, value]) => ({
        date: safeDateLabel(dk, groupBy),
        [numCol]: Math.round(value * 100) / 100,
        count: countByDate.get(dk) || 0,
      }));

      if (chartData.length > 0) {
        timeSeriesCharts.push({
          title: `${numCol} Over Time`,
          dateKey: "date",
          series: [{
            key: numCol,
            label: numCol,
            color: CHART_COLORS[timeSeriesCharts.length % CHART_COLORS.length],
          }],
          data: chartData,
        });
      }
    }

    // Row volume over time
    const countByPeriod = new Map<string, number>();
    for (const row of filtered) {
      const date = tryParseDate(row[primaryDate]);
      if (!date) continue;
      let key: string;
      if (groupBy === "week") key = format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd");
      else if (groupBy === "month") key = format(startOfMonth(date), "yyyy-MM");
      else key = format(date, "yyyy-MM-dd");
      countByPeriod.set(key, (countByPeriod.get(key) || 0) + 1);
    }

    const volumeData: ChartDataPoint[] = Array.from(countByPeriod.entries()).map(([dk, count]) => ({
      date: safeDateLabel(dk, groupBy),
      count,
    }));

    if (volumeData.length > 0) {
      timeSeriesCharts.push({
        title: "Row Volume Over Time",
        dateKey: "date",
        series: [{ key: "count", label: "Count", color: "#06b6d4" }],
        data: volumeData,
      });
    }
  }

  // No date column: if there are categories + numbers, make a chart per category row
  if (!primaryDate && numericColumns.length > 0 && categoryColumns.length > 0) {
    const catCol = primaryCategory || categoryColumns[0];
    for (const numCol of numericColumns.slice(0, 3)) {
      const chartData: ChartDataPoint[] = [];
      const catMap = new Map<string, number>();
      for (const row of filtered) {
        const cat = row[catCol] || "Unknown";
        catMap.set(cat, (catMap.get(cat) || 0) + parseNumber(row[numCol]));
      }
      for (const [cat, val] of Array.from(catMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 15)) {
        chartData.push({ label: cat, [numCol]: Math.round(val * 100) / 100 });
      }
      if (chartData.length > 0) {
        timeSeriesCharts.push({
          title: `${numCol} by ${catCol}`,
          dateKey: "label",
          series: [{ key: numCol, label: numCol, color: CHART_COLORS[timeSeriesCharts.length % CHART_COLORS.length] }],
          data: chartData,
        });
      }
    }
  }

  // === CATEGORY BREAKDOWNS ===
  const categoryBreakdowns: CategoryBreakdown[] = [];

  for (const catCol of categoryColumns.slice(0, 3)) {
    const targetNumCol = primaryNumeric || null;
    const totals = new Map<string, number>();

    for (const row of filtered) {
      const cat = row[catCol] || "Unknown";
      if (targetNumCol) {
        totals.set(cat, (totals.get(cat) || 0) + parseNumber(row[targetNumCol]));
      } else {
        totals.set(cat, (totals.get(cat) || 0) + 1);
      }
    }

    const grand = Array.from(totals.values()).reduce((a, b) => a + b, 0);
    const items: BreakdownItem[] = Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value], i) => ({
        name,
        value: Math.round(value * 100) / 100,
        percentage: grand > 0 ? Math.round((value / grand) * 1000) / 10 : 0,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));

    if (items.length > 0) {
      categoryBreakdowns.push({
        title: targetNumCol ? `${targetNumCol} by ${catCol}` : `Count by ${catCol}`,
        categoryKey: catCol,
        numericKey: targetNumCol || "count",
        items,
      });
    }
  }

  // === NUMERIC COMPARISON ===
  const numericComparisons: ChartDataPoint[] = [];
  if (numericColumns.length >= 2 && !primaryDate) {
    const totals: ChartDataPoint = { label: "Total" };
    for (const numCol of numericColumns) {
      let sum = 0;
      for (const row of filtered) sum += parseNumber(row[numCol]);
      totals[numCol] = Math.round(sum * 100) / 100;
    }
    numericComparisons.push(totals);
  }

  // === GROWTH ===
  const growthData: ChartDataPoint[] = [];
  if (primaryDate && primaryNumeric && timeSeriesCharts.length > 0) {
    const first = timeSeriesCharts[0];
    let cumulative = 0;
    for (const point of first.data) {
      const val = (point[first.series[0].key] as number) || 0;
      cumulative += val;
      growthData.push({
        date: point.date,
        cumulative: Math.round(cumulative * 100) / 100,
        [first.series[0].key]: val,
      });
    }
  }

  // === METRICS ===
  const metrics: DashboardMetric[] = [];

  metrics.push({
    label: "Total Records",
    value: formatNumber(filtered.length),
    change: 0,
    changeLabel: `of ${rawData.length} total`,
  });

  for (const numCol of numericColumns.slice(0, 4)) {
    const values = filtered.map((r) => parseNumber(r[numCol])).filter((v) => v !== 0);
    const total = values.reduce((a, b) => a + b, 0);

    const mid = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, mid).reduce((a, b) => a + b, 0);
    const secondHalf = values.slice(mid).reduce((a, b) => a + b, 0);
    const change = firstHalf > 0 ? ((secondHalf - firstHalf) / firstHalf) * 100 : 0;

    const sampleValue = filtered.find((r) => r[numCol])?.[numCol] || "";
    const isCurrency = /[$€£¥₹]/.test(sampleValue);

    metrics.push({
      label: `Total ${numCol}`,
      value: isCurrency ? formatCurrency(total) : formatNumber(Math.round(total * 100) / 100),
      change: Math.round(change * 10) / 10,
      changeLabel: "vs previous period",
    });
  }

  for (const catCol of categoryColumns.slice(0, 2)) {
    const unique = new Set(filtered.map((r) => r[catCol]).filter(Boolean));
    metrics.push({
      label: `Unique ${catCol}`,
      value: formatNumber(unique.size),
      change: 0,
      changeLabel: "distinct values",
    });
  }

  return {
    metrics: metrics.slice(0, 6),
    timeSeriesCharts,
    categoryBreakdowns,
    numericComparisons,
    growthData,
    rawData: filtered,
    columns: Object.keys(rawData[0] || {}),
    mapping,
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getUniqueCategories(data: RawRow[], categoryCol: string | null): string[] {
  if (!categoryCol) return [];
  const set = new Set<string>();
  for (const row of data) {
    const val = row[categoryCol];
    if (val) set.add(val);
  }
  return Array.from(set).sort();
}
