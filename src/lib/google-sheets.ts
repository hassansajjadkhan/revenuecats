import Papa from "papaparse";
import type { RawRow } from "@/types";

/**
 * Fetches data from a Google Sheet using the published CSV export URL.
 * The sheet must be shared as "Anyone with the link can view".
 * If sheetName is not found, automatically tries other sheets.
 */
export async function fetchSheetData(
  sheetId: string,
  sheetName?: string
): Promise<RawRow[]> {
  // First, try with the specified sheet name (if provided)
  if (sheetName) {
    try {
      const data = await fetchSheetByName(sheetId, sheetName);
      if (data.length > 0) {
        const columns = Object.keys(data[0] || {});
        console.log("Successfully fetched from named sheet:", { sheetName, columns });
        return data;
      }
    } catch (e) {
      console.warn("Failed to fetch from named sheet, trying other sheets...", e);
    }
  }

  // If no sheet name or it failed, try to auto-detect by fetching different sheets
  // Try sheets with gid 0, 1, 2, etc. (common sheet indices)
  for (let gid = 0; gid <= 5; gid++) {
    try {
      const data = await fetchSheetByGid(sheetId, gid);
      if (data.length > 0) {
        const columns = Object.keys(data[0] || {});
        
        // Check if this looks like a metrics sheet (has more than just "Users" or "Id")
        const hasMetrics = columns.length > 1 || 
          (columns.length === 1 && !columns[0].toLowerCase().includes('users') && !columns[0].toLowerCase().includes('id'));
        
        if (hasMetrics || columns.some(c => 
          /revenue|arr|mrr|subscription|customer|trial|ltv|refund|churn/i.test(c)
        )) {
          console.log("Auto-detected metrics sheet:", { gid, columns });
          return data;
        }
      }
    } catch (e) {
      // Continue to next sheet
      continue;
    }
  }

  // Fallback to first sheet
  try {
    const data = await fetchSheetByGid(sheetId, 0);
    const columns = Object.keys(data[0] || {});
    console.log("Fallback: using first sheet with columns:", columns);
    return data;
  } catch (error) {
    throw new Error("Unable to fetch any sheet from the spreadsheet");
  }
}

async function fetchSheetByName(sheetId: string, sheetName: string): Promise<RawRow[]> {
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv&sheet=${encodeURIComponent(sheetName)}`;
  
  console.log("Fetching sheet by name:", { url });
  
  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sheet: ${response.status}`);
  }

  const csvText = await response.text();
  return parseCSV(csvText);
}

async function fetchSheetByGid(sheetId: string, gid: number): Promise<RawRow[]> {
  const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv&gid=${gid}`;
  
  console.log("Fetching sheet by gid:", { gid, url });
  
  const response = await fetch(url, {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch sheet with gid ${gid}: ${response.status}`);
  }

  const csvText = await response.text();
  return parseCSV(csvText);
}

function parseCSV(csvText: string): Promise<RawRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<RawRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      transformHeader: (h) => h.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          console.warn("CSV parse warnings:", results.errors);
        }
        
        console.log("Parsed CSV:", {
          rowCount: results.data.length,
          columns: results.data.length > 0 ? Object.keys(results.data[0]) : [],
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
