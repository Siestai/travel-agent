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
  updateGoogleAccount,
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

    // Check if access token is expired and refresh if needed
    let decryptedAccessToken = decryptToken(account.accessToken);
    let driveClient = initializeDriveClient(decryptedAccessToken);

    // Try to verify the token is valid by making a test request
    try {
      await driveClient.about.get({ fields: "user" });
    } catch {
      // Token is likely expired, refresh it
      console.log("Access token expired, attempting to refresh...");

      if (account.refreshToken) {
        const { refreshAccessToken } = await import(
          "@/lib/google/drive-service"
        );
        const { encryptToken } = await import("@/lib/google/token-manager");
        const decryptedRefreshToken = decryptToken(account.refreshToken);

        try {
          const { accessToken: newAccessToken } = await refreshAccessToken(
            decryptedRefreshToken
          );

          // Update the account with the new access token
          await updateGoogleAccount({
            userId: session.user.id,
            accessToken: encryptToken(newAccessToken),
          });

          decryptedAccessToken = newAccessToken;
          driveClient = initializeDriveClient(decryptedAccessToken);
        } catch (refreshError) {
          console.error("Failed to refresh access token:", refreshError);
          return NextResponse.json(
            {
              error:
                "Authentication expired. Please reconnect your Google account.",
            },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          {
            error:
              "Authentication expired. Please reconnect your Google account.",
          },
          { status: 401 }
        );
      }
    }

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
