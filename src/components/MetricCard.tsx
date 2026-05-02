"use client";

import {
  Info,
  Timer,
  CalendarCheck,
  RefreshCw,
  DollarSign,
  UserPlus,
  User,
  BarChart3,
} from "lucide-react";
import type { DashboardMetric } from "@/types";

interface MetricCardProps {
  metric: DashboardMetric;
  index: number;
}

// Pick an icon based on the metric label
function getMetricIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("trial")) return Timer;
  if (l.includes("subscription")) return CalendarCheck;
  if (l.includes("mrr") || l.includes("arr") || l.includes("recurring")) return RefreshCw;
  if (l.includes("revenue") || l.includes("purchase")) return DollarSign;
  if (l.includes("new") && l.includes("customer")) return UserPlus;
  if (l.includes("customer")) return User;
  return BarChart3;
}

// Pick sparkline colour based on label/change
function getSparkColor(label: string, change: number): string {
  const l = label.toLowerCase();
  if (l.includes("trial")) return "#fb923c";          // orange
  if (l.includes("customer") && l.includes("new")) return "#818cf8"; // indigo/blue
  if (change < 0) return "#fbbf24";                   // amber for negative
  return "#34d399";                                    // green default
}

function Sparkline({ label, change, id }: { label: string; change: number; id: string }) {
  const color = getSparkColor(label, change);
  const positive = change >= 0;

  // Two different curve shapes
  const upPoints   = "0,44 12,42 24,38 36,35 48,33 60,36 72,30 84,24 96,20 108,18 120,14 132,10 150,7";
  const downPoints = "0,8  12,10 24,15 36,12 48,20 60,23 72,18 84,26 96,30 108,34 120,36 132,38 150,42";
  // spiky variant for revenue-like
  const spikyPoints = "0,38 15,36 30,40 40,28 50,34 60,20 70,32 80,14 95,30 110,36 125,30 138,20 150,24";

  const l = label.toLowerCase();
  const pts = l.includes("revenue") || l.includes("purchase")
    ? spikyPoints
    : positive ? upPoints : downPoints;

  const gradId = `sg-${id}`;

  return (
    <div className="-mx-4 sm:-mx-5 mt-4">
      <svg
        width="100%"
        height="52"
        viewBox="0 0 150 52"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill={`url(#${gradId})`} points={`${pts} 150,52 0,52`} />
        <polyline fill="none" stroke={color} strokeWidth="1.8" points={pts} />
      </svg>
    </div>
  );
}

export default function MetricCard({ metric, index }: MetricCardProps) {
  const Icon = getMetricIcon(metric.label);

  return (
    <div
      className="relative bg-rc-card rounded-xl border border-rc-border px-4 sm:px-5 pt-4 sm:pt-5 pb-0 hover:border-rc-borderLight transition-all duration-200 animate-fade-in overflow-hidden"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between">
        <span className="text-[13px] font-semibold text-white tracking-tight">
          {metric.label}
        </span>
        <Icon className="w-4 h-4 text-[#6f7788] flex-shrink-0 mt-0.5" />
      </div>

      {/* Value */}
      <div className="mt-3 text-[2.25rem] font-bold text-white leading-none tracking-tight">
        {metric.prefix}{metric.value}{metric.suffix}
      </div>

      {/* Sub-label */}
      <div className="flex items-center gap-1 mt-1.5 mb-0">
        <span className="text-[12px] text-[#8892a4]">{metric.changeLabel}</span>
        <Info className="w-3 h-3 text-[#6f7788] cursor-help flex-shrink-0" />
      </div>

      {/* Edge-to-edge sparkline */}
      <Sparkline label={metric.label} change={metric.change} id={`${index}`} />
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-rc-card rounded-xl border border-rc-border px-5 pt-5 pb-0">
      <div className="flex items-start justify-between mb-3">
        <div className="h-4 w-28 skeleton rounded" />
        <div className="h-4 w-4 skeleton rounded" />
      </div>
      <div className="h-10 w-36 skeleton rounded mt-1" />
      <div className="h-3 w-24 skeleton rounded mt-3 mb-4" />
      <div className="h-12 skeleton rounded-b" />
    </div>
  );
}
