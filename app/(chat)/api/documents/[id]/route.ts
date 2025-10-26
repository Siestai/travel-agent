import { NextResponse } from "next/server";
import { mockTravelDocuments } from "@/lib/mock-data/travel-documents";
import { auth } from "../../../../(auth)/auth";

// TODO: Implement actual database query
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const document = mockTravelDocuments.find((doc) => doc.id === id);

  if (!document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  return NextResponse.json({ document });
}
