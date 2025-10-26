import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getParsedDocumentByDriveFileId } from "@/lib/db/queries";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const driveFileId = searchParams.get("driveFileId");

    if (!driveFileId) {
      return NextResponse.json(
        { error: "Missing driveFileId parameter" },
        { status: 400 }
      );
    }

    const parsedDoc = await getParsedDocumentByDriveFileId({ driveFileId });

    if (!parsedDoc) {
      return NextResponse.json(
        { error: "Parsed document not found" },
        { status: 404 }
      );
    }

    if (parsedDoc.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(parsedDoc);
  } catch (error) {
    console.error("Error getting parser results:", error);
    return NextResponse.json(
      { error: "Failed to get parser results" },
      { status: 500 }
    );
  }
}
