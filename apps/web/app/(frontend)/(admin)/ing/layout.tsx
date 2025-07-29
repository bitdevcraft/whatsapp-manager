import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import Script from "next/script";

import { AppSidebar } from "@/components/admin-layout/app-sidebar";
import { SiteHeader } from "@/components/admin-layout/site-header";
import { TitleProvider } from "@/components/provider/title-provider";
import { FeatureFlagsProvider } from "@/components/provider/feature-flags-provider";
import { SocketProvider } from "@/components/provider/socket-provider";
import { BannerArea } from "@/components/banner/banner-area";
import { getUserWithTeam } from "@/lib/db/queries";

import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import AuthenticateWaba from "./_components/authenticate-waba";
import Notification from "./notification";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    redirect("/sign-in");
  }

  const { user, teamId } = userWithTeam;

  return (
    <>
      <SocketProvider userId={user.id} teamId={teamId}>
        <AuthenticateWaba />
        <TitleProvider defaultTitle="">
          <SidebarProvider
            defaultOpen={defaultOpen}
            style={
              {
                "--sidebar-width": "calc(var(--spacing) * 72)",
                "--header-height": "calc(var(--spacing) * 12)",
              } as React.CSSProperties
            }
          >
            <div className="flex flex-1">
              <AppSidebar variant="inset" />
              <SidebarInset>
                <BannerArea />
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                  <div className="@container/main flex flex-1 flex-col gap-2">
                    {children}
                  </div>
                </div>
              </SidebarInset>
            </div>
          </SidebarProvider>
          <Toaster
            toastOptions={{
              duration: 10000,
            }}
          />
          <Notification />
        </TitleProvider>
      </SocketProvider>
    </>
  );
}
