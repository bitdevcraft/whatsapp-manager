import { cookies } from "next/headers";

import { AppSidebar } from "@/components/admin-layout/app-sidebar";
import { SiteHeader } from "@/components/admin-layout/site-header";
import { TitleProvider } from "@/components/title-provider";
import {
  SidebarInset,
  SidebarProvider,
} from "@workspace/ui/components/sidebar";
import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";
  return (
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
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </TitleProvider>
  );
}
