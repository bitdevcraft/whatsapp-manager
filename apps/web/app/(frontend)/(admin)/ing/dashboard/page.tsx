"use client";

import { ChartAreaInteractive } from "@/components/admin-layout/chart-area-interactive";
import { DataTable } from "@/components/admin-layout/data-table";
import { SectionCards } from "@/components/admin-layout/section-cards";

import data from "./data.json";
import FacebookLogin from "@/components/facebook-login";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import Script from "next/script";

export default function Page() {
  const handleLoginSuccess = (response: any) => {
    console.log("Login success", response);
  };

  const handleLoginFailure = (error: string) => {
    console.error("Login failed", error);
  };

  return (
    <>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        async
        defer
        crossOrigin="anonymous"
      />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-6">
              <Card className="@container/card bg-yellow-100/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl ">
                    Important
                  </CardTitle>
                  <CardDescription className="text-muted-foreground grid gap-4">
                    <p>Your WhatsApp Business Account isn't connected yet</p>
                    <p>
                      Linking your account is required to send and receive
                      messages, and to use the messaging features
                    </p>
                    <p className="text-base font-bold">Need help? Contact Us</p>
                  </CardDescription>
                  <CardAction></CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                  <FacebookLogin
                    appId="606557539005538"
                    onLoginSuccess={handleLoginSuccess}
                    onLoginFailure={handleLoginFailure}
                  />
                </CardFooter>
              </Card>
            </div>

            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
