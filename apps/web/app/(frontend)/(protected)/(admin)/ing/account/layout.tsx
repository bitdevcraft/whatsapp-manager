"use client";

import { IconMoneybag } from "@tabler/icons-react";
import { Button } from "@workspace/ui/components/button";
import { Activity, Menu, Settings, Shield, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    {
      href: "/ing/account/general",
      icon: Settings,
      label: "General",
    },
    {
      href: "/ing/account/activity",
      icon: Activity,
      label: "Activity",
    },
    {
      href: "/ing/account/security",
      icon: Shield,
      label: "Security",
    },
    {
      href: "/ing/account/team",
      icon: Users,
      label: "Team",
    },
    {
      href: "/ing/account/pricing",
      icon: IconMoneybag,
      label: "Subscription",
    },
  ];

  return (
    <div className="flex flex-col min-h-[calc(100dvh-68px)] mx-auto w-full">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between bg-background border-b border-gray-200 p-4">
        <div className="flex items-center">
          <span className="font-medium">Settings</span>
        </div>
        <Button
          className="-mr-3"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          variant="ghost"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden h-full">
        {/* Sidebar */}
        <aside
          className={`w-64 bg-background border-r border-gray-200 lg:block ${
            isSidebarOpen ? "block" : "hidden"
          } lg:relative absolute inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="h-full overflow-y-auto p-4">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href} passHref>
                <Button
                  className={`shadow-none my-1 w-full justify-start ${
                    pathname === item.href ? "border" : ""
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-0 lg:p-4">{children}</main>
      </div>
    </div>
  );
}
