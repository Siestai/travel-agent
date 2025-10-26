import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import {
  db,
  getGoogleAccount,
  saveInngestStatus,
  saveParsedDocument,
  updateInngestStatus,
} from "@/lib/db/queries";
import { driveFile, googleAccount } from "@/lib/db/schema";
import {
  downloadFile,
  initializeDriveClient,
  refreshAccessToken,
} from "@/lib/google/drive-service";
import { decryptToken, encryptToken } from "@/lib/google/token-manager";
import { inngest } from "@/lib/inngest/client";
import { parseDocument } from "@/lib/parser/agents/parser-graph";
import { extractTextFromPDF } from "@/lib/parser/pdf-extractor";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { driveFileId, modelId = "ollama-qwen3-32b" } = await request.json();

    if (!driveFileId) {
      return NextResponse.json(
        { error: "Missing driveFileId" },
        { status: 400 }
      );
    }

    // Get Google account
    const account = await getGoogleAccount({ userId: session.user.id });

    if (!account) {
      return NextResponse.json(
        { error: "Google account not connected" },
        { status: 401 }
      );
    }

    // Download file from Drive with token refresh on 401
    let decryptedAccessToken = decryptToken(account.accessToken);
    let driveClient = initializeDriveClient(decryptedAccessToken);
    let fileBuffer: Buffer;

    try {
      fileBuffer = await downloadFile(driveClient, driveFileId);
    } catch (error) {
      // If 401 error, refresh token and retry
      if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 401
      ) {
        console.log("Access token expired, refreshing...");
        try {
          const refreshed = await refreshAccessToken(account.refreshToken);
          const encryptedToken = encryptToken(refreshed.accessToken);

          // Update token in database
          await db
            .update(googleAccount)
            .set({ accessToken: encryptedToken })
            .where(eq(googleAccount.id, account.id));

          // Retry with new token
          decryptedAccessToken = refreshed.accessToken;
          driveClient = initializeDriveClient(decryptedAccessToken);
          fileBuffer = await downloadFile(driveClient, driveFileId);
        } catch (refreshError) {
          console.error("Failed to refresh Google token:", refreshError);
          throw new Error(
            "Google Drive authentication failed. Please reconnect your Google account."
          );
        }
      } else {
        throw error;
      }
    }

    // Create Inngest status record
    const jobId = generateUUID();
    await saveInngestStatus({
      jobId,
      userId: session.user.id,
      jobType: "parse_document",
      metadata: { driveFileId },
    });

    // Trigger Inngest job
    // If INNGEST_EVENT_KEY is not set, we process synchronously for local development
    if (process.env.INNGEST_EVENT_KEY) {
      await inngest.send({
        name: "parser/document.parse",
        data: {
          driveFileId,
          userId: session.user.id,
          fileContent: fileBuffer.toString("base64"),
          jobId,
          modelId,
        },
      });
    } else {
      console.warn(
        "INNGEST_EVENT_KEY not set. Processing synchronously for local development."
      );

      // Process synchronously without Inngest
      try {
        await updateInngestStatus({ jobId, status: "running" });

        // Get the database driveFile record
        const files = await db
          .select()
          .from(driveFile)
          .where(eq(driveFile.driveFileId, driveFileId))
          .limit(1);

        if (!files[0]) {
          throw new Error("Drive file not found in database");
        }

        const driveFileRecord = files[0];

        // Extract text from PDF
        const rawText = await extractTextFromPDF(fileBuffer);

        // Run LangGraph parser with selected model
        const parsedResult = await parseDocument(rawText, modelId);

        // Save to database
        await saveParsedDocument({
          driveFileId: driveFileRecord.id,
          userId: session.user.id,
          documentType: parsedResult.documentType as
            | "housing"
            | "transportation",
          parsedData: parsedResult.validatedData || parsedResult.extractedData,
          confidence: parsedResult.confidence.toString(),
          rawText: rawText.substring(0, 50_000),
          inngestJobId: jobId,
        });

        await updateInngestStatus({ jobId, status: "completed" });
      } catch (error) {
        console.error("Error processing document synchronously:", error);
        await updateInngestStatus({
          jobId,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({ jobId, status: "pending" });
  } catch (error) {
    console.error("Error triggering parser:", error);
    return NextResponse.json(
      { error: "Failed to trigger parser" },
      { status: 500 }
    );
  }
}
