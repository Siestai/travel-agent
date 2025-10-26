"use client";

import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import type { User } from "next-auth";
import { SidebarUserNav } from "@/components/sidebar-user-nav";
import { TravelNavItems } from "@/components/travel-nav-items";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "@/components/ui/sidebar";

export function AppSidebar({ user }: { user: User | undefined }) {
  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row items-center gap-3 px-2 py-2">
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <Link className="flex flex-row items-center" href="/documents">
              <span className="cursor-pointer rounded-md font-semibold text-lg hover:bg-muted">
                Travel Agent
              </span>
            </Link>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <TravelNavItems />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
