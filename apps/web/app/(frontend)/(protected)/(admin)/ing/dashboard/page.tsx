import { ChartAreaInteractive } from "@/app/(frontend)/(protected)/(admin)/ing/dashboard/chart-area-interactive";
import { SectionCards } from "@/app/(frontend)/(protected)/(admin)/ing/dashboard/section-cards";

import FacebookLogin from "@/components/facebook-login";
import { getDashboardAnalytics } from "@/features/dashboard/_lib/queries";
import { dashboardSearchParams } from "@/features/dashboard/_lib/validations";
import { logger } from "@/lib/logger";
import { SearchParams } from "@/types";
import { banner } from "@workspace/ui/components/banner";
import { registerBanner } from "@workspace/ui/components/banner/banner-registry";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import axios from "axios";
import Script from "next/script";
import React from "react";
import MarketingCampaignDashboard from "../whatsapp/marketing-campaigns/[id]/marketing-campaign-dashboard";
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
              <ChartAreaInteractive />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
