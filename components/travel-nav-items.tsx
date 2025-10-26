"use client";

import {
  FileText,
  Map as MapIcon,
  MessageSquare,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "Chat", href: "/chat", icon: MessageSquare },
  { title: "Maps", href: "/maps", icon: MapIcon },
  { title: "Settings", href: "/settings", icon: Settings },
];

export function TravelNavItems() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname?.startsWith(item.href));

        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton asChild isActive={isActive}>
              <Link
                className="flex items-center gap-3"
                href={item.href}
                onClick={() => {
                  setOpenMobile(false);
                }}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
