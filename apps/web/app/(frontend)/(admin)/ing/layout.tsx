import { cookies } from "next/headers";

import { AppSidebar } from "@/components/admin-layout/app-sidebar";
import { SiteHeader } from "@/components/admin-layout/site-header";
import { TitleProvider } from "@/components/provider/title-provider";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { BannerList } from "@workspace/ui/components/banner";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { FeatureFlagsProvider } from "@/components/provider/feature-flags-provider";
import Script from "next/script";
import AuthenticateWaba from "./_components/authenticate-waba";
import { SocketProvider } from "@/components/provider/socket-provider";
import { getUserWithTeam } from "@/lib/db/queries";
import { redirect } from "next/navigation";

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
                <div className="px-1">
                  <BannerList />
                </div>
                <SiteHeader />
                <div className="flex flex-1 flex-col">
                  <div className="@container/main flex flex-1 flex-col gap-2">
                    {children}
                  </div>
                </div>
              </SidebarInset>
            </div>
          </SidebarProvider>
          <Toaster />
        </TitleProvider>
      </SocketProvider>
    </>
  );
}
