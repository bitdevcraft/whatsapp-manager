"use client";

import { useTitle } from "@/components/provider/title-provider";
import { DataTable } from "@workspace/ui/components/custom/data-table";
import { useEffect, useState } from "react";
import axios from "axios";
import { Template } from "@workspace/db/schema/templates";
import { columns } from "@/features/whatsapp/templates/columns";
import { Button } from "@workspace/ui/components/button";

export default function Home() {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Templates");
  }, [setTitle]);

  const [data, setData] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    const response = await axios.get("/api/whatsapp/templates", {
      withCredentials: true,
    });
    setData(response.data);
    setLoading(false);
  };

  const onSync = async () => {
    const response = await axios.get("/api/whatsapp/templates?sync=true", {
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
          <>
            <Button onClick={onSync}>Sync</Button>
          </>
        )}
        isLoading={loading}
      />
    </section>
  );
}
