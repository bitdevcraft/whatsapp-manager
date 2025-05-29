"use client";

import { useTitle } from "@/components/title-provider";
import { columns } from "@/features/contacts/columns";
import { Contact } from "@workspace/db/schema/contacts";
import { DataTable } from "@workspace/ui/components/data-table";
import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@workspace/ui/components/button";

export default function Home() {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Contacts");
  }, [setTitle]);

  const [data, setData] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    const response = await axios.get("/api/contacts", {
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
            <Button>Create List</Button>
          </>
        )}
        
        isLoading={loading}
      />
    </section>
  );
}
