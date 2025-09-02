"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";
import React from "react";
import { LabelList, Pie, PieChart } from "recharts";

import { getDashboardAnalytics } from "@/features/dashboard/_lib/queries";

export interface Props {
  promises: Promise<[Awaited<ReturnType<typeof getDashboardAnalytics>>]>;
}

const chartConfig = {
  delivered: {
    color: "var(--color-green-400)",
    label: "delivered",
  },
  failed: {
    color: "var(--color-red-400)",
    label: "Failed",
  },
} satisfies ChartConfig;

export default function DeliveryStatus({ promises }: Props) {
  const [{ deliveryStatus }] = React.use(promises);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Marketing Campaign Messages</CardTitle>
        <CardDescription>Status</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0"
          config={chartConfig}
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie data={deliveryStatus} dataKey="value" nameKey="status">
              <LabelList
                className="fill-background"
                dataKey="status"
                fontSize={12}
                formatter={(value: keyof typeof chartConfig) =>
                  chartConfig[value]?.label
                }
                stroke="none"
              />
            </Pie>
          </PieChart>
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
