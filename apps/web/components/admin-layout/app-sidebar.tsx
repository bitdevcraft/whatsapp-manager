"use client";

import {
  IconCirclePlusFilled,
  IconDashboard,
  IconMessages,
  IconSettings,
  IconSpeakerphone,
  IconTag,
  IconTemplate,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { Organization } from "better-auth/plugins/organization";
import { AudioWaveform, Command, GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { NavMain } from "@/components/admin-layout/nav-main";
import { NavSubMain } from "@/components/admin-layout/nav-submain";
import { NavUser } from "@/components/admin-layout/nav-user";
import { getUsage } from "@/lib/db/usage-queries";

import { TeamSwitcher } from "./team-switcher";
import { UsageProgress } from "./usage-progress";

const data = {
  ads: [
    {
      icon: IconSpeakerphone,
      name: "Ads Manager",
      url: "/ing/ads/ads-manager",
    },
  ],
  management: [
    {
      access: "business",
      icon: IconUserCircle,
      name: "Business Account",
      url: "/ing/business-account",
    },
    {
      icon: IconUsers,
      name: "Contacts",
      url: "/ing/contacts",
    },
    {
      icon: IconTag,
      name: "Tags",
      url: "/ing/tags",
    },
  ],
  navMain: [
    {
      icon: IconDashboard,
      title: "Dashboard",
      url: "/ing/dashboard",
    },
  ],
  navSecondary: [
    {
      icon: IconSettings,
      title: "Settings",
      url: "/ing/account/general",
    },
  ],
  teams: [
    {
      logo: GalleryVerticalEnd,
      name: "Acme Inc",
      plan: "Enterprise",
    },
    {
      logo: AudioWaveform,
      name: "Acme Corp.",
      plan: "Startup",
    },
    {
      logo: Command,
      name: "Evil Corp.",
      plan: "Free",
    },
  ],
  user: {
    avatar: "/avatars/shadcn.jpg",
    email: "m@example.com",
    name: "shadcn",
  },
  whatsapp: [
    {
      icon: IconSpeakerphone,
      name: "Marketing Campaigns",
      url: "/ing/whatsapp/marketing-campaigns",
    },
    {
      icon: IconMessages,
      name: "Conversations",
      url: "/ing/whatsapp/conversations",
    },
    // {
    //   name: "Ads Manager",
    //   url: "/ing/whatsapp/ads-manager",
    //   icon: IconAd,
    // },
    {
      icon: IconTemplate,
      name: "Templates",
      url: "/ing/whatsapp/templates",
    },
  ],
};

export function AppSidebar({
  promises,
  teams,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  promises: Promise<[Awaited<ReturnType<typeof getUsage>>]>;
  teams: Organization[];
  user: {
    createdAt: Date;
    email: string;
    emailVerified: boolean;
    id: string;
    image?: null | string | undefined | undefined | undefined;
    name: string;
    updatedAt: Date;
  };
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSubMain
          actionMenu={
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <SidebarMenuButton
                  asChild
                  className="border-2"
                  tooltip="Quick Create"
                >
                  <Link href={"/ing/whatsapp/marketing-campaigns/new"}>
                    <IconCirclePlusFilled />
                    <span>Create Campaign</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          }
          items={data.whatsapp}
          title="WhatsApp"
        ></NavSubMain>
        {/* <NavSubMain title="Ads" items={data.ads} /> */}
        <NavSubMain items={data.management} title="Management" />
      </SidebarContent>
      <SidebarFooter>
        <UsageProgress promises={promises} />
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
