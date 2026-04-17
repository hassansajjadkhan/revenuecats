"use client";

import {
  Table,
  ArrowUpDown,
} from "lucide-react";
import { useState } from "react";
import type { RawRow } from "@/types";

interface DataTableProps {
  data: RawRow[];
  columns: string[];
  title?: string;
  maxRows?: number;
}

export default function DataTable({
  data,
  columns,
  title = "Raw Data",
  maxRows = 50,
}: DataTableProps) {
  const [sortCol, setSortCol] = useState<string>("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [showAll, setShowAll] = useState(false);

  const handleSort = (col: string) => {
    if (sortCol === col) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  let sortedData = [...data];
  if (sortCol) {
    sortedData.sort((a, b) => {
      const va = a[sortCol] || "";
      const vb = b[sortCol] || "";
      const comparison = va.localeCompare(vb, undefined, { numeric: true });
      return sortDir === "asc" ? comparison : -comparison;
    });
  }

  const displayData = showAll ? sortedData : sortedData.slice(0, maxRows);

  return (
    <div className="bg-rc-card rounded-xl border border-rc-border p-3 sm:p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-rc-textDim" />
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <span className="text-xs text-rc-textDim">
            ({data.length} rows)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto -mx-3 sm:-mx-5 px-3 sm:px-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-rc-border">
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="text-left py-2.5 px-3 text-xs font-semibold text-rc-textMuted uppercase tracking-wider cursor-pointer hover:text-white whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    {col}
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, i) => (
              <tr
                key={i}
                className="border-b border-rc-border/50 hover:bg-rc-surface/50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col}
                    className="py-2.5 px-3 text-rc-text whitespace-nowrap max-w-[200px] truncate"
                  >
                    {row[col] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > maxRows && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs text-rc-accent hover:text-rc-accentHover font-medium"
          >
            {showAll
              ? "Show less"
              : `Show all ${data.length} rows`}
          </button>
        </div>
      )}
    </div>
  );
}
