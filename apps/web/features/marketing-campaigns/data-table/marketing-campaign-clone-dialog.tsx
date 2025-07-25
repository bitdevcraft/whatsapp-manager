"use client";

import { ResponsiveDialog } from "@workspace/ui/components/responsive-dialog";

import { getSelectTags } from "@/features/tags/_lib/queries";

import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Check, Cross, X } from "lucide-react";

export function CloneMarketingCampaign({
  ...props
}: Omit<React.ComponentProps<typeof ResponsiveDialog>, "children">) {
  const router = useRouter();

  const onYes = () => {
    props.setIsOpen?.(false);
  };

  const onNo = () => {
    props.setIsOpen?.(false);
  };

  return (
    <ResponsiveDialog {...props}>
      <div className="flex gap-3 w-full justify-center">
        <Button className="flex-1 w-full" onClick={onYes}>
          Yes <Check />
        </Button>
        <Button variant="destructive" className="flex-1 w-full" onClick={onNo}>
          No <X />
        </Button>
      </div>
    </ResponsiveDialog>
  );
}
