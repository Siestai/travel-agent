import type { drive_v3 } from "googleapis";
import {
  createFolder,
  type DriveFileMetadata,
  findFolderByName,
  listFiles,
} from "./drive-service";

const ROOT_FOLDER_NAME = "Siestai Travel Agent";

export async function ensureRootFolder(
  driveClient: drive_v3.Drive
): Promise<string> {
  const existing = await findFolderByName(driveClient, ROOT_FOLDER_NAME);
  if (existing?.id) {
    return existing.id;
  }

  const folder = await createFolder(driveClient, ROOT_FOLDER_NAME);
  if (!folder.id) {
    throw new Error("Failed to create root folder");
  }

  return folder.id;
}

export async function createTravelFolder(
  driveClient: drive_v3.Drive,
  travelName: string,
  rootFolderId: string
): Promise<string> {
  const folder = await createFolder(driveClient, travelName, rootFolderId);
  if (!folder.id) {
    throw new Error("Failed to create travel folder");
  }

  return folder.id;
}

export async function syncFolderContents(
  driveClient: drive_v3.Drive,
  folderId: string
): Promise<DriveFileMetadata[]> {
  const files = await listFiles(driveClient, folderId);

  return files
    .filter((file) => file.id && file.name)
    .map((file) => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType || "application/octet-stream",
      webViewLink: file.webViewLink || "",
      size: file.size,
      modifiedTime: file.modifiedTime || undefined,
      iconLink: file.iconLink || undefined,
    }));
}
