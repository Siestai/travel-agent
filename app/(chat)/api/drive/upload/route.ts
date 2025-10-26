import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  getActiveTravel,
  getGoogleAccount,
  saveDriveFile,
} from "@/lib/db/queries";
import { initializeDriveClient, uploadFile } from "@/lib/google/drive-service";
import { decryptToken } from "@/lib/google/token-manager";

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    const uploadResults = await Promise.allSettled(
      files.map(async (file) => {
        try {
          const buffer = await file.arrayBuffer();
          const fileBlob = {
            buffer: Buffer.from(buffer),
            mimetype: file.type || "application/octet-stream",
            originalname: file.name,
          };

          console.log(`Uploading file: ${file.name} (${file.size} bytes)`);
          console.log(`Uploading to folder: ${travel.driveFolderId}`);

          const driveFileData = await uploadFile(
            driveClient,
            travel.driveFolderId,
            fileBlob as Express.Multer.File
          );

          console.log(`Upload successful: ${driveFileData.id}`);

          if (!driveFileData.id || !driveFileData.name) {
            throw new Error("Invalid file data from Drive");
          }

          await saveDriveFile({
            travelId: travel.id,
            driveFileId: driveFileData.id,
            name: driveFileData.name,
            mimeType: driveFileData.mimeType || undefined,
            webViewLink: driveFileData.webViewLink || undefined,
          });

          return { success: true, name: file.name };
        } catch (uploadError) {
          console.error(`Failed to upload ${file.name}:`, uploadError);
          throw uploadError;
        }
      })
    );

    const successCount = uploadResults.filter(
      (r) => r.status === "fulfilled"
    ).length;

    const failedCount = files.length - successCount;
    const failures = uploadResults
      .filter((r) => r.status === "rejected")
      .map((r) => {
        if (r.status === "rejected") {
          const error = r.reason;
          console.error("Upload rejection details:", {
            error,
            message: error?.message,
            stack: error?.stack,
            name: error?.name,
          });
          return error?.message || "Unknown error";
        }
        return null;
      })
      .filter(Boolean);

    console.log(
      `Upload complete: ${successCount} successful, ${failedCount} failed`
    );

    if (failedCount > 0) {
      console.error("Failed uploads:", failures);
      console.error(
        "Full rejection details:",
        uploadResults.filter((r) => r.status === "rejected")
      );
    }

    return NextResponse.json({
      success: true,
      uploaded: successCount,
      total: files.length,
      failed: failedCount,
      errors: failures.length > 0 ? failures : undefined,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to upload files";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
