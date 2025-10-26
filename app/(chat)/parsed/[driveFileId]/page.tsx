import { redirect } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { ParsedDocumentView } from "@/components/parsed-document-view";
import { getParsedDocumentByDriveFileId } from "@/lib/db/queries";
import type { ParsedDocument } from "@/lib/db/schema";
import { ChatSDKError } from "@/lib/errors";

type SerializedParsedDocument = Omit<
  ParsedDocument,
  "createdAt" | "updatedAt"
> & {
  createdAt: string;
  updatedAt: string;
};

export default async function ParsedFilePage({
  params,
}: {
  params: Promise<{ driveFileId: string }>;
}) {
  const { driveFileId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  try {
    const parsedDoc = await getParsedDocumentByDriveFileId({ driveFileId });

    if (!parsedDoc) {
      throw new ChatSDKError("not_found:document", "Parsed document not found");
    }

    if (parsedDoc.userId !== session.user.id) {
      throw new ChatSDKError("forbidden:document", "Access denied");
    }

    // Serialize Date fields to strings for client component
    const serializedDoc: SerializedParsedDocument = {
      ...parsedDoc,
      createdAt:
        parsedDoc.createdAt instanceof Date
          ? parsedDoc.createdAt.toISOString()
          : parsedDoc.createdAt,
      updatedAt:
        parsedDoc.updatedAt instanceof Date
          ? parsedDoc.updatedAt.toISOString()
          : parsedDoc.updatedAt,
    };

    return (
      <div className="container mx-auto p-6">
        <ParsedDocumentView parsedDoc={serializedDoc} />
      </div>
    );
  } catch (error) {
    if (error instanceof ChatSDKError) {
      return error.toResponse();
    }
    console.error("Error loading parsed document:", error);
    redirect("/drive");
  }
}
