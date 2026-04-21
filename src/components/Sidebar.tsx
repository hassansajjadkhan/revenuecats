"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Repeat,
  Users2,
  Filter,
  Timer,
  Undo2,
  Users,
  Target,
  FlaskConical,
  Globe,
  Megaphone,
  LifeBuoy,
  Boxes,
  CreditCard,
  Puzzle,
  Settings2,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const chartsMenu = [
  {
    label: "Revenue",
    icon: CircleDollarSign,
    colorClass: "text-[#66d9e8]",
    items: ["Cumulative Revenue", "ARR", "MRR", "Non-Subscription Purchases"],
  },
  {
    label: "Subscriptions",
    icon: Repeat,
    colorClass: "text-[#a5d8ff]",
    items: ["Active Subscriptions"],
  },
  {
    label: "Cohorts and LTV",
    icon: Users2,
    colorClass: "text-[#b2f2bb]",
    items: ["Realized LTV per paying customer"],
  },
  {
    label: "Conversion funnel",
    icon: Filter,
    colorClass: "text-[#ffd8a8]",
    items: ["New Customers", "Initial Conversion", "Trial Conversion", "Conversion to Paying"],
  },
  {
    label: "Trials",
    icon: Timer,
    colorClass: "text-[#eebefa]",
    items: ["Active Trials", "Active Trials Movement", "New Trials"],
  },
  {
    label: "Churn and refunds",
    icon: Undo2,
    colorClass: "text-[#ffc9c9]",
    items: ["Churn", "Refund Rate", "App Store Refund Requests", "Play Store Cancel Reasons", "Customer Center Survey Responses"],
  },
];

const topNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "#", icon: BarChart3, hasPanel: true },
  { label: "Customers", href: "/dashboard/growth", icon: Users },
  { label: "Product Catalog", href: "#", icon: Boxes, chevron: true },
  { label: "Paywalls", href: "#", icon: CreditCard },
  { label: "Targeting", href: "#", icon: Target },
  { label: "Experiments", href: "#", icon: FlaskConical },
  { label: "Web", href: "#", icon: Globe },
  { label: "Ads", href: "#", icon: Megaphone },
  { label: "Lifecycle", href: "#", icon: LifeBuoy, chevron: true, subItems: ["Customer Center", "Support", "Retention"] },
];

const bottomNav = [
  { label: "Apps & providers", href: "#", icon: Puzzle, chevron: true, subItems: ["Configurations", "API Keys"] },
  { label: "Integrations", href: "#", icon: Puzzle },
  { label: "Project settings", href: "/settings", icon: Settings2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [expandedCharts, setExpandedCharts] = useState<Record<string, boolean>>({});
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
  const [analyticsPanelTab, setAnalyticsPanelTab] = useState<"charts" | "benchmarks">("charts");

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

  const toggleDropdown = (label: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleChartCategory = (label: string) => {
    setExpandedCharts((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const renderNavItem = (item: any) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/dashboard" && item.href !== "#" && pathname.startsWith(item.href));
    const Icon = item.icon;
    const isDropdownOpen = openDropdowns[item.label];

    // Analytics panel button
    if (item.hasPanel) {
      return (
        <button
          key={item.label}
          onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
          className={cn(
            "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
            showAnalyticsPanel
              ? "bg-[#171b22] text-white border border-rc-border"
              : "text-[#b8c0cf] hover:text-white hover:bg-[#141821]"
          )}
        >
          <span className="flex items-center gap-3">
            <Icon className={cn("w-[16px] h-[16px] flex-shrink-0", showAnalyticsPanel && "text-white")} />
            <span>{item.label}</span>
          </span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-[#6f7788] transition-transform", showAnalyticsPanel && "rotate-180")} />
        </button>
      );
    }

    // Dropdown menu items
    if (item.chevron) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleDropdown(item.label)}
            className={cn(
              "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
              isActive
                ? "bg-[#171b22] text-white border border-rc-border"
                : "text-[#b8c0cf] hover:text-white hover:bg-[#141821]"
            )}
          >
            <span className="flex items-center gap-3">
              <Icon className={cn("w-[16px] h-[16px] flex-shrink-0", isActive && "text-white")} />
              <span>{item.label}</span>
            </span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-[#6f7788] transition-transform", isDropdownOpen && "rotate-180")} />
          </button>
          {isDropdownOpen && item.subItems && (
            <div className="ml-6 mt-1 space-y-1">
              {item.subItems.map((subItem: string) => (
                <Link
                  key={subItem}
                  href="#"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium text-[#b8c0cf] hover:text-white hover:bg-[#141821] transition-colors"
                >
                  <span>{subItem}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Regular nav link
    return (
      <Link
        key={item.label}
        href={item.href}
        className={cn(
          "flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
          isActive
            ? "bg-[#171b22] text-white border border-rc-border"
            : "text-[#b8c0cf] hover:text-white hover:bg-[#141821]"
        )}
      >
        <span className="flex items-center gap-3">
          <Icon className={cn("w-[16px] h-[16px] flex-shrink-0", isActive && "text-white")} />
          <span>{item.label}</span>
        </span>
      </Link>
    );
  };

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-3.5 h-12 border-b border-rc-border">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 rounded-md bg-[#ed4d5f] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-[10px]">RC</span>
          </div>
          <span className="text-white text-sm font-semibold tracking-tight">TruthSayer AI</span>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-[#94a0b6] hover:text-white hover:bg-[#141821] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 py-2 px-2.5 space-y-0.5 overflow-y-auto">
        {topNav.map(renderNavItem)}
      </nav>

      <div className="border-t border-rc-border py-2 px-2.5 space-y-0.5">
        {bottomNav.map(renderNavItem)}
      </div>
    </>
  );

  const analyticsPanelContent = (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 px-3 pt-3 pb-2 border-b border-rc-border">
        <button
          onClick={() => setAnalyticsPanelTab("charts")}
          className={cn(
            "px-3 py-1.5 rounded text-xs font-medium",
            analyticsPanelTab === "charts"
              ? "bg-[#171b22] text-white border border-rc-border"
              : "text-[#b8c0cf] hover:text-white"
          )}
        >
          Charts
        </button>
        <button
          onClick={() => setAnalyticsPanelTab("benchmarks")}
          className={cn(
            "px-3 py-1.5 rounded text-xs font-medium",
            analyticsPanelTab === "benchmarks"
              ? "bg-[#171b22] text-white border border-rc-border"
              : "text-[#b8c0cf] hover:text-white"
          )}
        >
          Benchmarks
        </button>
      </div>

      {analyticsPanelTab === "charts" && (
        <div className="flex-1 py-2 px-2.5 space-y-1 overflow-y-auto">
          {chartsMenu.map((category) => {
            const CategoryIcon = category.icon;

            return (
            <div key={category.label}>
              <button
                onClick={() => toggleChartCategory(category.label)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[12px] font-medium text-[#b8c0cf] hover:text-white hover:bg-[#141821] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CategoryIcon className={cn("w-3.5 h-3.5", category.colorClass)} />
                  <span>{category.label}</span>
                </span>
                <ChevronRight className={cn("w-3 h-3 transition-transform", expandedCharts[category.label] && "rotate-90")} />
              </button>
              {expandedCharts[category.label] && (
                <div className="ml-3 mt-0.5 space-y-1">
                  {category.items.map((item) => (
                    <Link
                      key={item}
                      href="#"
                      className="block px-3 py-1.5 rounded text-[11px] text-[#8892a4] hover:text-white hover:bg-[#141821] transition-colors"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );})}
        </div>
      )}

      {analyticsPanelTab === "benchmarks" && (
        <div className="flex-1 py-4 px-4 text-center">
          <p className="text-xs text-[#8892a4]">Benchmarks coming soon</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-2.5 left-3 z-50 lg:hidden p-2 rounded-lg bg-[#13161d] border border-rc-border text-[#a6afbe] hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen bg-[#0b0d12] border-r border-rc-border flex flex-col w-[248px] transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-[#0b0d12] border-r border-rc-border transition-all duration-300 flex-col hidden lg:flex w-[248px]"
        )}
      >
        {sidebarContent}
      </aside>

      {showAnalyticsPanel && (
        <div className="fixed left-[248px] top-0 z-30 h-screen bg-[#0b0d12] border-r border-rc-border hidden lg:flex flex-col w-[280px]">
          {analyticsPanelContent}
        </div>
      )}

      <div className="flex-shrink-0 hidden lg:block w-[248px]" />
      {showAnalyticsPanel && <div className="flex-shrink-0 hidden lg:block w-[280px]" />}
    </>
  );
}
