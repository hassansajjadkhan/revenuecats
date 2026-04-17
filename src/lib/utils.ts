export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercentage(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const CHART_COLORS = [
  "#00d2a0",
  "#6c5ce7",
  "#0abde3",
  "#ff9f43",
  "#ff6b6b",
  "#a29bfe",
  "#55efc4",
  "#fd79a8",
  "#74b9ff",
  "#ffeaa7",
];

export function extractSheetId(input: string): string {
  // Handle full URL
  const urlMatch = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (urlMatch) return urlMatch[1];

  // Handle direct ID
  if (/^[a-zA-Z0-9-_]+$/.test(input.trim())) return input.trim();

  return input.trim();
}
