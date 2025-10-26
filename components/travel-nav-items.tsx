"use client";

import {
  Calendar,
  FolderOpen,
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
  { title: "Drive", href: "/drive", icon: FolderOpen },
  { title: "Chat", href: "/chat", icon: MessageSquare },
  { title: "Maps", href: "/maps", icon: MapIcon },
  { title: "Timeline", href: "/timeline", icon: Calendar },
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
