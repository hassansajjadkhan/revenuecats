import { NextRequest, NextResponse } from "next/server";
import { fetchSheetData, getSheetColumns } from "@/lib/google-sheets";
import { detectColumns } from "@/lib/data-processor";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sheetId = searchParams.get("sheetId");
  const sheetName = searchParams.get("sheetName") || undefined;

  if (!sheetId) {
    return NextResponse.json(
      { error: "sheetId is required" },
      { status: 400 }
    );
  }

  // Validate sheetId format
  if (!/^[a-zA-Z0-9-_]+$/.test(sheetId)) {
    return NextResponse.json(
      { error: "Invalid sheet ID format" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchSheetData(sheetId, sheetName);
    const columns = getSheetColumns(data);
    
    // Log raw columns and detection
    console.log("Sheets API Debug:", {
      sheetId,
      sheetName,
      rowCount: data.length,
      rawColumns: columns,
      firstRow: data[0],
    });
    
    // Detect column types
    const mapping = detectColumns(data);
    console.log("Column detection results:", {
      dateColumns: mapping.dateColumns,
      numericColumns: mapping.numericColumns,
      categoryColumns: mapping.categoryColumns,
      textColumns: mapping.textColumns,
      allDetected: mapping.detected.map(d => ({ name: d.name, type: d.type, confidence: d.confidence })),
    });

    return NextResponse.json({
      data,
      columns,
      rowCount: data.length,
      detection: {
        dateColumns: mapping.dateColumns,
        numericColumns: mapping.numericColumns,
        categoryColumns: mapping.categoryColumns,
        textColumns: mapping.textColumns,
      }
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch sheet data";

    console.error("Sheets API error:", { error: message, sheetId, sheetName });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
