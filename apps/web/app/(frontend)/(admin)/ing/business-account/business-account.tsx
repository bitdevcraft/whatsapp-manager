"use client";

import { FeatureFlagsProvider } from "@/components/provider/feature-flags-provider";
import {
  getAdAccount,
  getWhatsAppBusinessAccountDetails,
} from "@/features/business-account/_lib/queries";
import { getWhatsAppBusinessAccountPhoneNumber } from "@/features/whatsapp/phone-number/_lib/queries";
import WhatsAppBusinesAccountPhoneNumberTable from "@/features/whatsapp/phone-number/data-table/phone-number-table";
import { toTitleCase } from "@/utils/string-helper";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader } from "@workspace/ui/components/card";
import { DataTableSkeleton } from "@workspace/ui/components/data-table";
import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";
import { Separator } from "@workspace/ui/components/separator";
import { parseAsBoolean, useQueryState } from "nuqs";
import React from "react";
import { z } from "zod";
import AdAccountForm from "./ad-account-form";

interface Props {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getWhatsAppBusinessAccountDetails>>,
      Awaited<ReturnType<typeof getWhatsAppBusinessAccountPhoneNumber>>,
      Awaited<ReturnType<typeof getAdAccount>>,
    ]
  >;
}

export default function BusinessAccount({ promises }: Props) {
  const [waba, data, adAccount] = React.use(promises);

  const promise = Promise.all([data]);

  const [addAdAccount, setAddAdAccount] = React.useState<boolean>(false);

  return (
    <div>
      <ResponsiveDialog
        isOpen={addAdAccount}
        setIsOpen={setAddAdAccount}
        title=""
      >
        <AdAccountForm />
      </ResponsiveDialog>

      <div className="p-8 grid gap-5">
        <div className="flex justify-between">
          <p className="text-xl font-semibold">{waba?.ownerBusinessName}</p>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAddAdAccount(true)}
            >
              Add Ad Account
            </Button>
          </div>
        </div>
        <Separator />

        <Card>
          <CardHeader>Phone Numbers</CardHeader>
          <CardContent>
            <div className="">
              <FeatureFlagsProvider>
                <React.Suspense
                  fallback={
                    <DataTableSkeleton
                      columnCount={4}
                      filterCount={2}
                      cellWidths={["10rem", "6rem", "6rem", "6rem"]}
                      shrinkZero
                      rowCount={2}
                    />
                  }
                >
                  <WhatsAppBusinesAccountPhoneNumberTable promises={promise} />
                </React.Suspense>
              </FeatureFlagsProvider>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>Ad Account</CardHeader>
          <CardContent>
            {adAccount.data ? (
              <div className="font-light grid gap-4">
                <div>
                  <p>
                    <span className="font-medium">Name:&nbsp;</span>
                    {adAccount.data?.name}
                  </p>
                  <p>
                    <span className="font-medium">Id:&nbsp;</span>
                    {adAccount.data?.account_id}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Terms of Service</p>
                  <ul className="list-disc ml-8">
                    {adAccount.data?.tos_accepted &&
                      Object.keys(adAccount.data.tos_accepted).map((el, i) => (
                        <li key={i}>
                          {toTitleCase(el, {
                            tos: "Terms of Service",
                          })}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ) : (
              <></>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
