"use client";

import { useTitle } from "@/components/provider/title-provider";
import { DataTable } from "@workspace/ui/components/custom/data-table";
import { useEffect, useState } from "react";
import axios from "axios";
import { MarketingCampaign } from "@workspace/db/schema/marketing-campaigns";
import { columns } from "@/features/marketing-campaigns/columns";
import { Button } from "@workspace/ui/components/button";
export default function Home() {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Marketing Campaigns");
  }, [setTitle]);

  const [data, setData] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    const response = await axios.get("/api/whatsapp/marketing-campaigns", {
      withCredentials: true,
    });
    setData(response.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section className="p-4">
      <DataTable
        title=""
        columns={columns}
        data={data}
        actions={() => (
          <a href="/ing/whatsapp/marketing-campaigns/new">
            <Button>Create Campaign</Button>
          </a>
        )}
        isLoading={loading}
      />
    </section>
  );
}
