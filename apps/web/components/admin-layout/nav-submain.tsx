"use client";

import { type Icon } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";
import React from "react";

import { usePermission } from "@/hooks/user-permissions";

import { useOrganization } from "../provider/organization-provider";

export function NavSubMain({
  actionMenu,
  items,
  title = "Others",
}: {
  actionMenu?: React.ReactNode;
  items: {
    access?: string;
    icon: Icon;
    name: string;
    url: string;
  }[];
  title?: string;
}) {
  const { activeOrganization } = useOrganization();

  const { data: canRead, isLoading } = usePermission(
    {
      // @ts-expect-error statement
      business: ["read"],
    },
    activeOrganization
  );

  if (isLoading)
    return (
      <SidebarGroup>
        <SidebarGroupLabel>{title}</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <Skeleton className="h-4 w-full" />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Skeleton className="h-4 w-full" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    );

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      {actionMenu}
      <SidebarMenu>
        {items.map((item, i) => (
          <div key={i}>
            {item.access !== "business" ||
            (item.access === "business" && canRead) ? (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild tooltip={item.name}>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.name}</span>
                    {canRead}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ) : (
              <></>
            )}
          </div>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
