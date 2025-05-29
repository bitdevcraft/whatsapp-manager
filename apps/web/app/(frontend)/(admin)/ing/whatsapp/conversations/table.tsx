"use client";

import { useTitle } from "@/components/title-provider";
import { DataTable } from "@workspace/ui/components/data-table";
import { useEffect, useState } from "react";
import axios from "axios";
import { Conversation } from "@workspace/db/schema/conversations";
import { columns } from "@/features/conversations/columns";

export default function ConversationTable() {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Conversations");
  }, [setTitle]);

  const [data, setData] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    const response = await axios.get("/api/whatsapp/conversations", {
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
