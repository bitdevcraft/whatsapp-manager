"use client";

import { useTitle } from "@/components/title-provider";
import { DataTable } from "@workspace/ui/components/data-table";
import { useEffect, useState } from "react";
import axios from "axios";
import { Template } from "@workspace/db/schema/templates";
import { columns } from "@/features/templates/columns";

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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section className="p-4">
      <DataTable
        title=""
        columns={columns}
        data={data}
        actions={() => <></>}
        isLoading={loading}
      />
    </section>
  );
}
