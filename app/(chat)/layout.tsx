import Script from "next/script";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";
import { DataStreamProvider } from "@/components/data-stream-provider";
import { FloatingChat } from "@/components/floating-chat";
import { SidebarAlwaysOpen } from "@/components/sidebar/sidebar-always-open";
import { SidebarInset } from "@/components/ui/sidebar";
import { auth } from "../(auth)/auth";

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <AuthGuard>
        <DataStreamProvider>
          <SidebarAlwaysOpen>
            <AppSidebar user={session?.user} />
            <SidebarInset>{children}</SidebarInset>
          </SidebarAlwaysOpen>
          <FloatingChat />
        </DataStreamProvider>
      </AuthGuard>
    </>
  );
}
