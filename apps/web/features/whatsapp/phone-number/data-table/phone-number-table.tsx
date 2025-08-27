"use client";

import { WhatsAppBusinessAccountPhoneNumber } from "@workspace/db";
import { Button } from "@workspace/ui/components/button";
import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";
import {
  DataTable,
  DataTableAdvancedToolbar,
  DataTableFilterList,
  DataTableSortList,
  DataTableToolbar,
} from "@workspace/ui/data-table";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { DataTableRowAction } from "@workspace/ui/types/data-table";
import axios from "axios";
import { RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";

import { useFeatureFlags } from "@/components/provider/feature-flags-provider";
import { FeatureFlagsToggle } from "@/components/provider/feature-flags-toggle";
import { useTitle } from "@/components/provider/title-provider";

import { getWhatsAppBusinessAccountPhoneNumber } from "../_lib/queries";
import { InputOTPForm } from "./phone-number-register-form";
import { WhatsAppBusinessAccountPhoneNumberActionBar } from "./phone-number-table-action-bar";
import { getTableColumns } from "./phone-number-table-columns";

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

  const { debounceMs, shallow, table, throttleMs } = useDataTable({
    clearOnDefault: true,
    columns,
    data,
    enableAdvancedFilter: false,
    getRowId: (row) => String(row.id),
    initialState: {
      columnPinning: { right: ["actions"] },
      columnVisibility: {
        createdAt: false,
      },
      pagination: { pageIndex: 1, pageSize: 10 },
      sorting: [{ desc: true, id: "createdAt" }],
    },
    pageCount,
    shallow: false,
  });

  const registerPhone = async (
    data: { pin: string },
    phoneNumberId: string
  ) => {
    try {
      await axios.post("/api/whatsapp/business-account/registration/register", {
        phoneNumberId,
        pin: data.pin,
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
          phoneNumberId,
          pin: data.pin,
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
        actionBar={
          <WhatsAppBusinessAccountPhoneNumberActionBar table={table} />
        }
        pageSizeOptions={[10, 20, 50, 100, 200]}
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
            <DataTableSortList align="start" table={table} />
            <FeatureFlagsToggle />
          </DataTableAdvancedToolbar>
        ) : (
          <DataTableToolbar table={table}>
            <Button onClick={getPhoneNumbers} size="sm">
              <RefreshCcw />
            </Button>
            <DataTableSortList align="start" table={table} />
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
