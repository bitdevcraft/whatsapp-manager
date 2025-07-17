"use client";

import { Button } from "@workspace/ui/components/button";
import axios from "axios";
import { create } from "domain";
import { renderToHTML } from "next/dist/server/render";
import { toast } from "sonner";
import { renderToString } from "react-dom/server";

export default function Home() {
  const createCampaign = async () => {
    try {
      const response = await axios.post("/api/ads/ad-campaign", {});
    } catch (error) {
      console.error(error);
      toast.error("Error in creating campaign");
    }
  };

  console.log(renderToString(<Button onClick={createCampaign}>Create</Button>));
  return (
    <div>
      Ads
      <Button onClick={createCampaign}>Create</Button>
    </div>
  );
}
