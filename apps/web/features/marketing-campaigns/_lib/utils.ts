import { MarketingCampaign, MarketingCampaignStatusEnum } from "@workspace/db";
import {
  CheckCircle2,
  CircleIcon,
  CircleSlash,
  CircleX,
  LoaderCircle,
  SquarePen,
  Timer,
} from "lucide-react";

export function getMarketingCampaignStatusIcon(status: string) {
  if (!status) return CircleIcon;
  const statusIcons: any = {
    pending: Timer,
    processing: LoaderCircle,
    success: CheckCircle2,
    failed: CircleX,
    disabled: CircleSlash,
    draft: SquarePen,
  };

  return statusIcons[status] || CircleIcon;
}
