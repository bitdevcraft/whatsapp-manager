"use client";

import { getDashboardAnalytics } from "@/features/dashboard/_lib/queries";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import { TrendingUp } from "lucide-react";
import React from "react";
import { XAxis, YAxis, Bar, BarChart } from "recharts";

export interface Props {
  promises: Promise<[Awaited<ReturnType<typeof getDashboardAnalytics>>]>;
}

export const description = "A horizontal bar chart";
const chartData = [
  { status: "success", count: 0, fill: "var(--color-success)" },
  { status: "pending", count: 0, fill: "var(--color-pending)" },
  { status: "failed", count: 0, fill: "var(--color-failed)" },
  { status: "disabled", count: 0, fill: "var(--color-disabled)" },
  { status: "draft", count: 0, fill: "var(--color-draft)" },
  { status: "processing", count: 0, fill: "var(--color-processing)" },
];

const chartConfig = {
  success: {
    label: "Success",
    color: "var(--color-green-400)",
  },
  pending: {
    label: "Pending",
    color: "var(--color-blue-300)",
  },
  failed: {
    label: "Failed",
    color: "var(--color-red-400)",
  },
  disabled: {
    label: "Disabled",
    color: "var(--muted)",
  },
  draft: {
    label: "Draft",
    color: "var(--muted-foreground)",
  },
  processing: {
    label: "Processing",
    color: "var(--color-blue-500)",
  },
} satisfies ChartConfig;

export default function MarketingCampaignStats({ promises }: Props) {
  const [{ marketingCampaignStatus }] = React.use(promises);

  // 3. turn it into a lookup map
  const realCountByStatus = new Map(
    marketingCampaignStatus.map(({ status, count }) => [status, count] as const)
  );

  // 4. merge!
  const merged = chartData.map((item) => ({
    ...item,
    // if we have a real count for this status, use it, otherwise keep the default
    count: realCountByStatus.has(item.status)
      ? realCountByStatus.get(item.status)!
      : item.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing Campaign</CardTitle>
        <CardDescription>Status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={merged}
            layout="vertical"
            margin={{
              left: 20,
            }}
          >
            <XAxis type="number" dataKey="count" hide />
            <YAxis
              dataKey="status"
              type="category"
              tickLine={true}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                chartConfig[value as keyof typeof chartConfig]?.label
              }
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="count" layout="vertical" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Showing total status counts of Marketing Campaigns
        </div>
      </CardFooter>
    </Card>
  );
}
