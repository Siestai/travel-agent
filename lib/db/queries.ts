import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gt,
  gte,
  inArray,
  lt,
  type SQL,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { ArtifactKind } from "@/components/artifact";
import type { VisibilityType } from "@/components/visibility-selector";
import { ChatSDKError } from "../errors";
import type { AppUsage } from "../usage";
import { generateUUID } from "../utils";
import {
  type Chat,
  chat,
  type DBMessage,
  document,
  driveFile,
  googleAccount,
  inngestStatus,
  message,
  parsedDocument,
  type Suggestion,
  stream,
  suggestion,
  travel,
  type User,
  user,
  vote,
} from "./schema";
import { generateHashedPassword } from "./utils";

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

// biome-ignore lint: Forbidden non-null assertion.
const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client);

export async function getUser(email: string): Promise<User[]> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get user by email"
    );
  }
}

export async function createUser(email: string, password: string) {
  const hashedPassword = generateHashedPassword(password);

  try {
    return await db.insert(user).values({ email, password: hashedPassword });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create user");
  }
}

export async function findOrCreateUser(email: string) {
  try {
    const users = await getUser(email);
    if (users.length > 0) {
      return users[0];
    }

    // Create a new user without a password (OAuth user)
    const [newUser] = await db
      .insert(user)
      .values({ email, password: null })
      .returning();

    return newUser;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to find or create user"
    );
  }
}

export async function createGuestUser() {
  const email = `guest-${Date.now()}`;
  const password = generateHashedPassword(generateUUID());

  try {
    return await db.insert(user).values({ email, password }).returning({
      id: user.id,
      email: user.email,
    });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create guest user"
    );
  }
}

export async function saveChat({
  id,
  userId,
  title,
  visibility,
}: {
  id: string;
  userId: string;
  title: string;
  visibility: VisibilityType;
}) {
  try {
    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      userId,
      title,
      visibility,
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save chat");
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await db.delete(vote).where(eq(vote.chatId, id));
    await db.delete(message).where(eq(message.chatId, id));
    await db.delete(stream).where(eq(stream.chatId, id));

    const [chatsDeleted] = await db
      .delete(chat)
      .where(eq(chat.id, id))
      .returning();
    return chatsDeleted;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete chat by id"
    );
  }
}

export async function deleteAllChatsByUserId({ userId }: { userId: string }) {
  try {
    const userChats = await db
      .select({ id: chat.id })
      .from(chat)
      .where(eq(chat.userId, userId));

    if (userChats.length === 0) {
      return { deletedCount: 0 };
    }

    const chatIds = userChats.map((c) => c.id);

    await db.delete(vote).where(inArray(vote.chatId, chatIds));
    await db.delete(message).where(inArray(message.chatId, chatIds));
    await db.delete(stream).where(inArray(stream.chatId, chatIds));

    const deletedChats = await db
      .delete(chat)
      .where(eq(chat.userId, userId))
      .returning();

    return { deletedCount: deletedChats.length };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete all chats by user id"
    );
  }
}

export async function getChatsByUserId({
  id,
  limit,
  startingAfter,
  endingBefore,
}: {
  id: string;
  limit: number;
  startingAfter: string | null;
  endingBefore: string | null;
}) {
  try {
    const extendedLimit = limit + 1;

    const query = (whereCondition?: SQL<any>) =>
      db
        .select()
        .from(chat)
        .where(
          whereCondition
            ? and(whereCondition, eq(chat.userId, id))
            : eq(chat.userId, id)
        )
        .orderBy(desc(chat.createdAt))
        .limit(extendedLimit);

    let filteredChats: Chat[] = [];

    if (startingAfter) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, startingAfter))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${startingAfter} not found`
        );
      }

      filteredChats = await query(gt(chat.createdAt, selectedChat.createdAt));
    } else if (endingBefore) {
      const [selectedChat] = await db
        .select()
        .from(chat)
        .where(eq(chat.id, endingBefore))
        .limit(1);

      if (!selectedChat) {
        throw new ChatSDKError(
          "not_found:database",
          `Chat with id ${endingBefore} not found`
        );
      }

      filteredChats = await query(lt(chat.createdAt, selectedChat.createdAt));
    } else {
      filteredChats = await query();
    }

    const hasMore = filteredChats.length > limit;

    return {
      chats: hasMore ? filteredChats.slice(0, limit) : filteredChats,
      hasMore,
    };
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get chats by user id"
    );
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    if (!selectedChat) {
      return null;
    }

    return selectedChat;
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get chat by id");
  }
}

export async function saveMessages({ messages }: { messages: DBMessage[] }) {
  try {
    return await db.insert(message).values(messages);
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save messages");
  }
}

export async function getMessagesByChatId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(message)
      .where(eq(message.chatId, id))
      .orderBy(asc(message.createdAt));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get messages by chat id"
    );
  }
}

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: string;
  messageId: string;
  type: "up" | "down";
}) {
  try {
    const [existingVote] = await db
      .select()
      .from(vote)
      .where(and(eq(vote.messageId, messageId)));

    if (existingVote) {
      return await db
        .update(vote)
        .set({ isUpvoted: type === "up" })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    }
    return await db.insert(vote).values({
      chatId,
      messageId,
      isUpvoted: type === "up",
    });
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to vote message");
  }
}

export async function getVotesByChatId({ id }: { id: string }) {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get votes by chat id"
    );
  }
}

export async function saveDocument({
  id,
  title,
  kind,
  content,
  userId,
}: {
  id: string;
  title: string;
  kind: ArtifactKind;
  content: string;
  userId: string;
}) {
  try {
    return await db
      .insert(document)
      .values({
        id,
        title,
        kind,
        content,
        userId,
        createdAt: new Date(),
      })
      .returning();
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save document");
  }
}

export async function getDocumentsById({ id }: { id: string }) {
  try {
    const documents = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));

    return documents;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get documents by id"
    );
  }
}

export async function getDocumentById({ id }: { id: string }) {
  try {
    const [selectedDocument] = await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(desc(document.createdAt));

    return selectedDocument;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get document by id"
    );
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp)
        )
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)))
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete documents by id after timestamp"
    );
  }
}

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save suggestions"
    );
  }
}

export async function getSuggestionsByDocumentId({
  documentId,
}: {
  documentId: string;
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(and(eq(suggestion.documentId, documentId)));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get suggestions by document id"
    );
  }
}

export async function getMessageById({ id }: { id: string }) {
  try {
    return await db.select().from(message).where(eq(message.id, id));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message by id"
    );
  }
}

export async function deleteMessagesByChatIdAfterTimestamp({
  chatId,
  timestamp,
}: {
  chatId: string;
  timestamp: Date;
}) {
  try {
    const messagesToDelete = await db
      .select({ id: message.id })
      .from(message)
      .where(
        and(eq(message.chatId, chatId), gte(message.createdAt, timestamp))
      );

    const messageIds = messagesToDelete.map(
      (currentMessage) => currentMessage.id
    );

    if (messageIds.length > 0) {
      await db
        .delete(vote)
        .where(
          and(eq(vote.chatId, chatId), inArray(vote.messageId, messageIds))
        );

      return await db
        .delete(message)
        .where(
          and(eq(message.chatId, chatId), inArray(message.id, messageIds))
        );
    }
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete messages by chat id after timestamp"
    );
  }
}

export async function updateChatVisiblityById({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: "private" | "public";
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update chat visibility by id"
    );
  }
}

export async function updateChatLastContextById({
  chatId,
  context,
}: {
  chatId: string;
  // Store merged server-enriched usage object
  context: AppUsage;
}) {
  try {
    return await db
      .update(chat)
      .set({ lastContext: context })
      .where(eq(chat.id, chatId));
  } catch (error) {
    console.warn("Failed to update lastContext for chat", chatId, error);
    return;
  }
}

export async function getMessageCountByUserId({
  id,
  differenceInHours,
}: {
  id: string;
  differenceInHours: number;
}) {
  try {
    const twentyFourHoursAgo = new Date(
      Date.now() - differenceInHours * 60 * 60 * 1000
    );

    const [stats] = await db
      .select({ count: count(message.id) })
      .from(message)
      .innerJoin(chat, eq(message.chatId, chat.id))
      .where(
        and(
          eq(chat.userId, id),
          gte(message.createdAt, twentyFourHoursAgo),
          eq(message.role, "user")
        )
      )
      .execute();

    return stats?.count ?? 0;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get message count by user id"
    );
  }
}

export async function createStreamId({
  streamId,
  chatId,
}: {
  streamId: string;
  chatId: string;
}) {
  try {
    await db
      .insert(stream)
      .values({ id: streamId, chatId, createdAt: new Date() });
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to create stream id"
    );
  }
}

export async function getStreamIdsByChatId({ chatId }: { chatId: string }) {
  try {
    const streamIds = await db
      .select({ id: stream.id })
      .from(stream)
      .where(eq(stream.chatId, chatId))
      .orderBy(asc(stream.createdAt))
      .execute();

    return streamIds.map(({ id }) => id);
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get stream ids by chat id"
    );
  }
}

// Google Account queries

export async function saveGoogleAccount({
  userId,
  googleId,
  email,
  accessToken,
  refreshToken,
  expiresAt,
}: {
  userId: string;
  googleId: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  expiresAt?: Date;
}) {
  try {
    return await db
      .insert(googleAccount)
      .values({
        userId,
        googleId,
        email,
        accessToken,
        refreshToken,
        tokenExpiresAt: expiresAt,
      })
      .onConflictDoUpdate({
        target: googleAccount.googleId,
        set: {
          userId,
          email,
          accessToken,
          refreshToken,
          tokenExpiresAt: expiresAt,
          updatedAt: new Date(),
        },
      })
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save Google account"
    );
  }
}

export async function getGoogleAccount({ userId }: { userId: string }) {
  try {
    const accounts = await db
      .select()
      .from(googleAccount)
      .where(eq(googleAccount.userId, userId))
      .limit(1);

    return accounts[0];
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get Google account"
    );
  }
}

export async function updateGoogleAccount({
  userId,
  accessToken,
  refreshToken,
  expiresAt,
}: {
  userId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: Date;
}) {
  try {
    return await db
      .update(googleAccount)
      .set({
        ...(accessToken && { accessToken }),
        ...(refreshToken && { refreshToken }),
        ...(expiresAt && { tokenExpiresAt: expiresAt }),
        updatedAt: new Date(),
      })
      .where(eq(googleAccount.userId, userId))
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update Google tokens"
    );
  }
}

export async function deleteGoogleAccount({ userId }: { userId: string }) {
  try {
    return await db
      .delete(googleAccount)
      .where(eq(googleAccount.userId, userId))
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete Google account"
    );
  }
}

// Travel queries

export async function createTravel({
  userId,
  name,
}: {
  userId: string;
  name: string;
}) {
  try {
    return await db
      .insert(travel)
      .values({
        userId,
        name,
      })
      .returning();
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to create travel");
  }
}

export async function updateTravel({
  id,
  data,
}: {
  id: string;
  data: { name?: string; isActive?: boolean; driveFolderId?: string };
}) {
  try {
    return await db
      .update(travel)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(travel.id, id))
      .returning();
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to update travel");
  }
}

export async function getActiveTravel({ userId }: { userId: string }) {
  try {
    const travels = await db
      .select()
      .from(travel)
      .where(and(eq(travel.userId, userId), eq(travel.isActive, true)))
      .limit(1);

    return travels[0];
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get active travel"
    );
  }
}

export async function setActiveTravel({
  userId,
  travelId,
}: {
  userId: string;
  travelId: string;
}) {
  try {
    await db
      .update(travel)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(travel.userId, userId));

    return await db
      .update(travel)
      .set({ isActive: true, updatedAt: new Date() })
      .where(eq(travel.id, travelId))
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to set active travel"
    );
  }
}

export async function getTravels({ userId }: { userId: string }) {
  try {
    return await db
      .select()
      .from(travel)
      .where(eq(travel.userId, userId))
      .orderBy(desc(travel.createdAt));
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get travels");
  }
}

// Drive file queries

export async function saveDriveFile({
  travelId,
  driveFileId,
  name,
  mimeType,
  webViewLink,
}: {
  travelId: string;
  driveFileId: string;
  name: string;
  mimeType?: string;
  webViewLink?: string;
}) {
  try {
    return await db
      .insert(driveFile)
      .values({
        travelId,
        driveFileId,
        name,
        mimeType,
        webViewLink,
        syncStatus: "synced",
        lastSyncedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: driveFile.driveFileId,
        set: {
          name,
          mimeType,
          webViewLink,
          syncStatus: "synced",
          lastSyncedAt: new Date(),
        },
      })
      .returning();
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to save Drive file");
  }
}

export async function getDriveFiles({ travelId }: { travelId: string }) {
  try {
    return await db
      .select()
      .from(driveFile)
      .where(eq(driveFile.travelId, travelId))
      .orderBy(desc(driveFile.createdAt));
  } catch (_error) {
    throw new ChatSDKError("bad_request:database", "Failed to get Drive files");
  }
}

export async function updateDriveFile({
  id,
  data,
}: {
  id: string;
  data: { documentId?: string; syncStatus?: "synced" | "pending" | "error" };
}) {
  try {
    return await db
      .update(driveFile)
      .set(data)
      .where(eq(driveFile.id, id))
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update Drive file"
    );
  }
}

export async function deleteDriveFile({ id }: { id: string }) {
  try {
    return await db.delete(driveFile).where(eq(driveFile.id, id)).returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to delete Drive file"
    );
  }
}

export async function linkDriveFileToDocument({
  driveFileId,
  documentId,
}: {
  driveFileId: string;
  documentId: string;
}) {
  try {
    return await db
      .update(driveFile)
      .set({ documentId })
      .where(eq(driveFile.driveFileId, driveFileId))
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to link Drive file to document"
    );
  }
}

// Inngest status queries

export async function saveInngestStatus({
  jobId,
  userId,
  jobType,
  metadata,
}: {
  jobId: string;
  userId: string;
  jobType: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    return await db
      .insert(inngestStatus)
      .values({
        jobId,
        userId,
        jobType,
        metadata: metadata || null,
      })
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save Inngest status"
    );
  }
}

export async function updateInngestStatus({
  jobId,
  status,
  error,
}: {
  jobId: string;
  status: "pending" | "running" | "completed" | "failed";
  error?: string;
}) {
  try {
    return await db
      .update(inngestStatus)
      .set({
        status,
        error: error || null,
        updatedAt: new Date(),
      })
      .where(eq(inngestStatus.jobId, jobId))
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to update Inngest status"
    );
  }
}

export async function getInngestStatusByJobId({ jobId }: { jobId: string }) {
  try {
    const results = await db
      .select()
      .from(inngestStatus)
      .where(eq(inngestStatus.jobId, jobId))
      .limit(1);
    return results[0] || null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get Inngest status"
    );
  }
}

// Parsed document queries

export async function saveParsedDocument({
  driveFileId,
  userId,
  documentType,
  parsedData,
  confidence,
  rawText,
  inngestJobId,
}: {
  driveFileId: string;
  userId: string;
  documentType: "housing" | "transportation";
  parsedData: Record<string, unknown>;
  confidence: string;
  rawText: string | null;
  inngestJobId: string;
}) {
  try {
    // Check if already exists and update, otherwise insert
    const existing = await db
      .select()
      .from(parsedDocument)
      .where(eq(parsedDocument.driveFileId, driveFileId))
      .limit(1);

    if (existing[0]) {
      return await db
        .update(parsedDocument)
        .set({
          parsedData,
          confidence,
          rawText: rawText || null,
          updatedAt: new Date(),
        })
        .where(eq(parsedDocument.driveFileId, driveFileId))
        .returning();
    }

    return await db
      .insert(parsedDocument)
      .values({
        driveFileId,
        userId,
        documentType,
        parsedData,
        confidence,
        rawText: rawText || null,
        inngestJobId,
      })
      .returning();
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to save parsed document"
    );
  }
}

export async function getParsedDocumentByDriveFileId({
  driveFileId,
}: {
  driveFileId: string;
}) {
  try {
    // First get the DB id from the drive file
    const driveFiles = await db
      .select()
      .from(driveFile)
      .where(eq(driveFile.driveFileId, driveFileId))
      .limit(1);

    if (!driveFiles[0]) {
      return null;
    }

    const parsedDocs = await db
      .select()
      .from(parsedDocument)
      .where(eq(parsedDocument.driveFileId, driveFiles[0].id))
      .limit(1);

    return parsedDocs[0] || null;
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get parsed document"
    );
  }
}

export async function getParsedDocumentsByUserId({
  userId,
}: {
  userId: string;
}) {
  try {
    return await db
      .select()
      .from(parsedDocument)
      .where(eq(parsedDocument.userId, userId))
      .orderBy(desc(parsedDocument.createdAt));
  } catch (_error) {
    throw new ChatSDKError(
      "bad_request:database",
      "Failed to get parsed documents"
    );
  }
}
