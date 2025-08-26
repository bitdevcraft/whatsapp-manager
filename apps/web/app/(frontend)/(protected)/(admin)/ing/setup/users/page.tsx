"use client";

import { User } from "@workspace/db/schema/users";
import { DataTable } from "@workspace/ui/components/custom/data-table";
import axios from "axios";
import { useEffect, useState } from "react";

import { useTitle } from "@/components/provider/title-provider";
import { columns } from "@/features/users/columns";

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
        actions={() => <></>}
        columns={columns}
        data={data}
        isLoading={loading}
        title=""
      />
    </section>
  );
}
