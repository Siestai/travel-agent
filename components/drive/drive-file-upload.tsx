"use client";

import { Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";

type DriveFileUploadProps = {
  onUploadComplete: () => void;
};

export function DriveFileUpload({ onUploadComplete }: DriveFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFiles = useCallback(
    async (files: File[]) => {
      setIsUploading(true);

      try {
        const formData = new FormData();
        for (const file of files) {
          formData.append("files", file);
        }

        console.log(`Starting upload of ${files.length} files`);
        const response = await fetch("/api/drive/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Upload result:", result);
          await onUploadComplete();
        } else {
          const errorText = await response.text();
          console.error("Upload failed:", response.status, errorText);
        }
      } catch (error) {
        console.error("Error uploading files:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadComplete]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) {
        return;
      }

      await uploadFiles(files);
    },
    [uploadFiles]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      return;
    }

    await uploadFiles(files);
  };

  return (
    <div
      className={`relative min-h-[200px] rounded-lg border-2 border-dashed transition-colors ${
        isDragging
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-muted-foreground/50"
      }`}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
        <Upload
          className={`h-12 w-12 ${isDragging ? "text-primary" : "text-muted-foreground"}`}
        />
        <div className="text-center">
          <p className="font-medium">Drop files here to upload</p>
          <p className="text-muted-foreground text-sm">
            or click to select files
          </p>
        </div>
        <input
          accept="*/*"
          className="hidden"
          id="file-upload"
          multiple
          onChange={handleFileSelect}
          type="file"
        />
        <Button asChild disabled={isUploading} variant="outline">
          <label htmlFor="file-upload">
            {isUploading ? "Uploading..." : "Choose Files"}
          </label>
        </Button>
      </div>
    </div>
  );
}
