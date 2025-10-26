import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getActiveTravel,
  getGoogleAccount,
  saveDriveFile,
} from "@/lib/db/queries";
import { initializeDriveClient, listFiles } from "@/lib/google/drive-service";
import { decryptToken } from "@/lib/google/token-manager";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const account = await getGoogleAccount({ userId: session.user.id });

    if (!account) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 401 }
      );
    }

    const travel = await getActiveTravel({ userId: session.user.id });

    if (!travel || !travel.driveFolderId) {
      return NextResponse.json(
        { error: "No active travel or folder" },
        { status: 400 }
      );
    }

    const decryptedAccessToken = decryptToken(account.accessToken);
    const driveClient = initializeDriveClient(decryptedAccessToken);

    const driveFiles = await listFiles(driveClient, travel.driveFolderId);

    const syncResults = await Promise.allSettled(
      driveFiles.map((file) => {
        if (!file.id || !file.name) {
          return null;
        }

        return saveDriveFile({
          travelId: travel.id,
          driveFileId: file.id,
          name: file.name,
          mimeType: file.mimeType || undefined,
          webViewLink: file.webViewLink || undefined,
        });
      })
    );

    const syncedCount = syncResults.filter(
      (r) => r.status === "fulfilled"
    ).length;

    return NextResponse.json({
      success: true,
      syncedCount,
      totalFiles: driveFiles.length,
    });
  } catch (error) {
    console.error("Error syncing files:", error);
    return NextResponse.json(
      { error: "Failed to sync files" },
      { status: 500 }
    );
  }
}
