"use client";

import { useState } from "react";
import {
  Link2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { extractSheetId } from "@/lib/utils";

interface SheetConnectorProps {
  onConnect: (sheetId: string, sheetName?: string) => void;
  isConnected: boolean;
  isLoading: boolean;
  error?: string;
}

export default function SheetConnector({
  onConnect,
  isConnected,
  isLoading,
  error,
}: SheetConnectorProps) {
  const [sheetUrl, setSheetUrl] = useState("");
  const [sheetName, setSheetName] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const handleConnect = () => {
    const id = extractSheetId(sheetUrl);
    if (id) {
      onConnect(id, sheetName || undefined);
    }
  };

  const handleQuickConnect = () => {
    // User's personal RevenueCat sheet
    onConnect("19Wiql_-e8FoJS2MfjeHL07dO1TGc2llmc2hmPlFA4xA");
  };

  return (
    <div className="bg-rc-card rounded-xl border border-rc-border p-4 sm:p-6 animate-fade-in space-y-4">
      {/* Quick Connect Button */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-[#1a3a4f] to-[#0f2838] border border-[#2a5a7f]">
        <p className="text-xs font-medium text-[#8fb3ff] mb-3">Quick Setup</p>
        <button
          onClick={handleQuickConnect}
          disabled={isLoading}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-[#0ea5e9] to-[#06b6d4] text-white text-sm font-medium rounded-lg hover:from-[#0284c7] hover:to-[#0891b2] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle2 className="w-4 h-4" />
          )}
          Connect My Sheet
        </button>
        <p className="text-xs text-[#8ca6d3] mt-2">
          Instantly connect to your RevenueCat metrics (ID: 19Wiql_-e8FoJS2MfjeHL...)
        </p>
      </div>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#141922] border border-rc-border flex items-center justify-center">
            <Link2 className="w-4 h-4 text-rc-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              Or Connect Another Sheet
            </h3>
            <p className="text-xs text-rc-textMuted mt-0.5">
              Link any spreadsheet — columns are auto-detected
            </p>
          </div>
        </div>

        {isConnected && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </span>
        )}
      </div>

      {/* Auto-detect badge */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[#131a27] rounded-lg border border-[#243147]">
        <Sparkles className="w-3.5 h-3.5 text-[#8fb3ff]" />
        <span className="text-xs text-[#a8beea] font-medium">
          Smart Detection — we analyze your data and pick the best charts automatically. No specific format needed.
        </span>
      </div>

      {/* Help Section */}
      <button
        onClick={() => setShowHelp(!showHelp)}
        className="flex items-center gap-1.5 text-xs text-rc-accent hover:text-rc-accentHover"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        How to connect your Google Sheet
      </button>

      {showHelp && (
        <div className="mb-4 p-4 bg-[#111b2e] rounded-lg text-sm text-[#b1c5e8] space-y-2 border border-[#293b5f]">
          <p className="font-medium">Steps to connect:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Open your Google Sheet</li>
            <li>
              Click <strong>Share</strong> → Change to{" "}
              <strong>&quot;Anyone with the link&quot;</strong> (Viewer)
            </li>
            <li>Copy the sheet URL and paste it below</li>
            <li>
              Make sure your sheet has headers in the first row
            </li>
          </ol>
          <p className="text-xs text-[#8ca6d3] mt-2">
            Your data stays secure — it&apos;s only fetched server-side and never
            stored.
          </p>
        </div>
      )}

      {/* Input Form */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-rc-textMuted mb-1.5">
            Google Sheet URL or ID
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="flex-1 px-3 py-2.5 rounded-lg border border-rc-border bg-[#12161e] text-sm text-rc-text outline-none focus:border-rc-accent focus:ring-1 focus:ring-rc-accent transition-all"
            />
            <button
              onClick={handleConnect}
              disabled={!sheetUrl.trim() || isLoading}
              className="px-4 py-2.5 bg-rc-accent text-white text-sm font-medium rounded-lg hover:bg-rc-accentHover disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Link2 className="w-4 h-4" />
              )}
              Connect
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-rc-textMuted mb-1.5">
            Sheet Name{" "}
            <span className="text-rc-textDim">(optional, defaults to first sheet)</span>
          </label>
          <input
            type="text"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            placeholder="Sheet1"
            className="w-full px-3 py-2.5 rounded-lg border border-rc-border bg-[#12161e] text-sm text-rc-text outline-none focus:border-rc-accent focus:ring-1 focus:ring-rc-accent transition-all"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Quick link to open sheet */}
      {isConnected && sheetUrl && (
        <div className="mt-4 pt-4 border-t border-rc-border">
          <a
            href={
              sheetUrl.startsWith("http")
                ? sheetUrl
                : `https://docs.google.com/spreadsheets/d/${sheetUrl}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-rc-accent hover:text-rc-accentHover"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open sheet in Google Sheets
          </a>
        </div>
      )}
    </div>
  );
}
