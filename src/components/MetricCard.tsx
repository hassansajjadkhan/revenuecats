"use client";

import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import type { DashboardMetric } from "@/types";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  metric: DashboardMetric;
  index: number;
}

// Simple SVG sparkline
function Sparkline({ positive, color }: { positive: boolean; color: string }) {
  const points = positive
    ? "0,40 15,38 30,35 45,30 60,32 75,28 90,20 105,22 120,15 135,10 150,8"
    : "0,10 15,12 30,18 45,15 60,22 75,25 90,20 105,28 120,32 135,35 150,38";

  return (
    <div className="sparkline-container">
      <svg width="100%" height="50" viewBox="0 0 150 50" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
        />
        <polygon
          fill={`url(#spark-${color.replace('#', '')})`}
          points={`${points} 150,50 0,50`}
        />
      </svg>
    </div>
  );
}

const cardIcons = ["📌", "📅", "🔄", "$"];

export default function MetricCard({ metric, index }: MetricCardProps) {
  const isPositive = metric.change > 0;
  const isNeutral = metric.change === 0;
  const sparkColor = isPositive ? "#34d399" : isNeutral ? "#22d3ee" : "#fbbf24";

  return (
    <div
      className="relative bg-rc-card rounded-xl border border-rc-border p-3 sm:p-5 hover:border-rc-borderLight transition-all duration-200 animate-fade-in overflow-hidden"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-sm font-medium text-rc-textMuted">
          {metric.label}
        </span>
        <div className="flex items-center gap-1">
          {!isNeutral && (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 text-xs font-medium",
                isPositive ? "text-rc-green" : "text-rc-orange"
              )}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {Math.abs(metric.change)}%
            </span>
          )}
          <Info className="w-3.5 h-3.5 text-rc-textDim cursor-help" />
        </div>
      </div>

      <div className="text-3xl font-bold text-white mb-0.5">
        {metric.prefix}
        {metric.value}
        {metric.suffix}
      </div>

      <p className="text-xs text-rc-textDim">{metric.changeLabel}</p>

      <Sparkline positive={isPositive || isNeutral} color={sparkColor} />
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-rc-card rounded-xl border border-rc-border p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="h-4 w-24 skeleton rounded" />
        <div className="h-4 w-10 skeleton rounded" />
      </div>
      <div className="h-9 w-32 skeleton rounded mt-1" />
      <div className="h-3 w-20 skeleton rounded mt-3" />
    </div>
  );
}
