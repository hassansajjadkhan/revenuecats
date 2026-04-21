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
    <header className="flex items-center justify-between px-4 sm:px-6 lg:px-7 h-12 bg-[#0f1218]/95 border-b border-rc-border sticky top-0 z-30 backdrop-blur">
      <div className="pl-10 lg:pl-0">
        <h1 className="text-[14px] leading-none font-medium text-white tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-[11px] text-rc-textMuted mt-1 hidden xl:block">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {lastUpdated && (
          <span className="text-[11px] text-rc-textDim hidden xl:block">
            Updated {lastUpdated}
          </span>
        )}

        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={cn(
              "hidden sm:flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all",
              "bg-[#181c25] text-rc-textMuted hover:text-white",
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

        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#11141b] border border-rc-border text-[#8892a4] text-[12px] cursor-pointer hover:border-rc-borderLight transition-colors min-w-[190px]">
          <Search className="w-3.5 h-3.5" />
          <span className="inline ml-1">Search...</span>
          <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-mono bg-[#0c0f14] rounded border border-rc-border">Ctrl+K</kbd>
        </div>

        <button className="p-1.5 rounded-md text-rc-textMuted hover:text-white hover:bg-[#181c25] transition-colors md:hidden">
          <Search className="w-4 h-4" />
        </button>

        <button className="hidden sm:flex items-center gap-1 p-1.5 rounded-md text-rc-textMuted hover:text-white hover:bg-[#181c25] transition-colors text-[12px]">
          <HelpCircle className="w-4 h-4" />
          <span className="hidden lg:inline">Help</span>
        </button>

        <button className="flex items-center gap-1 p-1.5 rounded-md text-rc-textMuted hover:text-white hover:bg-[#181c25] transition-colors text-[12px]">
          <User className="w-4 h-4" />
          <span className="hidden lg:inline">Account</span>
        </button>
      </div>
    </header>
  );
}
