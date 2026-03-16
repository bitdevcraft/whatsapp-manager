"use client";

import { useMutation } from "@tanstack/react-query";
import { Template } from "@workspace/db/schema";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";
import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
  DataTableSortList,
  DataTableToolbar,
} from "@workspace/ui/data-table";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { cn } from "@workspace/ui/lib/utils";
import { DataTableRowAction } from "@workspace/ui/types/data-table";
import axios from "axios";
import { Plus, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";

import { SingleTemplatePreview } from "@/app/(frontend)/(protected)/(admin)/ing/whatsapp/marketing-campaigns/[id]/template-preview";
import { useFeatureFlags } from "@/components/provider/feature-flags-provider";
import { FeatureFlagsToggle } from "@/components/provider/feature-flags-toggle";
import { useTitle } from "@/components/provider/title-provider";

import { getTemplates } from "../lib/queries";
import { getTableColumns } from "./template-table-columns";

const useTemplateSync = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await axios.get("/api/whatsapp/templates?sync=true", {
        withCredentials: true,
      });

      return response.data;
    },
    onError: (error: unknown) =>
      toast.error(
        <div>
          <p>Error</p>
          <p>
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
      ),
    onSuccess: () => toast.success("Synced"),
  });
};

interface Props {
  promises: Promise<[Awaited<ReturnType<typeof getTemplates>>]>;
}
export default function TemplateTable({ promises }: Props) {
  const setTitle = useTitle();
  const router = useRouter();

  useEffect(() => {
    setTitle("Templates");
  }, [setTitle]);

  const { enableAdvancedFilter } = useFeatureFlags();

  const [{ data, pageCount }] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<Template> | null>(null);

  const columns = React.useMemo(
    () =>
      getTableColumns({
        setRowAction,
      }),
    []
  );

  const { debounceMs, shallow, table, throttleMs } = useDataTable({
    clearOnDefault: true,
    columns,
    data,
    enableAdvancedFilter: false,
    getRowId: (row) => row.id,
    initialState: {
      columnPinning: { right: ["actions"] },
      pagination: { pageIndex: 1, pageSize: 10 },
      sorting: [{ desc: true, id: "createdAt" }],
    },
    pageCount,
    shallow: false,
  });

  const templateSync = useTemplateSync();

  const onTemplateSync = () => {
    templateSync.mutate(undefined, {
      onSuccess: () => {
        router.refresh();
      },
    });
  };

  return (
    <div className="">
      <ResponsiveDialog
        isOpen={rowAction?.variant === "preview"}
        setIsOpen={() => setRowAction(null)}
        title="Preview"
      >
        <div>
          {rowAction?.row.original.content && (
            <SingleTemplatePreview template={rowAction?.row.original.content} />
          )}
        </div>
      </ResponsiveDialog>

      <DataTable
        // actionBar={<TemplateTableActionBar table={table} />}
        table={table}
      >
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar table={table}>
            <DataTableFilterList
              align="end"
              debounceMs={debounceMs}
              shallow={shallow}
              table={table}
              throttleMs={throttleMs}
            />

            <NewTemplate />

            <Button onClick={onTemplateSync} size="sm" variant="outline">
              <RefreshCcw />
            </Button>
            <DataTableSortList align="start" table={table} />
            <FeatureFlagsToggle />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <NewTemplate />
            <Button
              disabled={templateSync.isPending}
              onClick={onTemplateSync}
              size="sm"
              variant="outline"
            >
              <span
                className={cn(templateSync.isPending ? "animate-spin" : "")}
              >
                <RefreshCcw className="rotate-x-180" />
              </span>
            </Button>
            <DataTableSortList align="start" table={table} />
            <FeatureFlagsToggle />
          </DataTableToolbar>
        )}
      </DataTable>
    </div>
  );
}

function NewTemplate() {
  const pathname = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="default">
          <Plus />
          New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem asChild>
          <Link href={`${pathname}/new/default`}>Default</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`${pathname}/new/carousel`}>Carousel</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
