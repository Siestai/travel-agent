"use client";

import { ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DriveFileListProps = {
  files: unknown[];
  onRefresh: () => void;
};

export function DriveFileList({ files, onRefresh }: DriveFileListProps) {
  const [fileToDelete, setFileToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleDeleteClick = (fileId: string, fileName: string) => {
    setFileToDelete({ id: fileId, name: fileName });
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) {
      return;
    }

    try {
      const response = await fetch(
        `/api/drive/files?driveFileId=${fileToDelete.id}`,
        { method: "DELETE" }
      );
      if (response.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error("Error deleting file:", error);
    } finally {
      setFileToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setFileToDelete(null);
  };

  if (files.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="font-medium text-lg">No files yet</p>
          <p className="text-muted-foreground text-sm">
            Upload files to Google Drive to see them here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => {
        const driveFile = file as {
          id: string;
          driveFileId: string;
          name: string;
          mimeType?: string;
          webViewLink?: string;
          createdAt?: string;
        };

        return (
          <Card
            className="transition-shadow hover:shadow-md"
            key={driveFile.id}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="line-clamp-2">
                    {driveFile.name}
                  </CardTitle>
                  <CardDescription>{driveFile.mimeType}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {driveFile.webViewLink && (
                  <Button asChild size="sm" variant="outline">
                    <a
                      href={driveFile.webViewLink}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      View
                    </a>
                  </Button>
                )}
                <Button
                  onClick={() =>
                    handleDeleteClick(driveFile.driveFileId, driveFile.name)
                  }
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <DeleteConfirmationDialog
        description="This file will be permanently deleted from Google Drive and cannot be recovered."
        onConfirm={handleDeleteConfirm}
        onOpenChange={handleDeleteCancel}
        open={fileToDelete !== null}
        title={`Delete ${fileToDelete?.name}?`}
      />
    </div>
  );
}
