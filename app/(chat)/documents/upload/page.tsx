import { Upload } from "lucide-react";

export default function UploadPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="font-semibold text-2xl">Upload Document</h1>
        <p className="text-muted-foreground text-sm">
          Upload your travel documents to extract information
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-6">
          {/* TODO: Implement upload zone */}
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 font-semibold text-lg">
              Upload Travel Document
            </h3>
            <p className="mb-4 text-muted-foreground text-sm">
              Drop your PDF here or click to browse
            </p>
            <button
              className="rounded-lg bg-primary px-4 py-2 text-primary-foreground text-sm"
              type="button"
            >
              Select File
            </button>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              Or connect your Google Drive to import documents
            </p>
            <button
              className="mt-2 text-primary text-sm hover:underline"
              type="button"
            >
              Connect Google Drive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
