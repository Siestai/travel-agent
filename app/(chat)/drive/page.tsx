import type { Metadata } from "next";
import { Suspense } from "react";
import { DriveDashboard } from "@/components/drive/drive-dashboard";

export const metadata: Metadata = {
  title: "Google Drive",
  description: "Manage your travel documents with Google Drive integration",
};

export default function DrivePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DriveDashboard />
    </Suspense>
  );
}
