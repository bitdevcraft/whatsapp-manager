import { auth } from "@workspace/auth";
import { BannerList } from "@workspace/ui/components/banner";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { cookies, headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

import { AppSidebar } from "@/components/admin-layout/app-sidebar";
import { SiteHeader } from "@/components/admin-layout/site-header";
import { SocketProvider } from "@/components/provider/socket-provider";
import { TitleProvider } from "@/components/provider/title-provider";
import { getUsage } from "@/lib/db/usage-queries";

import AuthenticateWaba from "./_components/authenticate-waba";
import Notification from "./notification";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  const headers = await nextHeaders();

  const data = await auth.api.listOrganizations({ headers });

  const authSession = await auth.api.getSession({
    headers,
  });

  if (!authSession) {
    const pathname = headers.get("x-current-path");
    redirect(`/auth/login?path=${pathname}`);
  }

  const promises = Promise.all([getUsage()]);

  return (
    <div>
      <SocketProvider
        teamId={authSession.session.activeOrganizationId!}
        userId={authSession.user.id}
      >
        <AuthenticateWaba />
        <TitleProvider defaultTitle="">
          <SidebarProvider
            defaultOpen={defaultOpen}
            style={
              {
                "--header-height": "calc(var(--spacing) * 12)",
                "--sidebar-width": "calc(var(--spacing) * 72)",
              } as React.CSSProperties
            }
          >
            <div className="flex flex-1">
              <AppSidebar
                promises={promises}
                teams={data}
                user={authSession.user}
                variant="inset"
              />
              <SidebarInset>
                <div className="px-1">
                  <BannerList />
                </div>
                <div className="relative z-10">
                  <SiteHeader />
                </div>

                <div className="flex flex-1 flex-col relative">
                  <div className="@container/main flex flex-1 flex-col gap-2">
                    <div>
                      <div className="pointer-events-none fixed inset-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
                        <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
                        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
                      </div>
                    </div>
                    <div className="relative z-10">{children}</div>
                  </div>
                </div>
              </SidebarInset>
            </div>
          </SidebarProvider>
          <Toaster
            toastOptions={{
              classNames: {
                closeButton: "bg-white",
                error: "bg-red-50 text-red-700 border border-red-400",
                info: "bg-blue-50 text-blue-700 border border-blue-400",
                success: "bg-indigo-500 text-white border border-indigo-800",
                toast: "text-[15px] pr-16",
                warning:
                  "bg-orange-50 text-orange-700 border border-orange-400",
              },
              closeButton: true,
              duration: 10_000,
              style: {
                fontWeight: "lighter",
              },
            }}
          />
          <Notification />
        </TitleProvider>
      </SocketProvider>
    </div>
  );
}
