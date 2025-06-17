"use client";

import FacebookLogin from "@/components/facebook-login";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import Script from "next/script";

export default function Page() {
  const handleLoginSuccess = (response: any) => {
    console.log("Login success", response);
  };

  console.log("TEST");
  const handleLoginFailure = (error: string) => {
    console.error("Login failed", error);
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
