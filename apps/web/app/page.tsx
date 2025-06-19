"use client";

import FacebookLogin from "@/components/facebook-login";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import Script from "next/script";
import { logger } from "@/lib/logger";

export default function Page() {
  const handleLoginSuccess = (response: any) => {
    logger.log("Login success", response);
  };

  const handleLoginFailure = (error: string) => {
    logger.error("Login failed", error);
  };

  return (
    <div>
      <div className="flex items-center justify-center min-h-svh">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Hello World</h1>
          <Link href={"/sign-in"}>
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
