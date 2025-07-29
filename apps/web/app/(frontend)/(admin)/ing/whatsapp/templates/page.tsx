"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useTitle } from "@/components/provider/title-provider";
import { DataTable } from "@workspace/ui/data-table";
import { useReactTable, getCoreRowModel, getPaginationRowModel, getSortedRowModel, getFilteredRowModel, ColumnDef } from "@tanstack/react-table";
import axios from "axios";
import { Template } from "@workspace/db/schema/templates";
import { columns } from "@/features/whatsapp/templates/columns";
import { Button } from "@workspace/ui/components/button";
import { Plus, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function Home() {
  // State hooks
  const [data, setData] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ type?: 'success' | 'error'; message: string } | null>(null);
  const setTitle = useTitle();

  // Define columns
  const tableColumns = useMemo<ColumnDef<Template>[]>(
    () => columns,
    []
  );

  // Initialize the table
  const table = useReactTable({
    data: Array.isArray(data) ? data : [],
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Data fetching
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/whatsapp/templates", {
        withCredentials: true,
      });
      setData(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err) {
      console.error("Error fetching templates:", err);
      setError("Failed to load templates. Please try again later.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync handler
  const onSync = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/whatsapp/templates?sync=true", {
        withCredentials: true,
      });
      setData(Array.isArray(response.data) ? response.data : []);
      setError(null);
      setSyncStatus({ type: 'success', message: 'Templates synced successfully!' });
    } catch (err) {
      console.error("Error syncing templates:", err);
      setError("Failed to sync templates. Please try again later.");
      setSyncStatus({ type: 'error', message: 'Failed to sync templates' });
    } finally {
      setLoading(false);
    }
  }, []);

  // Effects
  useEffect(() => {
    setTitle("Templates");
  }, [setTitle]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle toast notifications
  useEffect(() => {
    if (syncStatus) {
      if (syncStatus.type === 'success') {
        toast.success(syncStatus.message);
      } else if (syncStatus.type === 'error') {
        toast.error(syncStatus.message);
      }
      setSyncStatus(null);
    }
  }, [syncStatus]);



  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
              <div className="mt-2">
                <Button variant="outline" onClick={fetchData}>
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Action bar content
  const actionBar = (
    <div className="flex items-center gap-2">
      <Button asChild>
        <Link href="/ing/whatsapp/templates/new">
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Link>
      </Button>
      <Button 
        variant="outline" 
        onClick={onSync}
        disabled={loading}
      >
        {loading ? 'Syncing...' : 'Sync'}
      </Button>
    </div>
  );

  // Main render
  return (
    <section className="p-4">
      <div className="rounded-md border">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Templates</h2>
            {actionBar}
          </div>
        </div>
        <DataTable
          table={table}
          className="w-full"
          paginationClassName="px-4 py-2"
        />
      </div>
    </section>
  );
}
