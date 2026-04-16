import { NextRequest, NextResponse } from "next/server";
import { fetchSheetData, getSheetColumns } from "@/lib/google-sheets";

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

    return NextResponse.json({
      data,
      columns,
      rowCount: data.length,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch sheet data";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
