import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  db,
  deleteDriveFile,
  getActiveTravel,
  getDriveFiles,
  getGoogleAccount,
  getParsedDocumentByDriveFileId,
} from "@/lib/db/queries";
import { document, driveFile, parsedDocument } from "@/lib/db/schema";
import { initializeDriveClient } from "@/lib/google/drive-service";
import { decryptToken } from "@/lib/google/token-manager";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const travel = await getActiveTravel({ userId: session.user.id });

    if (!travel || !travel.driveFolderId) {
      return NextResponse.json({ files: [] });
    }

    const files = await getDriveFiles({ travelId: travel.id });

    // Add parsed status for each file
    const filesWithParsedStatus = await Promise.all(
      files.map(async (file) => {
        const parsedDoc = await getParsedDocumentByDriveFileId({
          driveFileId: file.driveFileId,
        });
        return {
          ...file,
          hasParsedDocument: !!parsedDoc,
        };
      })
    );

    return NextResponse.json({ files: filesWithParsedStatus });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const driveFileId = searchParams.get("driveFileId");

    if (!driveFileId) {
      return NextResponse.json(
        { error: "Missing driveFileId" },
        { status: 400 }
      );
    }

    const account = await getGoogleAccount({ userId: session.user.id });

    if (!account) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 401 }
      );
    }

    const decryptedAccessToken = decryptToken(account.accessToken);
    const driveClient = initializeDriveClient(decryptedAccessToken);

    // Get the file record from database to find its id
    const fileRecords = await db
      .select()
      .from(driveFile)
      .where(eq(driveFile.driveFileId, driveFileId));

    if (fileRecords.length === 0) {
      return NextResponse.json(
        { error: "File not found in database" },
        { status: 404 }
      );
    }

    const fileRecord = fileRecords[0];

    // Delete parsed document if it exists
    const parsedDoc = await getParsedDocumentByDriveFileId({ driveFileId });
    if (parsedDoc) {
      await db
        .delete(parsedDocument)
        .where(eq(parsedDocument.driveFileId, fileRecord.id));
    }

    // Delete linked document (artifact) if it exists
    if (fileRecord.documentId) {
      await db.delete(document).where(eq(document.id, fileRecord.documentId));
    }

    // Delete from Google Drive
    await driveClient.files.delete({ fileId: driveFileId });

    // Delete from database using the database id
    await deleteDriveFile({ id: fileRecord.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
