import Papa from "papaparse";
import type { RawRow } from "@/types";

export interface AvailableSheet {
  gid: number;
  name: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
  preview: string;
}

/**
 * Tries to find all available sheets in a Google Sheet by attempting different gid values
 */
export async function fetchAvailableSheets(
  sheetId: string
): Promise<AvailableSheet[]> {
  const sheets: AvailableSheet[] = [];
  
  console.log("Fetching sheet metadata for:", sheetId);
  
  try {
    // Fetch the sheet's JSON metadata
    // Google Sheets embeds all sheet info in the page HTML
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/edit?usp=sharing`;
    const response = await fetch(sheetUrl);
    const html = await response.text();
    
    // Extract sheet metadata from the HTML
    // Look for the JSON that contains sheet properties
    const match = html.match(/"sheets":\s*\[([\s\S]*?)\]/);
    if (!match) {
      console.log("Could not find sheets metadata in HTML, falling back to sequential scan");
      return await fallbackSequentialScan(sheetId);
    }
    
    // Try to parse the JSON
    const sheetsJson = `[${match[1]}]`;
    const parsedSheets = JSON.parse(sheetsJson);
    
    console.log("Found sheet metadata:", parsedSheets.length, "sheets");
    
    // Extract gid and title from each sheet
    for (const sheet of parsedSheets) {
      const gid = sheet.properties?.sheetId ?? 0;
      const title = sheet.properties?.title ?? `Sheet ${gid}`;
      
      try {
        // Fetch data for this sheet
        const csvUrl = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv&gid=${gid}`;
        const csvResponse = await fetch(csvUrl, {
          next: { revalidate: 60 },
        });
        
        if (!csvResponse.ok) {
          console.log(`Could not fetch sheet ${title} (gid=${gid})`);
          continue;
        }
        
        const csvText = await csvResponse.text();
        
        if (!csvText || csvText.trim().length < 5) {
          console.log(`Sheet ${title} (gid=${gid}) appears empty`);
          continue;
        }
        
        // Parse CSV to get columns and row count
        const data = await new Promise<RawRow[]>((resolve) => {
          Papa.parse<RawRow>(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: false,
            transformHeader: (h) => h.trim(),
            complete: (results) => {
              resolve(results.data);
            },
            error: () => resolve([]),
          });
        });
        
        if (data.length === 0) {
          console.log(`Sheet ${title} (gid=${gid}) has no data rows`);
          continue;
        }
        
        const columns = Object.keys(data[0] || {});
        
        if (columns.length === 0) {
          console.log(`Sheet ${title} (gid=${gid}) has no columns`);
          continue;
        }
        
        sheets.push({
          gid,
          name: title,
          rowCount: data.length,
          columnCount: columns.length,
          columns,
          preview: columns.slice(0, 5).join(", ") + (columns.length > 5 ? "..." : ""),
        });
        
        console.log("Loaded sheet:", { gid, name: title, columns: columns.length, rows: data.length });
      } catch (e) {
        console.log(`Error loading sheet ${title}:`, e);
        continue;
      }
    }
    
    console.log("Available sheets found:", sheets.length, sheets);
    return sheets;
  } catch (e) {
    console.log("Error fetching sheet metadata:", e);
    console.log("Falling back to sequential scan...");
    return await fallbackSequentialScan(sheetId);
  }
}

/**
 * Fallback: Try gid values sequentially
 */
async function fallbackSequentialScan(
  sheetId: string
): Promise<AvailableSheet[]> {
  const sheets: AvailableSheet[] = [];
  
  console.log("Starting sequential scan fallback for:", sheetId);
  
  let lastFoundAt = -1;
  
  for (let gid = 0; gid <= 500; gid++) {
    // Smart stopping: if we've checked 50 gids past the last found sheet, stop
    if (lastFoundAt >= 0 && gid - lastFoundAt > 50) {
      console.log(`Stopping scan at gid ${gid} - no sheets found in last 50 gids`);
      break;
    }
    
    try {
      const url = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/export?format=csv&gid=${gid}`;
      
      const response = await fetch(url, {
        next: { revalidate: 60 },
      });
      
      if (!response.ok) {
        continue;
      }
      
      const csvText = await response.text();
      
      if (!csvText || csvText.trim().length < 5) {
        continue;
      }
      
      const data = await new Promise<RawRow[]>((resolve) => {
        Papa.parse<RawRow>(csvText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: false,
          transformHeader: (h) => h.trim(),
          complete: (results) => {
            resolve(results.data);
          },
          error: () => resolve([]),
        });
      });
      
      if (data.length === 0) {
        continue;
      }
      
      const columns = Object.keys(data[0] || {});
      
      if (columns.length === 0) {
        continue;
      }
      
      lastFoundAt = gid;
      
      let sheetName = `Sheet ${gid}`;
      
      if (columns.some(c => /date|revenue|arr|mrr|subscription|customer|trial|refund/i.test(c))) {
        sheetName = "RevenueCat.APP DATA";
      } else if (columns.length === 1 && columns[0].toLowerCase() === 'users') {
        sheetName = "Users";
      } else if (columns[0] && !columns[0].match(/^\s*$/)) {
        sheetName = columns[0].length > 20 ? `Sheet ${gid}` : columns[0];
      }
      
      sheets.push({
        gid,
        name: sheetName,
        rowCount: data.length,
        columnCount: columns.length,
        columns,
        preview: columns.slice(0, 5).join(", ") + (columns.length > 5 ? "..." : ""),
      });
      
      console.log("Found sheet:", { gid, name: sheetName, columns: columns.length, rows: data.length });
    } catch (e) {
      console.log(`Error scanning gid ${gid}:`, e);
      continue;
    }
  }
  
  console.log("Fallback scan found:", sheets.length, "sheets");
  return sheets;
}

/**
 * Fetches data from a Google Sheet using the published CSV export URL.
 * The sheet must be shared as "Anyone with the link can view".
 * If sheetName is not found, automatically tries other sheets.
 * If sheetName is all digits, treats it as a gid directly.
 */
export async function fetchSheetData(
  sheetId: string,
  sheetName?: string
): Promise<RawRow[]> {
  // Check if sheetName is actually a gid (all digits)
  if (sheetName && /^\d+$/.test(sheetName.trim())) {
    console.log("Detected numeric gid input:", sheetName);
    try {
      const data = await fetchSheetByGid(sheetId, parseInt(sheetName.trim(), 10));
      if (data.length > 0) {
        const columns = Object.keys(data[0] || {});
        console.log("Successfully fetched from gid:", { gid: sheetName, columns });
        return data;
      }
    } catch (e) {
      console.error("Failed to fetch from gid:", e);
      throw e;
    }
  }

  // Try with the specified sheet name (if provided)
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
