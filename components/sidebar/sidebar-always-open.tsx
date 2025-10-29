"use client";

import { SidebarProvider } from "@/components/ui/sidebar";

export function SidebarAlwaysOpen({ children }: { children: React.ReactNode }) {
  // Force sidebar to always be open by controlling it as a controlled component
  return (
    <SidebarProvider
      defaultOpen={true}
      onOpenChange={() => {
        // Prevent sidebar from being closed - always keep it open
      }}
      open={true}
    >
      {children}
    </SidebarProvider>
  );
}
