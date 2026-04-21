"use client";

import { Info } from "lucide-react";
import type { CategoryBreakdown } from "@/types";

interface FlexBreakdownProps {
  breakdown: CategoryBreakdown;
}

// Simple SVG sparkline
function Sparkline({ color }: { color: string }) {
  const points = "0,40 15,38 30,35 45,30 60,32 75,28 90,20 105,22 120,15 135,10 150,8";

  return (
    <div className="sparkline-container">
      <svg width="100%" height="50" viewBox="0 0 150 50" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`spark-breakdown-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
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
          fill={`url(#spark-breakdown-${color.replace('#', '')})`}
          points={`${points} 150,50 0,50`}
        />
      </svg>
    </div>
  );
}

export default function FlexBreakdown({ breakdown }: FlexBreakdownProps) {
  const { title, items } = breakdown;
  const topItem = items[0];
  const sparkColor = topItem?.color || "#34d399";

  return (
    <div className="relative bg-rc-card rounded-xl border border-rc-border p-3 sm:p-5 hover:border-rc-borderLight transition-all duration-200 animate-fade-in overflow-hidden">
      <div className="flex items-start justify-between mb-1">
        <span className="text-sm font-medium text-rc-textMuted">
          {title}
        </span>
        <Info className="w-3.5 h-3.5 text-rc-textDim cursor-help" />
      </div>

      <div className="text-3xl font-bold text-white mb-0.5">
        {topItem?.name || "N/A"}
      </div>

      <p className="text-xs text-rc-textDim">
        {topItem ? `${topItem.percentage}% of total` : "No data"}
      </p>

      <Sparkline color={sparkColor} />
    </div>
  );
}
