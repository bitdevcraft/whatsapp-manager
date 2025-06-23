"use client";

import React, { useEffect } from "react";

import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
  DataTableFilterMenu,
  DataTableSortList,
  DataTableToolbar,
} from "@workspace/ui/data-table";

import { WhatsAppBusinessAccountPhoneNumberActionBar } from "./phone-number-table-action-bar";
import { useFeatureFlags } from "@/components/provider/feature-flags-provider";
import { useTitle } from "@/components/provider/title-provider";
import { getSelectTags } from "@/features/tags/_lib/queries";
import { DataTableRowAction } from "@workspace/ui/types/data-table";
import { WhatsAppBusinessAccountPhoneNumber } from "@workspace/db";
import { getTableColumns } from "./phone-number-table-columns";
import { getWhatsAppBusinessAccountPhoneNumber } from "../_lib/queries";
import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";
import { InputOTPForm } from "./phone-number-register-form";
import { TagsFormValues } from "@/features/tags/_lib/schema";
import axios from "axios";
import { toast } from "sonner";

interface WhatsAppBusinessAccountPhoneNumberTableProps {
  promises: Promise<
    [Awaited<ReturnType<typeof getWhatsAppBusinessAccountPhoneNumber>>]
  >;
}

export default function WhatsAppBusinesAccountPhoneNumberTable({
  promises,
}: WhatsAppBusinessAccountPhoneNumberTableProps) {
  const setTitle = useTitle();

  useEffect(() => {
    setTitle("Contacts");
  }, [setTitle]);

  const { enableAdvancedFilter, filterFlag } = useFeatureFlags();

  const [{ data, pageCount }] = React.use(promises);

  const [rowAction, setRowAction] =
    React.useState<DataTableRowAction<WhatsAppBusinessAccountPhoneNumber> | null>(
      null
    );

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
      columnVisibility: {
        createdAt: false,
      },
    },
    getRowId: (row) => String(row.id),
    shallow: false,
    clearOnDefault: true,
  });

  const registerPhone = async (
    data: { pin: string },
    phoneNumberId: string
  ) => {
    try {
      const response = await axios.post(
        "/api/whatsapp/business-account/registration/register",
        {
          pin: data.pin,
          phoneNumberId,
        }
      );
      toast.success("Registered Successfully");
    } catch (error) {
      toast.error("Error Encountered, please check with admin");
    }
  };
  const setup2FAPin = async (data: { pin: string }, phoneNumberId: string) => {
    try {
      const response = await axios.post(
        "/api/whatsapp/business-account/registration/setup-2FA",
        {
          pin: data.pin,
          phoneNumberId,
        }
      );
      toast.success("Registered Successfully");
    } catch (error) {
      toast.error("Error Encountered, please check with admin");
    }
  };

  return (
    <div className="">
      <DataTable
        table={table}
        actionBar={
          <WhatsAppBusinessAccountPhoneNumberActionBar table={table} />
        }
        pageSizeOptions={[10, 20, 50, 100, 200]}
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
            <DataTableSortList table={table} align="start" />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <DataTableSortList table={table} align="start" />
          </DataTableToolbar>
        )}
      </DataTable>
      <ResponsiveDialog
        isOpen={rowAction?.variant === "register"}
        setIsOpen={() => setRowAction(null)}
        title="Register Phone Number"
      >
        <InputOTPForm
          onSubmit={(data) => {
            registerPhone(data, String(rowAction?.row.original.id)!);
            setRowAction(null);
          }}
        />
      </ResponsiveDialog>
      <ResponsiveDialog
        isOpen={rowAction?.variant === "setup-2FA"}
        setIsOpen={() => setRowAction(null)}
        title="Setup 2FA Pin"
      >
        <InputOTPForm
          onSubmit={(data) => {
            setup2FAPin(data, String(rowAction?.row.original.id)!);
            setRowAction(null);
          }}
        />
      </ResponsiveDialog>
    </div>
  );
}
