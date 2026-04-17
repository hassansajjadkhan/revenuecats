"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Settings,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Users,
  Tag,
  CreditCard,
  Target,
  FlaskConical,
  HeadphonesIcon,
  Wrench,
  Key,
  Puzzle,
  Settings2,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Charts", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Customers", href: "/dashboard/growth", icon: Users },
];

const bottomNav = [
  { label: "Project settings", href: "/settings", icon: Settings2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const renderNavItem = (item: typeof mainNav[0]) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/dashboard" && item.href !== "#" && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        key={item.label}
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150",
          isActive
            ? "bg-rc-accent/15 text-white"
            : "text-sidebar-text hover:text-rc-text hover:bg-sidebar-hover"
        )}
        title={collapsed ? item.label : undefined}
      >
        <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", isActive && "text-rc-accent")} />
        {(!collapsed || mobileOpen) && <span>{item.label}</span>}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-14 border-b border-rc-border">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-rc-accent flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xs">RC</span>
          </div>
          {(!collapsed || mobileOpen) && (
            <div className="flex items-center gap-1.5">
              <span className="text-white font-semibold text-sm tracking-tight">
                Analytics
              </span>
              <svg className="w-3 h-3 text-rc-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          )}
        </div>
        {/* Close button on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto">
        {mainNav.map(renderNavItem)}
      </nav>

      {/* Bottom Navigation */}
      <div className="border-t border-rc-border py-3 px-2.5 space-y-0.5">
        {bottomNav.map(renderNavItem)}
      </div>

      {/* Collapse button - desktop only */}
      <div className="hidden lg:block border-t border-rc-border p-2.5">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-1.5 rounded-lg text-sidebar-text hover:text-white hover:bg-sidebar-hover transition-all"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 lg:hidden p-2 rounded-lg bg-rc-card border border-rc-border text-rc-textMuted hover:text-white transition-all"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-sidebar-bg border-r border-rc-border flex flex-col w-[260px] transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-sidebar-bg border-r border-rc-border transition-all duration-300 flex-col hidden lg:flex",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop spacer */}
      <div
        className={cn(
          "flex-shrink-0 transition-all duration-300 hidden lg:block",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      />
    </>
  );
}
