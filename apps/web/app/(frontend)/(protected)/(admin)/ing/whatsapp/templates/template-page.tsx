"use client";

import { ColumnDef, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";
import { Template } from "@workspace/db/schema/templates";
import { Button } from "@workspace/ui/components/button";
import { DataTable } from "@workspace/ui/data-table";
import axios from "axios";
import { Plus, XCircle } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { useTitle } from "@/components/provider/title-provider";
import { columns } from "@/features/whatsapp/templates/columns";

export default function TemplatePage() {
  // State hooks
  const [data, setData] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);
  const [syncStatus, setSyncStatus] = useState<null | { message: string; type?: 'error' | 'success'; }>(null);
  const setTitle = useTitle();

  // Define columns
  const tableColumns = useMemo<ColumnDef<Template>[]>(
    () => columns,
    []
  );

  // Initialize the table
  const table = useReactTable({
    columns: tableColumns,
    data: Array.isArray(data) ? data : [],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
      setSyncStatus({ message: 'Templates synced successfully!', type: 'success' });
    } catch (err) {
      console.error("Error syncing templates:", err);
      setError("Failed to sync templates. Please try again later.");
      setSyncStatus({ message: 'Failed to sync templates', type: 'error' });
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
              <XCircle aria-hidden="true" className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
              <div className="mt-2">
                <Button onClick={fetchData} variant="outline">
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
        disabled={loading} 
        onClick={onSync}
        variant="outline"
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
          className="w-full"
          paginationClassName="px-4 py-2"
          table={table}
        />
      </div>
    </section>
  );
}
