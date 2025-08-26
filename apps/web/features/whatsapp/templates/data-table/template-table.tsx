"use client";

import React, { useEffect } from "react";

import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
  DataTableSortList,
  DataTableToolbar,
} from "@workspace/ui/data-table";

import { useFeatureFlags } from "@/components/provider/feature-flags-provider";
import { useTitle } from "@/components/provider/title-provider";
import { FeatureFlagsToggle } from "@/components/provider/feature-flags-toggle";
import { TemplateTableActionBar } from "./template-table-action-bar";
import { getTemplates } from "../lib/queries";
import { getTableColumns } from "./template-table-columns";
import { Template } from "@workspace/db/schema";
import { DataTableRowAction } from "@workspace/ui/types/data-table";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { Plus, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { cn } from "@workspace/ui/lib/utils";
import { parseAsString, useQueryState } from "nuqs";
import { nanoid } from "nanoid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";
import { SingleTemplatePreview } from "@/app/(frontend)/(protected)/(admin)/ing/whatsapp/marketing-campaigns/[id]/template-preview";
import { MessageTemplateValues } from "../lib/schema";

const useTemplateSync = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await axios.get("/api/whatsapp/templates?sync=true", {
        withCredentials: true,
      });

      return response.data;
    },
    onSuccess: () => toast.success("Synced"),
    onError: (error: unknown) =>
      toast.error(
        <div>
          <p>Error</p>
          <p>
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
        </div>
      ),
  });
};

interface Props {
  promises: Promise<[Awaited<ReturnType<typeof getTemplates>>]>;
}
export default function TemplateTable({ promises }: Props) {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Templates");
  }, [setTitle]);

  const [, setRId] = useQueryState("rId", parseAsString);

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

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter: false,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
      pagination: { pageSize: 10, pageIndex: 1 },
    },
    getRowId: (row) => row.id,
    shallow: false,
    clearOnDefault: true,
  });

  const templateSync = useTemplateSync();

  const onTemplateSync = () => {
    templateSync.mutate(undefined, {
      onSuccess: () => {
        setRId(nanoid());
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
        table={table}
        actionBar={<TemplateTableActionBar table={table} />}
      >
        {enableAdvancedFilter ? (
          <DataTableAdvancedToolbar table={table}>
            <DataTableFilterList
              table={table}
              shallow={shallow}
              debounceMs={debounceMs}
              throttleMs={throttleMs}
              align="end"
            />

            <NewTemplate />

            <Button size="sm" variant="outline" onClick={onTemplateSync}>
              <RefreshCcw />
            </Button>
            <DataTableSortList table={table} align="start" />
            <FeatureFlagsToggle />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <NewTemplate />
            <Button
              size="sm"
              variant="outline"
              onClick={onTemplateSync}
              disabled={templateSync.isPending}
            >
              <span
                className={cn(templateSync.isPending ? "animate-spin" : "")}
              >
                <RefreshCcw className="rotate-x-180" />
              </span>
            </Button>
            <DataTableSortList table={table} align="start" />
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
