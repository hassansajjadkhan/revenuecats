"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  LayoutDashboard,
  ChevronDown,
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

const topNav = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, chevron: true },
  { label: "Customers", href: "/dashboard/growth", icon: Users },
  { label: "Product catalog", href: "#", icon: Boxes, chevron: true },
  { label: "Paywalls", href: "#", icon: CreditCard },
  { label: "Targeting", href: "#", icon: Target },
  { label: "Experiments", href: "#", icon: FlaskConical },
  { label: "Web", href: "#", icon: Globe },
  { label: "Ads", href: "#", icon: Megaphone },
  { label: "Lifecycle", href: "#", icon: LifeBuoy, chevron: true },
];

const bottomNav = [
  { label: "Apps & providers", href: "#", icon: Puzzle, chevron: true },
  { label: "Integrations", href: "#", icon: Puzzle },
  { label: "Project settings", href: "/settings", icon: Settings2 },
];

export default function Sidebar() {
  const pathname = usePathname();
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

  const renderNavItem = (item: (typeof topNav)[0]) => {
    const isActive =
      pathname === item.href ||
      (item.href !== "/dashboard" && item.href !== "#" && pathname.startsWith(item.href));
    const Icon = item.icon;

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
        {item.chevron && <ChevronDown className="w-3.5 h-3.5 text-[#6f7788]" />}
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

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-2.5 left-3 z-50 lg:hidden p-2 rounded-lg bg-[#13161d] border border-rc-border text-[#a6afbe] hover:text-white transition-colors"
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
          "fixed left-0 top-0 z-50 h-screen bg-[#0b0d12] border-r border-rc-border flex flex-col w-[248px] transition-transform duration-300 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-[#0b0d12] border-r border-rc-border transition-all duration-300 flex-col hidden lg:flex w-[248px]"
        )}
      >
        {sidebarContent}
      </aside>

      <div className="flex-shrink-0 hidden lg:block w-[248px]" />
    </>
  );
}
