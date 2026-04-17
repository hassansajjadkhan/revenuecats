"use client";

import { Calendar, ChevronDown } from "lucide-react";
import type { FilterState } from "@/types";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: string[];
}

export default function FilterBar({
  filters,
  onFilterChange,
  categories,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 animate-fade-in">
      {/* Date Range */}
      <div className="flex items-center gap-2 bg-rc-card border border-rc-border rounded-lg px-3 py-2">
        <Calendar className="w-4 h-4 text-rc-textDim" />
        <input
          type="date"
          value={filters.dateRange.start}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              dateRange: { ...filters.dateRange, start: e.target.value },
            })
          }
          className="text-sm text-rc-text bg-transparent outline-none w-[120px]"
        />
        <span className="text-rc-textDim">—</span>
        <input
          type="date"
          value={filters.dateRange.end}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              dateRange: { ...filters.dateRange, end: e.target.value },
            })
          }
          className="text-sm text-rc-text bg-transparent outline-none w-[120px]"
        />
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="relative">
          <select
            value={filters.category}
            onChange={(e) =>
              onFilterChange({ ...filters, category: e.target.value })
            }
            className="appearance-none bg-rc-card border border-rc-border rounded-lg px-3 py-2 pr-8 text-sm text-rc-text outline-none cursor-pointer hover:border-rc-borderLight focus:border-rc-accent focus:ring-1 focus:ring-rc-accent"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-rc-textDim absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      )}

      {/* Group By */}
      <div className="flex items-center bg-rc-card border border-rc-border rounded-lg overflow-hidden">
        {(["day", "week", "month"] as const).map((period) => (
          <button
            key={period}
            onClick={() => onFilterChange({ ...filters, groupBy: period })}
            className={`px-3 py-2 text-sm font-medium transition-all ${
              filters.groupBy === period
                ? "bg-rc-accent text-white"
                : "text-rc-textMuted hover:text-white hover:bg-rc-surface"
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
