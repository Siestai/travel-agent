export type { DriveFile, GoogleAccount, Travel } from "@/lib/db/schema";

export type SyncStatus = "synced" | "pending" | "error";

export type ConnectionStatus = "connected" | "disconnected" | "loading";

export type DriveFileMetadata = {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  size?: string;
  modifiedTime?: string;
  iconLink?: string;
};

export type CreateTravelInput = {
  name: string;
};

export type UpdateTravelInput = {
  name?: string;
  isActive?: boolean;
  driveFolderId?: string;
};

export type ImportFileInput = {
  driveFileId: string;
  artifactType: "text" | "code" | "image" | "sheet";
  title: string;
};
