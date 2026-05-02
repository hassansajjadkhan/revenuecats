"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";
import {
  CircleDollarSign,
  Repeat,
  Users2,
  Filter,
  Timer,
  Undo2,
  ChevronRight,
  Search,
  BarChart3,
  ArrowLeft,
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
    items: ["Active Subscriptions", "Active Subscriptions Movement", "New Paid Subscriptions", "Subscription Retention", "Subscription Status"],
  },
  {
    label: "Cohorts and LTV",
    icon: Users2,
    colorClass: "text-[#b2f2bb]",
    items: ["Cohort Explorer", "Realized LTV per Customer", "Realized LTV per Paying Customer"],
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

export default function ChartsPage() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Revenue: true,
    Subscriptions: true,
  });

  const toggleCategory = (label: string) => {
    setExpandedCategories((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const filteredCharts = chartsMenu.filter((category) => {
    const matchesSearch =
      category.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.items.some((item) => item.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <AuthGuard>
      <div className="flex min-h-screen dashboard-shell">
        <Sidebar />

        <main className="flex-1 min-w-0">
          <Header title="Charts" subtitle="Browse and view all revenue charts" onSearch={setSearchQuery} />

          <div className="flex flex-1 min-h-screen">
            {/* Charts Navigation Panel */}
            <div className="w-64 border-r border-[#2e3340] bg-[#141821] flex flex-col">
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* Back Button */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-sm text-[#8892a4] hover:text-white mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Overview
                </Link>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f7788]" />
                  <input
                    type="text"
                    placeholder="Search charts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0f1218] border border-[#2e3340] text-[13px] text-white placeholder-[#6f7788] outline-none focus:border-[#3a4150]"
                  />
                </div>

                {/* Chart Categories */}
                <div className="space-y-1">
                  {filteredCharts.map((category) => {
                    const CategoryIcon = category.icon;
                    const isExpanded = expandedCategories[category.label];

                    return (
                      <div key={category.label}>
                        <button
                          onClick={() => toggleCategory(category.label)}
                          className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold text-white hover:bg-[#1a1f2e] transition-colors group"
                        >
                          <span className="flex items-center gap-3">
                            <CategoryIcon className={cn("w-4 h-4 flex-shrink-0", category.colorClass)} />
                            <span>{category.label}</span>
                          </span>
                          <ChevronRight
                            className={cn(
                              "w-3.5 h-3.5 text-[#6f7788] transition-transform",
                              isExpanded && "rotate-90"
                            )}
                          />
                        </button>

                        {isExpanded && (
                          <div className="mt-1 space-y-1 ml-2">
                            {category.items.map((item) => (
                              <Link
                                key={item}
                                href={`/dashboard/charts/${category.label.toLowerCase().replace(/ /g, "-")}/${item.toLowerCase().replace(/ /g, "-")}`}
                                className="block px-3 py-2 rounded-lg text-[12px] text-[#8892a4] hover:text-white hover:bg-[#1a1f2e] transition-colors truncate"
                              >
                                {item}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 p-6 lg:p-8">
              <div className="flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 rounded-2xl bg-rc-surface border border-rc-border flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-rc-textDim" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">Select a chart</h2>
                <p className="text-sm text-rc-textMuted max-w-md mx-auto">
                  Choose a chart from the left panel to view detailed analytics and trends.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
