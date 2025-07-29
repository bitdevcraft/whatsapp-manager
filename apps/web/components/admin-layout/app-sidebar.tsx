"use client";

import * as React from "react";
import {
  IconAd,
  IconBrandWhatsappFilled,
  IconDashboard,
  IconInnerShadowTop,
  IconMessages,
  IconSettings,
  IconSpeakerphone,
  IconTag,
  IconTemplate,
  IconUserCircle,
  IconUsers,
} from "@tabler/icons-react";

import { NavSubMain } from "@/components/admin-layout/nav-submain";
import { NavMain } from "@/components/admin-layout/nav-main";
import { NavSecondary } from "@/components/admin-layout/nav-secondary";
import { NavUser } from "@/components/admin-layout/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import { AudioWaveform, Command, GalleryVerticalEnd } from "lucide-react";
import { TeamSwitcher } from "./team-switcher";
import { Organization } from "better-auth/plugins/organization";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/ing/dashboard",
      icon: IconDashboard,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/ing/account",
      icon: IconSettings,
    },
  ],
  whatsapp: [
    {
      name: "Marketing Campaigns",
      url: "/ing/whatsapp/marketing-campaigns",
      icon: IconSpeakerphone,
    },
    {
      name: "Conversations",
      url: "/ing/whatsapp/conversations",
      icon: IconMessages,
    },
    // {
    //   name: "Ads Manager",
    //   url: "/ing/whatsapp/ads-manager",
    //   icon: IconAd,
    // },
    {
      name: "Templates",
      url: "/ing/whatsapp/templates",
      icon: IconTemplate,
    },
  ],
  ads: [
    {
      name: "Ads Manager",
      url: "/ing/ads/ads-manager",
      icon: IconSpeakerphone,
    },
  ],

  management: [
    {
      name: "Business Account",
      url: "/ing/business-account",
      icon: IconUserCircle,
    },
    {
      name: "Contacts",
      url: "/ing/contacts",
      icon: IconUsers,
    },
    {
      name: "Tags",
      url: "/ing/tags",
      icon: IconTag,
    },
  ],
};

export function AppSidebar({
  teams,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  teams: Organization[];
  user: {
    id: string;
    name: string;
    emailVerified: boolean;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null | undefined | undefined | undefined;
  };
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {/* <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconBrandWhatsappFilled className="!size-5" />
                <span className="text-base font-semibold">WAPP</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu> */}
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSubMain title="WhatsApp" items={data.whatsapp} />
        <NavSubMain title="Ads" items={data.ads} />
        <NavSubMain title="Management" items={data.management} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
