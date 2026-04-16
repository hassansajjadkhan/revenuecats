"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import SheetConnector from "@/components/SheetConnector";
import { Trash2, Database, Shield, Zap } from "lucide-react";

export default function SettingsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [savedSheetId, setSavedSheetId] = useState<string>("");

  useEffect(() => {
    const config = localStorage.getItem("dashboard_sheet_config");
    if (config) {
      try {
        const parsed = JSON.parse(config);
        if (parsed.sheetId) {
          setSavedSheetId(parsed.sheetId);
          setIsConnected(true);
        }
      } catch {
        // Ignore
      }
    }
  }, []);

  const handleConnect = async (sheetId: string, sheetName?: string) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const params = new URLSearchParams({ sheetId });
      if (sheetName) params.set("sheetName", sheetName);

      const res = await fetch(`/api/sheets?${params}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error);

      setIsConnected(true);
      setSavedSheetId(sheetId);

      localStorage.setItem(
        "dashboard_sheet_config",
        JSON.stringify({ sheetId, sheetName })
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem("dashboard_sheet_config");
    setIsConnected(false);
    setSavedSheetId("");
  };

  return (
    <div className="flex min-h-screen bg-surface-secondary">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <Header title="Settings" subtitle="Manage your data source and preferences" />

        <div className="p-6 lg:p-8 space-y-6 max-w-3xl">
          {/* Data Source */}
          <SheetConnector
            onConnect={handleConnect}
            isConnected={isConnected}
            isLoading={isLoading}
            error={error}
          />

          {/* Disconnect Button */}
          {isConnected && (
            <div className="bg-white rounded-xl border border-surface-border p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Connected Sheet
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 font-mono">
                      {savedSheetId.slice(0, 20)}...
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-surface-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Data Privacy
                </h4>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Your Google Sheet data is fetched server-side and never stored.
                Only the sheet ID is saved locally in your browser for
                reconnection.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-surface-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-brand-600" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900">
                  Auto-Sync
                </h4>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Data refreshes every time you load the dashboard or click
                Refresh. Update your Google Sheet and the dashboard will reflect
                changes within seconds.
              </p>
            </div>
          </div>

          {/* Sheet Format Guide */}
          <div className="bg-white rounded-xl border border-surface-border p-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              Works with Any Sheet
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              Just link your Google Sheet — columns are automatically detected by analyzing the data.
              Date columns, numeric columns, and categories are identified automatically.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-gray-100 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">
                      Revenue
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">
                      Category
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-600">
                      Customer
                    </th>
                  </tr>
                </thead>
                <tbody className="text-gray-500">
                  <tr className="border-t border-gray-50">
                    <td className="px-3 py-2">2024-01-15</td>
                    <td className="px-3 py-2">$1,200</td>
                    <td className="px-3 py-2">Premium</td>
                    <td className="px-3 py-2">john@example.com</td>
                  </tr>
                  <tr className="border-t border-gray-50">
                    <td className="px-3 py-2">2024-01-16</td>
                    <td className="px-3 py-2">$800</td>
                    <td className="px-3 py-2">Basic</td>
                    <td className="px-3 py-2">jane@example.com</td>
                  </tr>
                  <tr className="border-t border-gray-50">
                    <td className="px-3 py-2">2024-01-16</td>
                    <td className="px-3 py-2">$2,400</td>
                    <td className="px-3 py-2">Enterprise</td>
                    <td className="px-3 py-2">corp@example.com</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-400 mt-3">
              Column names don&apos;t matter — the system analyzes your actual data values
              to detect dates, numbers, and categories automatically.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
