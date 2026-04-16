"use client";

import { Columns3, Calendar, Hash, Tag, Type } from "lucide-react";
import type { SmartMapping } from "@/types";

interface DetectedColumnsProps {
  mapping: SmartMapping;
}

const typeIcons: Record<string, any> = {
  date: Calendar,
  number: Hash,
  category: Tag,
  text: Type,
};

const typeColors: Record<string, string> = {
  date: "bg-blue-50 text-blue-700 border-blue-200",
  number: "bg-emerald-50 text-emerald-700 border-emerald-200",
  category: "bg-violet-50 text-violet-700 border-violet-200",
  text: "bg-gray-50 text-gray-600 border-gray-200",
};

export default function DetectedColumns({ mapping }: DetectedColumnsProps) {
  return (
    <div className="bg-white rounded-xl border border-surface-border p-5 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Columns3 className="w-4 h-4 text-gray-400" />
        <h3 className="text-sm font-semibold text-gray-900">Auto-Detected Columns</h3>
        <span className="text-xs text-gray-400">({mapping.detected.length} columns found)</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {mapping.detected.map((col) => {
          const Icon = typeIcons[col.type] || Type;
          const colorClass = typeColors[col.type] || typeColors.text;
          const isPrimary =
            col.name === mapping.primaryDate ||
            col.name === mapping.primaryNumeric ||
            col.name === mapping.primaryCategory;

          return (
            <div
              key={col.name}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${colorClass} ${
                isPrimary ? "ring-2 ring-offset-1 ring-brand-300" : ""
              }`}
              title={`Type: ${col.type} | Confidence: ${(col.confidence * 100).toFixed(0)}% | ${col.uniqueCount} unique values\nSamples: ${col.samples.slice(0, 3).join(", ")}`}
            >
              <Icon className="w-3 h-3" />
              {col.name}
              {isPrimary && <span className="text-[10px] opacity-60">★</span>}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        ★ = primary column for that type. Hover for details.
      </p>
    </div>
  );
}
