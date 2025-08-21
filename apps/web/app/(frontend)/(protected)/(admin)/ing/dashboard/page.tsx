import { ChartAreaInteractive } from "@/app/(frontend)/(protected)/(admin)/ing/dashboard/chart-area-interactive";
import { SectionCards } from "@/app/(frontend)/(protected)/(admin)/ing/dashboard/section-cards";

import { getDashboardAnalytics } from "@/features/dashboard/_lib/queries";
import { dashboardSearchParams } from "@/features/dashboard/_lib/validations";
import { SearchParams } from "@/types";
import React from "react";
import MarketingCampaignStats from "./marketing-campaign-stats";
import DeliveryStatus from "./delivery-status";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function Home(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = dashboardSearchParams.parse(searchParams);

  const promises = Promise.all([getDashboardAnalytics(search)]);

  return (
    <>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards promises={promises} />

            <div className="px-4 lg:px-6 grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MarketingCampaignStats promises={promises} />
                <DeliveryStatus promises={promises} />
              </div>
              {/* <ChartAreaInteractive /> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
