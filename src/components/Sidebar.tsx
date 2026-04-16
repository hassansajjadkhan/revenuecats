"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Settings,
  LayoutDashboard,
  Link2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Growth", href: "/dashboard/growth", icon: TrendingUp },
  { label: "Data Source", href: "/settings", icon: Database },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile overlay */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar-bg transition-all duration-300 flex flex-col",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <span className="text-white font-semibold text-lg tracking-tight">
              Analytics
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/25"
                    : "text-sidebar-text hover:text-white hover:bg-sidebar-hover"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Connect Sheet Quick Link */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-3 rounded-lg bg-white/5 text-sidebar-text hover:bg-white/10 hover:text-white transition-all text-sm"
            >
              <Link2 className="w-4 h-4" />
              <span>Connect Google Sheet</span>
            </Link>
          </div>
        )}

        {/* Collapse button */}
        <div className="border-t border-white/10 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-2 rounded-lg text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-all"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Spacer */}
      <div
        className={cn(
          "flex-shrink-0 transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      />
    </>
  );
}
