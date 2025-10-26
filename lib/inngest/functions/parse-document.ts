import { eq } from "drizzle-orm";
import { db, saveParsedDocument } from "@/lib/db/queries";
import { driveFile, inngestStatus } from "@/lib/db/schema";
import { parseDocument } from "@/lib/parser/agents/parser-graph";
import { extractTextFromPDF } from "@/lib/parser/pdf-extractor";
import { inngest } from "../client";

export const parseDocumentFunction = inngest.createFunction(
  {
    id: "parse-document",
    retries: 3,
    onFailure: async ({ error, event }) => {
      console.error("[Inngest] Parse document failed:", error);

      // Update status to failed
      if (event.data.jobId && event.data.userId) {
        await db
          .update(inngestStatus)
          .set({
            status: "failed",
            error: error instanceof Error ? error.message : String(error),
            updatedAt: new Date(),
          })
          .where(eq(inngestStatus.jobId, event.data.jobId));
      }
    },
  },
  { event: "parser/document.parse" },
  async ({ event, step }) => {
    const {
      driveFileId,
      userId,
      fileContent,
      jobId,
      modelId = "ollama-qwen3-32b",
    } = event.data;

    // Step 1: Update status to running
    await step.run("update-status-running", () => {
      return db
        .update(inngestStatus)
        .set({
          status: "running",
          updatedAt: new Date(),
        })
        .where(eq(inngestStatus.jobId, jobId));
    });

    // Step 2: Get the database driveFile record to get the id
    const driveFileRecord = await step.run("get-drive-file", async () => {
      const files = await db
        .select()
        .from(driveFile)
        .where(eq(driveFile.driveFileId, driveFileId))
        .limit(1);
      return files[0];
    });

    if (!driveFileRecord) {
      throw new Error("Drive file not found in database");
    }

    // Step 3: Extract text from PDF
    const rawText = await step.run("extract-text", () => {
      return extractTextFromPDF(Buffer.from(fileContent, "base64"));
    });

    // Step 4: Run LangGraph parser with selected model
    const parsedResult = await step.run("parse-with-agents", () => {
      return parseDocument(rawText, modelId);
    });

    // Step 5: Save to database
    await step.run("save-results", async () => {
      await saveParsedDocument({
        driveFileId: driveFileRecord.id,
        userId,
        documentType: parsedResult.documentType as "housing" | "transportation",
        parsedData: parsedResult.validatedData || parsedResult.extractedData,
        confidence: parsedResult.confidence.toString(),
        rawText: rawText.substring(0, 50_000), // Limit text size
        inngestJobId: jobId,
      });

      // Update status to completed
      await db
        .update(inngestStatus)
        .set({
          status: "completed",
          updatedAt: new Date(),
        })
        .where(eq(inngestStatus.jobId, jobId));
    });

    return {
      success: true,
      documentType: parsedResult.documentType,
      confidence: parsedResult.confidence,
    };
  }
);
