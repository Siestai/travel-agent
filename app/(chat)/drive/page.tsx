import type { Metadata } from "next";
import { Suspense } from "react";
import { DriveDashboard } from "@/components/drive/drive-dashboard";
import { Loader } from "@/components/elements/loader";

export const metadata: Metadata = {
  title: "Google Drive",
  description: "Manage your travel documents with Google Drive integration",
};

export default function DrivePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full min-h-[60vh] w-full items-center justify-center p-6">
          <Loader size={24} className="text-muted-foreground" />
        </div>
      }
    >
      <DriveDashboard />
    </Suspense>
  );
}
