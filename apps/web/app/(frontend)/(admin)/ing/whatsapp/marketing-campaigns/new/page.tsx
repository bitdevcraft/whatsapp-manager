"use client";

import { useTitle } from "@/components/provider/title-provider";
import { useEffect } from "react";
import MarketingCampaignForm from "./_components/marketing-campaign-form";

export default function Home() {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Create Campaign");
  }, [setTitle]);

  return (
    <div className="p-4 grid grid-cols-12 gap-4">
      <div className="col-span-12 md:col-span-6 lg:col-span-7 border border-muted shadow-lg rounded-xl min-h-[90dvh] p-8">
        <MarketingCampaignForm />
      </div>
      <div className="col-span-12 md:col-span-6 lg:col-span-5 border border-muted shadow-lg rounded-xl min-h-[90dvh] p-8"></div>
    </div>
  );
}
