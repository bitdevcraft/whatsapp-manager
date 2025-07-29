"use client";

import { Button } from "@workspace/ui/components/button";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";

export default function Home() {
  const createCampaign = async () => {
    try {
      const response = await axios.post("/api/ads/ad-campaign", {});
    } catch (error) {
      console.error(error);
      toast.error("Error in creating campaign");
    }
  };

  return (
    <div className="p-4">
      Ads
      <Link href={`create`}>
        <Button>Create</Button>
      </Link>
    </div>
  );
}
