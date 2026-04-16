"use client";

import { RefreshCw, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  lastUpdated?: string;
}

export default function Header({
  title,
  subtitle,
  onRefresh,
  isLoading,
  lastUpdated,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 lg:px-8 h-16 bg-white border-b border-surface-border sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {lastUpdated && (
          <span className="text-xs text-gray-400 hidden sm:block">
            Updated {lastUpdated}
          </span>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              "border border-gray-200",
              isLoading && "opacity-60 cursor-not-allowed"
            )}
          >
            <RefreshCw
              className={cn("w-4 h-4", isLoading && "animate-spin")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
