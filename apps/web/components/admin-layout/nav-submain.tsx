"use client";

import { usePermission } from "@/hooks/user-permissions";
import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import Link from "next/link";
import React from "react";
import { useOrganization } from "../organization-provider";
import { Skeleton } from "@workspace/ui/components/skeleton";

export function NavSubMain({
  title = "Others",
  items,
}: {
  title?: string;
  items: {
    name: string;
    url: string;
    icon: Icon;
    access?: string;
  }[];
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
      <SidebarMenu>
        {items.map((item, i) => (
          <div key={i}>
            {item.access !== "business" ||
            (item.access === "business" && canRead) ? (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton tooltip={item.name} asChild>
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
