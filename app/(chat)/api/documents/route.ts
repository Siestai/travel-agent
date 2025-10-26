import { NextResponse } from "next/server";
import { mockDocumentList } from "@/lib/mock-data/travel-documents";
import { auth } from "../../../(auth)/auth";

// TODO: Implement actual database queries
export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return mock data for now
  return NextResponse.json({ documents: mockDocumentList });
}
