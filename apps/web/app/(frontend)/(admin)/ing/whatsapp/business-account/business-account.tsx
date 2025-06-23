import { FeatureFlagsProvider } from "@/components/provider/feature-flags-provider";
import { getWhatsAppBusinessAccountDetails } from "@/features/whatsapp/business-account/_lib/queries";
import { getWhatsAppBusinessAccountPhoneNumber } from "@/features/whatsapp/phone-number/_lib/queries";
import WhatsAppBusinesAccountPhoneNumberTable from "@/features/whatsapp/phone-number/data-table/phone-number-table";
import { DataTableSkeleton } from "@workspace/ui/components/data-table";
import React from "react";

interface Props {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getWhatsAppBusinessAccountDetails>>,
      Awaited<ReturnType<typeof getWhatsAppBusinessAccountPhoneNumber>>,
    ]
  >;
}

export default function BusinessAccount({ promises }: Props) {
  const [waba, data] = React.use(promises);

  const promise = Promise.all([data]);

  return (
    <>
      <p>{waba?.id}</p>
      <div className="p-8">
        <FeatureFlagsProvider>
          <React.Suspense
            fallback={
              <DataTableSkeleton
                columnCount={7}
                filterCount={2}
                cellWidths={[
                  "10rem",
                  "30rem",
                  "10rem",
                  "10rem",
                  "6rem",
                  "6rem",
                  "6rem",
                ]}
                shrinkZero
              />
            }
          >
            <WhatsAppBusinesAccountPhoneNumberTable promises={promise} />
          </React.Suspense>
        </FeatureFlagsProvider>
      </div>
    </>
  );
}
