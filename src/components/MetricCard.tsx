"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DashboardMetric } from "@/types";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  metric: DashboardMetric;
  index: number;
}

export default function MetricCard({ metric, index }: MetricCardProps) {
  const isPositive = metric.change > 0;
  const isNeutral = metric.change === 0;

  return (
    <div
      className="bg-white rounded-xl border border-surface-border p-5 hover:shadow-md transition-all duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 75}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">
          {metric.label}
        </span>
        {!isNeutral && (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
              isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
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
        {isNeutral && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-500">
            <Minus className="w-3 h-3" />
          </span>
        )}
      </div>

      <div className="text-2xl font-bold text-gray-900">
        {metric.prefix}
        {metric.value}
        {metric.suffix}
      </div>

      <p className="text-xs text-gray-400 mt-1">{metric.changeLabel}</p>
    </div>
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-surface-border p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="h-4 w-24 skeleton rounded" />
        <div className="h-5 w-14 skeleton rounded-full" />
      </div>
      <div className="h-8 w-32 skeleton rounded mt-1" />
      <div className="h-3 w-20 skeleton rounded mt-3" />
    </div>
  );
}
