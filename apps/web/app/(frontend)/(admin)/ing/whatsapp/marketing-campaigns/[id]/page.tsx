import { getMarketingCampaignById } from "@/features/marketing-campaigns/_lib/queries";
import MarketingCampaignDashboard from "./marketing-campaign-dashboard";
import React from "react";
import { MarketingCampaignSkeleton } from "./skeleton";

interface IndexPageProps {
  params: Promise<{ id: string }>;
}

export default async function Home({ params }: IndexPageProps) {
  const { id } = await params;

  const data = await getMarketingCampaignById(id);

  return (
    <React.Suspense fallback={<MarketingCampaignSkeleton />}>
      <MarketingCampaignDashboard initialData={data} />
    </React.Suspense>
  );
}
