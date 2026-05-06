import Papa from "papaparse";
import type { RawRow } from "@/types";

/**
 * Fetches data from a Google Sheet using the published CSV export URL.
 * The sheet must be shared as "Anyone with the link can view".
 */
export async function fetchSheetData(
  sheetId: string,
  sheetName?: string
): Promise<RawRow[]> {
  // Build the CSV export URL
  let url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv`;
  
  if (sheetName) {
    // For sheet names with special characters, we need to encode properly
    url += `&sheet=${encodeURIComponent(sheetName)}`;
  }

  console.log("Fetching sheet data from:", { url, sheetId, sheetName });

  const response = await fetch(url, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch sheet data: ${response.status} ${response.statusText}. Make sure the sheet is shared publicly.`
    );
  }

  const csvText = await response.text();
  
  // Log the first 500 chars of CSV to debug
  console.log("CSV data received (first 500 chars):", csvText.substring(0, 500));
  console.log("CSV has", csvText.split('\n').length, "rows");

  return new Promise((resolve, reject) => {
    Papa.parse<RawRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h) => h.trim(), // Trim header names
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn("CSV parse warnings:", results.errors);
        }
        
        console.log("Parsed CSV:", {
          rowCount: results.data.length,
          columns: results.data.length > 0 ? Object.keys(results.data[0]) : [],
          firstRow: results.data[0],
        });
        
        resolve(results.data);
      },
      error: (error: Error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

/**
 * Fetches data using the Google Sheets API v4 (requires API key).
 */
export async function fetchSheetDataWithApi(
  sheetId: string,
  apiKey: string,
  range?: string
): Promise<RawRow[]> {
  const sheetRange = range || "Sheet1";
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(sheetRange)}?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Google Sheets API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const rows: string[][] = data.values || [];

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj: RawRow = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || "";
    });
    return obj;
  });
}

export function getSheetColumns(data: RawRow[]): string[] {
  if (data.length === 0) return [];
  return Object.keys(data[0]);
}
