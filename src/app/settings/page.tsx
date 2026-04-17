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
    <div className="flex min-h-screen bg-rc-bg">
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
            <div className="bg-rc-card rounded-xl border border-rc-border p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-rc-textDim" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Connected Sheet
                    </p>
                    <p className="text-xs text-rc-textMuted mt-0.5 font-mono">
                      {savedSheetId.slice(0, 20)}...
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnect}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-rc-red hover:bg-rc-redBg rounded-lg transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            </div>
          )}

          {/* Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-rc-card rounded-xl border border-rc-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-900/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-sm font-semibold text-white">
                  Data Privacy
                </h4>
              </div>
              <p className="text-xs text-rc-textMuted leading-relaxed">
                Your Google Sheet data is fetched server-side and never stored.
                Only the sheet ID is saved locally in your browser for
                reconnection.
              </p>
            </div>

            <div className="bg-rc-card rounded-xl border border-rc-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-rc-accent/15 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-rc-accent" />
                </div>
                <h4 className="text-sm font-semibold text-white">
                  Auto-Sync
                </h4>
              </div>
              <p className="text-xs text-rc-textMuted leading-relaxed">
                Data refreshes every time you load the dashboard or click
                Refresh. Update your Google Sheet and the dashboard will reflect
                changes within seconds.
              </p>
            </div>
          </div>

          {/* Sheet Format Guide */}
          <div className="bg-rc-card rounded-xl border border-rc-border p-5">
            <h4 className="text-sm font-semibold text-white mb-3">
              Works with Any Sheet
            </h4>
            <p className="text-xs text-rc-textMuted mb-4">
              Just link your Google Sheet — columns are automatically detected by analyzing the data.
              Date columns, numeric columns, and categories are identified automatically.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-rc-border rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-rc-surface">
                    <th className="px-3 py-2 text-left font-semibold text-rc-textMuted">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-rc-textMuted">
                      Revenue
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-rc-textMuted">
                      Category
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-rc-textMuted">
                      Customer
                    </th>
                  </tr>
                </thead>
                <tbody className="text-rc-text">
                  <tr className="border-t border-rc-border/50">
                    <td className="px-3 py-2">2024-01-15</td>
                    <td className="px-3 py-2">$1,200</td>
                    <td className="px-3 py-2">Premium</td>
                    <td className="px-3 py-2">john@example.com</td>
                  </tr>
                  <tr className="border-t border-rc-border/50">
                    <td className="px-3 py-2">2024-01-16</td>
                    <td className="px-3 py-2">$800</td>
                    <td className="px-3 py-2">Basic</td>
                    <td className="px-3 py-2">jane@example.com</td>
                  </tr>
                  <tr className="border-t border-rc-border/50">
                    <td className="px-3 py-2">2024-01-16</td>
                    <td className="px-3 py-2">$2,400</td>
                    <td className="px-3 py-2">Enterprise</td>
                    <td className="px-3 py-2">corp@example.com</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-rc-textDim mt-3">
              Column names don&apos;t matter — the system analyzes your actual data values
              to detect dates, numbers, and categories automatically.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
