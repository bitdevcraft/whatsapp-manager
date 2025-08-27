"use client";

import { ProgressCircle } from "@workspace/ui/components/progress-circle";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import React from "react";

import { getUsage } from "@/lib/db/usage-queries";

export function UsageProgress({
  promises,
}: {
  promises: Promise<[Awaited<ReturnType<typeof getUsage>>]>;
}) {
  const [data] = React.use(promises);

  return (
    <SidebarMenu className="">
      <SidebarMenuItem className="space-y-1">
        <SidebarMenuButton
          className="gap-4"
          tooltip={`Personal Usage: ${Math.trunc(data.personal.usage)} / ${Math.trunc(data.personal.limit)}`}
        >
          <ProgressCircle
            className="scale-150"
            value={(data.personal.usage / (data.personal.limit ?? 1)) * 100}
          ></ProgressCircle>
          <div className="flex justify-between w-full">
            <p className="text-xs">Personal Usage</p>
            <p className="text-xs">
              {`${Math.trunc(data.personal.usage)} / ${Math.trunc(data.personal.limit)}`}
            </p>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem className="space-y-1">
        <SidebarMenuButton
          className="gap-4"
          tooltip={`Team Usage: ${Math.trunc(data.team.usage)} / ${Math.trunc(data.team.limit)}`}
        >
          <ProgressCircle
            className="scale-150"
            value={(data.team.usage / (data.team.limit ?? 1)) * 100}
          ></ProgressCircle>
          <div className="flex justify-between w-full">
            <p className="text-xs">Team Usage</p>
            <p className="text-xs">
              {`${Math.trunc(data.team.usage)} / ${Math.trunc(data.team.limit)}`}
            </p>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
