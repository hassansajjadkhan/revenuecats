"use client";

import { Info } from "lucide-react";
import type { CategoryBreakdown } from "@/types";

interface FlexBreakdownProps {
  breakdown: CategoryBreakdown;
}

export default function FlexBreakdown({ breakdown }: FlexBreakdownProps) {
  const { title, items } = breakdown;
  const topItem = items[0];
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);

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

      <p className="text-xs text-rc-textDim mb-3">
        {topItem ? `${topItem.percentage}% of total` : "No data"}
      </p>

      {/* Simple bar visualization */}
      <div className="space-y-1.5">
        {items.slice(0, 3).map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-shrink-0 w-12">
              <span className="text-xs text-rc-textMuted truncate">{item.name}</span>
            </div>
            <div className="flex-1 h-1.5 bg-rc-surface rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
            <span className="text-xs text-rc-textDim w-8 text-right">{item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
