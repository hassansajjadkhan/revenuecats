"use client";

import { RefreshCw, Search, HelpCircle, User } from "lucide-react";
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
    <header className="flex items-center justify-between px-6 lg:px-8 h-14 bg-rc-bg border-b border-rc-border sticky top-0 z-30">
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && (
          <p className="text-xs text-rc-textMuted mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {lastUpdated && (
          <span className="text-xs text-rc-textDim hidden sm:block">
            Updated {lastUpdated}
          </span>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              "bg-rc-surface text-rc-textMuted hover:text-white",
              "border border-rc-border",
              isLoading && "opacity-60 cursor-not-allowed"
            )}
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", isLoading && "animate-spin")}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rc-surface border border-rc-border text-rc-textMuted text-sm cursor-pointer hover:border-rc-borderLight transition-all">
          <Search className="w-3.5 h-3.5" />
          <span className="hidden sm:inline ml-1">Search...</span>
          <kbd className="hidden sm:inline-flex ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-rc-bg rounded border border-rc-border">Ctrl+K</kbd>
        </div>

        <button className="p-2 rounded-lg text-rc-textMuted hover:text-white hover:bg-rc-surface transition-all">
          <HelpCircle className="w-4 h-4" />
        </button>

        <button className="p-2 rounded-lg text-rc-textMuted hover:text-white hover:bg-rc-surface transition-all">
          <User className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
