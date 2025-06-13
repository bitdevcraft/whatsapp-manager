"use client";

import { ChartAreaInteractive } from "@/components/admin-layout/chart-area-interactive";
import { DataTable } from "@/components/admin-layout/data-table";
import { SectionCards } from "@/components/admin-layout/section-cards";

import data from "./data.json";
import FacebookLogin from "@/components/facebook-login";

export default function Page() {
  const handleLoginSuccess = (response: any) => {
    console.log("Login success", response);
  };

  const handleLoginFailure = (error: string) => {
    console.error("Login failed", error);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <FacebookLogin
            appId="606557539005538"
            onLoginSuccess={handleLoginSuccess}
            onLoginFailure={handleLoginFailure}
          />
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
