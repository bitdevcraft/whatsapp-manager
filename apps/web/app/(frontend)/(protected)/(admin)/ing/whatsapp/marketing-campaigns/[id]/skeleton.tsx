// components/marketing-campaign/skeleton.tsx

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { Calendar, SendHorizontal, Tag, Trash } from "lucide-react";

export function MarketingCampaignSkeleton() {
  return (
    <section className="p-8 grid gap-4 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="flex gap-2 items-center">
          <Badge className="w-16 h-6 bg-muted" variant="outline" />
          <p className="text-muted-foreground text-sm bg-muted h-4 w-32 rounded" />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            className="bg-muted w-24 h-8"
            disabled
            size="sm"
            variant="outline"
          >
            <SendHorizontal className="h-4 w-4" />
            <span className="ml-2">Send</span>
          </Button>
          <Button
            className="bg-muted w-8 h-8"
            disabled
            size="sm"
            variant="destructive"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="h-6 w-1/3 bg-muted rounded" />

      <SkeletonAnalytics />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SkeletonDeliveryStatus />
        <SkeletonCampaignDetails />
      </div>

      <div className="min-h-16 border rounded p-4 flex flex-col gap-4 bg-background">
        <h3 className="text-secondary-foreground text-sm font-semibold">
          Template Preview
        </h3>
        <div className="min-h-16 bg-muted rounded-sm w-full h-20" />
      </div>
    </section>
  );
}

function SkeletonAnalytics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          className="min-h-16 border rounded flex flex-col p-4 gap-2 bg-background"
          key={i}
        >
          <div className="bg-muted h-4 w-1/2 rounded" />
          <div className="bg-muted h-6 w-1/3 rounded" />
          <div className="bg-muted h-3 w-2/3 rounded" />
        </div>
      ))}
    </div>
  );
}

function SkeletonCampaignDetails() {
  return (
    <div className="rounded border p-4 flex flex-col gap-4 bg-background">
      <h3 className="text-secondary-foreground text-sm font-semibold">
        Campaign Details
      </h3>
      <div className="flex gap-2 flex-wrap items-center">
        <Tag size={15} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div className="w-12 h-6 bg-muted rounded " key={i} />
        ))}
      </div>
      <div className="flex gap-2 flex-wrap items-center">
        <Calendar size={15} />
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
    </div>
  );
}

function SkeletonDeliveryStatus() {
  return (
    <div className="rounded border p-4 grid gap-4 bg-background">
      <h3 className="text-secondary-foreground text-sm font-semibold">
        Delivery Status
      </h3>
      {[0, 1].map((i) => (
        <div className="grid gap-2" key={i}>
          <div className="flex gap-2">
            <div className="h-4 w-4 bg-muted rounded-full" />
            <div className="h-4 w-20 bg-muted rounded" />
          </div>
          <Progress value={0} />
        </div>
      ))}
    </div>
  );
}
