import type { drive_v3 } from "googleapis";
import { google } from "googleapis";

export function initializeDriveClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.drive({ version: "v3", auth: oauth2Client });
}

export async function createFolder(
  driveClient: drive_v3.Drive,
  name: string,
  parentId?: string
): Promise<drive_v3.Schema$File> {
  const fileMetadata = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    ...(parentId && { parents: [parentId] }),
  };

  const response = await driveClient.files.create({
    requestBody: fileMetadata,
    fields: "id, name, webViewLink",
  });

  if (!response.data.id) {
    throw new Error("Failed to create folder");
  }

  return response.data;
}

export async function listFiles(
  driveClient: drive_v3.Drive,
  folderId: string
): Promise<drive_v3.Schema$File[]> {
  const response = await driveClient.files.list({
    q: `'${folderId}' in parents and trashed=false`,
    fields:
      "files(id, name, mimeType, webViewLink, size, modifiedTime, iconLink)",
    orderBy: "modifiedTime desc",
  });

  return response.data.files || [];
}

export async function uploadFile(
  driveClient: drive_v3.Drive,
  folderId: string,
  file: Express.Multer.File
): Promise<drive_v3.Schema$File> {
  const fileMetadata = {
    name: file.originalname,
    parents: [folderId],
  };

  // Convert Buffer to readable stream
  const { Readable } = await import("node:stream");
  const stream = Readable.from(file.buffer);

  const media = {
    mimeType: file.mimetype,
    body: stream,
  };

  const response = await driveClient.files.create({
    requestBody: fileMetadata,
    media,
    fields: "id, name, mimeType, webViewLink, size, modifiedTime",
  });

  if (!response.data.id) {
    throw new Error("Failed to upload file");
  }

  return response.data;
}

export async function deleteFile(
  driveClient: drive_v3.Drive,
  fileId: string
): Promise<void> {
  await driveClient.files.delete({
    fileId,
  });
}

export async function getFile(
  driveClient: drive_v3.Drive,
  fileId: string
): Promise<drive_v3.Schema$File> {
  const response = await driveClient.files.get({
    fileId,
    alt: "media",
  });

  return response.data;
}

export async function downloadFile(
  driveClient: drive_v3.Drive,
  fileId: string
): Promise<Buffer> {
  const response = await driveClient.files.get(
    {
      fileId,
      alt: "media",
    },
    { responseType: "arraybuffer" }
  );

  return Buffer.from(response.data as ArrayBuffer);
}

export async function getFileMetadata(
  driveClient: drive_v3.Drive,
  fileId: string
): Promise<drive_v3.Schema$File> {
  const response = await driveClient.files.get({
    fileId,
    fields: "id, name, mimeType, webViewLink, size, modifiedTime, iconLink",
  });

  return response.data;
}

export async function findFolderByName(
  driveClient: drive_v3.Drive,
  name: string,
  parentId?: string
): Promise<drive_v3.Schema$File | null> {
  let query = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  const response = await driveClient.files.list({
    q: query,
    fields: "files(id, name, webViewLink)",
  });

  return response.data.files && response.data.files.length > 0
    ? response.data.files[0]
    : null;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<{ accessToken: string; expiresIn: number }> {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/google/callback`
  );

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (!credentials.access_token) {
    throw new Error("Failed to refresh access token");
  }

  return {
    accessToken: credentials.access_token,
    expiresIn: credentials.expiry_date
      ? Math.floor((credentials.expiry_date - Date.now()) / 1000)
      : 3600,
  };
}
