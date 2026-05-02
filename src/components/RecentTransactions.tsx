"use client";

import type { RawRow } from "@/types";
import { ChevronRight } from "lucide-react";

interface RecentTransactionsProps {
  data: RawRow[];
  limit?: number;
}

export default function RecentTransactions({ data, limit = 10 }: RecentTransactionsProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const transactions = data.slice(0, limit);

  // Try to detect relevant columns from the data
  const allKeys = Object.keys(transactions[0] || {});
  
  // Simple heuristics to find column types
  const dateCol = allKeys.find((k) => /date|time|created|purchased/i.test(k));
  const customerCol = allKeys.find((k) => /customer|user|id|account/i.test(k));
  const productCol = allKeys.find((k) => /product|package|plan/i.test(k));
  const revenueCol = allKeys.find((k) => /revenue|price|amount|cost|fee/i.test(k));
  const typeCol = allKeys.find((k) => /type|status|subscription/i.test(k));
  const expiresCol = allKeys.find((k) => /expir|renew|end|cancel/i.test(k));

  const displayColumns = [
    { key: customerCol, label: "Customer" },
    { key: productCol, label: "Product" },
    { key: dateCol, label: "Purchased" },
    { key: expiresCol, label: "Expires" },
    { key: revenueCol, label: "Revenue" },
    { key: typeCol, label: "Type" },
  ].filter((col) => col.key);

  const getStatusBadgeColor = (value: string | undefined): string => {
    if (!value) return "bg-gray-500/10 text-gray-400";
    const v = String(value).toLowerCase();
    if (v.includes("trial")) return "bg-amber-500/10 text-amber-400";
    if (v.includes("new")) return "bg-emerald-500/10 text-emerald-400";
    if (v.includes("renewal")) return "bg-blue-500/10 text-blue-400";
    if (v.includes("refund")) return "bg-red-500/10 text-red-400";
    if (v.includes("cancel")) return "bg-orange-500/10 text-orange-400";
    return "bg-gray-500/10 text-gray-400";
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-white mb-4">Recent transactions</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2e3340]">
              {displayColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-semibold text-[#8892a4] uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((row, idx) => (
              <tr
                key={idx}
                className="border-b border-[#1a1f2e] hover:bg-[#0f1218]/50 transition-colors"
              >
                {displayColumns.map((col) => {
                  const value = row[col.key || ""];
                  const displayValue = String(value || "-").substring(0, 100);
                  const isStatus = col.label === "Type";

                  return (
                    <td key={col.key} className="px-4 py-3">
                      {isStatus ? (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                            displayValue
                          )}`}
                        >
                          {displayValue.toUpperCase()}
                        </span>
                      ) : (
                        <span className="text-[#e1e4ea]">{displayValue}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > limit && (
        <div className="mt-4 flex justify-center">
          <button className="flex items-center gap-2 text-sm text-rc-accent hover:text-rc-accentHover transition-colors">
            View all transactions
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
