"use client";

import type { RawRow } from "@/types";

interface RecentTransactionsProps {
  data: RawRow[];
  limit?: number;
}

const countryFlags: Record<string, string> = {
  us: "🇺🇸",
  gb: "🇬🇧",
  de: "🇩🇪",
  fr: "🇫🇷",
  jp: "🇯🇵",
  cn: "🇨🇳",
  in: "🇮🇳",
  br: "🇧🇷",
  ca: "🇨🇦",
  au: "🇦🇺",
  mx: "🇲🇽",
  es: "🇪🇸",
  it: "🇮🇹",
  nl: "🇳🇱",
  se: "🇸🇪",
};

function getMaskCustomerId(id: string): string {
  const flag = Object.values(countryFlags)[Math.floor(Math.random() * Object.values(countryFlags).length)];
  return `${flag} ${id.slice(0, 4).toUpperCase().padEnd(4, "•")}`;
}

function getStatusBadge(value: string | undefined): { label: string; color: string } {
  if (!value) return { label: "—", color: "text-[#8892a4]" };
  
  const v = String(value).toLowerCase();
  if (v.includes("trial")) return { label: "TRIAL", color: "bg-[#92400e]/20 text-[#f59e0b]" };
  if (v.includes("new") && v.includes("sub")) return { label: "NEW SUB", color: "bg-[#1e40af]/20 text-[#3b82f6]" };
  if (v.includes("renewal")) return { label: "RENEWAL", color: "bg-[#064e3b]/20 text-[#10b981]" };
  if (v.includes("refund")) return { label: "REFUND", color: "bg-[#7f1d1d]/20 text-[#ef4444]" };
  if (v.includes("cancel")) return { label: "CANCELED", color: "bg-[#92400e]/20 text-[#f97316]" };
  return { label: v.toUpperCase(), color: "text-[#8892a4]" };
}

export default function RecentTransactions({ data, limit = 10 }: RecentTransactionsProps) {
  if (!data || data.length === 0) {
    return null;
  }

  const transactions = data.slice(0, limit);

  // Detect columns
  const allKeys = Object.keys(transactions[0] || {});
  
  const customerCol = allKeys.find((k) => /customer|user|id|account|email/i.test(k));
  const storeCol = allKeys.find((k) => /store|platform|source/i.test(k));
  const productCol = allKeys.find((k) => /product|package|plan|subscription/i.test(k));
  const purchaseCol = allKeys.find((k) => /purchased|purchase|created|date|transaction/i.test(k));
  const expiresCol = allKeys.find((k) => /expir|renew|end|cancel/i.test(k));
  const revenueCol = allKeys.find((k) => /revenue|price|amount|cost|fee|value/i.test(k));
  const typeCol = allKeys.find((k) => /type|status|subscription|kind/i.test(k));

  const displayColumns = [
    { key: customerCol, label: "Customer ID" },
    { key: storeCol, label: "Store" },
    { key: productCol, label: "Product" },
    { key: purchaseCol, label: "Purchased" },
    { key: expiresCol, label: "Expires" },
    { key: revenueCol, label: "Revenue" },
    { key: typeCol, label: "Type" },
  ].filter((col) => col.key);

  return (
    <div className="mt-8">
      <h3 className="text-base font-semibold text-white mb-4">Recent transactions</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2e3340]">
              {displayColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-[#8892a4] uppercase tracking-wide"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactions.map((row, idx) => {
              const statusValue = row[displayColumns.find((c) => c.label === "Type")?.key || ""];
              const status = getStatusBadge(statusValue);

              return (
                <tr
                  key={idx}
                  className="border-b border-[#1a1f2e] hover:bg-[#0f1218]/50 transition-colors"
                >
                  {displayColumns.map((col) => {
                    const value = row[col.key || ""];
                    let displayValue = String(value || "—").substring(0, 100);

                    if (col.label === "Customer ID") {
                      displayValue = getMaskCustomerId(displayValue);
                    }

                    if (col.label === "Type") {
                      return (
                        <td key={col.key} className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                      );
                    }

                    return (
                      <td key={col.key} className="px-4 py-3 text-[#e1e4ea]">
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {data.length > limit && (
        <div className="mt-4 flex justify-center">
          <button className="text-sm text-rc-accent hover:text-rc-accentHover transition-colors">
            View all transactions →
          </button>
        </div>
      )}
    </div>
  );
}
