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
      <div className="flex items-center gap-2 bg-white border border-surface-border rounded-lg px-3 py-2">
        <Calendar className="w-4 h-4 text-gray-400" />
        <input
          type="date"
          value={filters.dateRange.start}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              dateRange: { ...filters.dateRange, start: e.target.value },
            })
          }
          className="text-sm text-gray-700 bg-transparent outline-none w-[120px]"
        />
        <span className="text-gray-300">—</span>
        <input
          type="date"
          value={filters.dateRange.end}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              dateRange: { ...filters.dateRange, end: e.target.value },
            })
          }
          className="text-sm text-gray-700 bg-transparent outline-none w-[120px]"
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
            className="appearance-none bg-white border border-surface-border rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 outline-none cursor-pointer hover:border-gray-300 focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      )}

      {/* Group By */}
      <div className="flex items-center bg-white border border-surface-border rounded-lg overflow-hidden">
        {(["day", "week", "month"] as const).map((period) => (
          <button
            key={period}
            onClick={() => onFilterChange({ ...filters, groupBy: period })}
            className={`px-3 py-2 text-sm font-medium transition-all ${
              filters.groupBy === period
                ? "bg-brand-500 text-white"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
