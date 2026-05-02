"use client";

import {
  Info,
  Timer,
  CalendarDays,
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

function getMetricIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("trial")) return Timer;
  if (l.includes("subscription")) return CalendarDays;
  if (l.includes("mrr") || l.includes("arr") || l.includes("recurring")) return RefreshCw;
  if (l.includes("revenue") || l.includes("purchase")) return DollarSign;
  if (l.includes("new") && l.includes("customer")) return UserPlus;
  if (l.includes("customer")) return User;
  return BarChart3;
}

function getSparkColor(label: string, change: number): string {
  const l = label.toLowerCase();
  if (l.includes("trial")) return "#fb923c";
  if (l.includes("customer") && l.includes("new")) return "#4f73ff";
  if (change < 0) return "#fbbf24";
  return "#00e5a8";
}

function getPoints(label: string, change: number): string {
  const l = label.toLowerCase();

  if (l.includes("trial")) {
    return "0,50 14,50 20,50 26,42 46,42 64,42 72,36 92,36 104,30 114,42 126,44 138,28 150,24";
  }

  if (l.includes("subscription")) {
    return "0,38 6,50 18,50 22,38 34,38 40,24 110,24 116,38 126,38 132,24 150,24";
  }

  if (l.includes("mrr") || l.includes("recurring")) {
    return "0,38 8,50 18,50 24,38 34,38 40,30 112,30 120,42 130,42 136,24 150,24";
  }

  if (l.includes("revenue")) {
    return "0,50 18,50 22,48 32,50 38,42 44,50 56,48 68,50 84,50 96,48 112,50 120,26 128,50 138,50 146,26 150,50";
  }

  if (l.includes("new") && l.includes("customer")) {
    return "0,44 10,42 16,34 22,42 30,38 38,38 46,34 54,38 62,26 70,32 78,32 86,34 94,32 102,24 110,28 120,27 132,30 144,28 150,34";
  }

  if (l.includes("active") && l.includes("customer")) {
    return "0,50 150,50";
  }

  return change >= 0
    ? "0,44 12,42 24,38 36,35 48,33 60,36 72,30 84,24 96,20 108,18 120,14 132,10 150,7"
    : "0,8 12,10 24,15 36,12 48,20 60,23 72,18 84,26 96,30 108,34 120,36 132,38 150,42";
}

function Sparkline({ label, change, id }: { label: string; change: number; id: string }) {
  const color = getSparkColor(label, change);
  const pts = getPoints(label, change);

  const gradId = `sg-${id}`;

  return (
    <div className="-mx-3 sm:-mx-4 mt-2.5">
      <svg
        width="100%"
        height="40"
        viewBox="0 0 150 56"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon fill={`url(#${gradId})`} points={`${pts} 150,56 0,56`} />
        <polyline fill="none" stroke={color} strokeWidth="1.8" points={pts} />
      </svg>
    </div>
  );
}

export default function MetricCard({ metric, index }: MetricCardProps) {
  const Icon = getMetricIcon(metric.label);

  return (
    <div
      className="relative bg-rc-card rounded-xl border border-[#3a4150] px-3 sm:px-4 pt-3 sm:pt-3.5 pb-0 min-h-[140px] hover:border-[#4a5364] transition-all duration-200 animate-fade-in overflow-hidden"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-white/90 tracking-tight">
          {metric.label}
        </span>
        <Icon className="w-4 h-4 text-white/75 flex-shrink-0" strokeWidth={1.8} />
      </div>

      <div className="mt-2.5 text-3xl sm:text-4xl font-bold text-white leading-[1] tracking-[-0.02em]">
        {metric.prefix}{metric.value}{metric.suffix}
      </div>

      <div className="flex items-center gap-1 mt-1.5 mb-0">
        <span className="text-xs text-white/70 leading-none">{metric.changeLabel}</span>
        <Info className="w-3.5 h-3.5 text-white/60 cursor-help flex-shrink-0" strokeWidth={2} />
      </div>

      <Sparkline label={metric.label} change={metric.change} id={`${index}`} />
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-rc-card rounded-xl border border-[#3a4150] px-4 pt-3.5 pb-0 min-h-[140px]">
      <div className="flex items-start justify-between mb-2">
        <div className="h-3.5 w-24 skeleton rounded" />
        <div className="h-4 w-4 skeleton rounded" />
      </div>
      <div className="h-8 w-32 skeleton rounded mt-2" />
      <div className="h-3 w-20 skeleton rounded mt-1.5 mb-2.5" />
      <div className="h-10 skeleton rounded-b" />
    </div>
  );
}
