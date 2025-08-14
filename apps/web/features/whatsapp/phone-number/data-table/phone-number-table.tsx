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

import { WhatsAppBusinessAccountPhoneNumberActionBar } from "./phone-number-table-action-bar";
import { useFeatureFlags } from "@/components/provider/feature-flags-provider";
import { useTitle } from "@/components/provider/title-provider";
import { DataTableRowAction } from "@workspace/ui/types/data-table";
import { WhatsAppBusinessAccountPhoneNumber } from "@workspace/db";
import { getTableColumns } from "./phone-number-table-columns";
import { getWhatsAppBusinessAccountPhoneNumber } from "../_lib/queries";
import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";
import { InputOTPForm } from "./phone-number-register-form";
import axios from "axios";
import { toast } from "sonner";
import { FeatureFlagsToggle } from "@/components/provider/feature-flags-toggle";
import { Button } from "@workspace/ui/components/button";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface WhatsAppBusinessAccountPhoneNumberTableProps {
  promises: Promise<
    [Awaited<ReturnType<typeof getWhatsAppBusinessAccountPhoneNumber>>]
  >;
}

export default function WhatsAppBusinesAccountPhoneNumberTable({
  promises,
}: WhatsAppBusinessAccountPhoneNumberTableProps) {
  const setTitle = useTitle();

  const router = useRouter();

  useEffect(() => {
    setTitle("Business Account");
  }, [setTitle]);

  const { enableAdvancedFilter } = useFeatureFlags();

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
      await axios.post("/api/whatsapp/business-account/registration/register", {
        pin: data.pin,
        phoneNumberId,
      });
      router.refresh();

      toast.success("Registered Successfully");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error Encountered, please check with admin");
    }
  };

  const setup2FAPin = async (data: { pin: string }, phoneNumberId: string) => {
    try {
      await axios.post(
        "/api/whatsapp/business-account/registration/setup-2FA",
        {
          pin: data.pin,
          phoneNumberId,
        }
      );
      toast.success("Registered Successfully");
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Error Encountered, please check with admin");
    }
  };
  const getPhoneNumbers = async () => {
    try {
      await axios.get("/api/whatsapp/business-account/get-phone-numbers");
      toast.success("Registered Successfully");
      router.refresh();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            <FeatureFlagsToggle />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <Button size="sm" onClick={getPhoneNumbers}>
              <RefreshCcw />
            </Button>
            <DataTableSortList table={table} align="start" />
            <FeatureFlagsToggle />
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
