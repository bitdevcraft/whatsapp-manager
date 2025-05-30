"use client";

import { useTitle } from "@/components/title-provider";
import { Contact } from "@workspace/db/schema/contacts";
import { DataTable } from "@workspace/ui/components/custom/data-table";
import { useEffect, useState } from "react";
import axios from "axios";
import { columns } from "@/features/users/columns";
import { User } from "@workspace/db/schema/users";

export default function Home() {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Users");
  }, [setTitle]);

  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async () => {
    const response = await axios.get("/api/users", {
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
