"use client";

import FacebookLogin from "@/components/facebook-login";
import { Button } from "@workspace/ui/components/button";
import Script from "next/script";

export default function Page() {
  const handleLoginSuccess = (response: any) => {
    console.log("Login success", response);
  };

  const handleLoginFailure = (error: string) => {
    console.error("Login failed", error);
  };

  return (
    <div>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        async
        defer
        crossOrigin="anonymous"
      />
      <div className="flex items-center justify-center min-h-svh">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Hello World</h1>
          <Button size="sm">Button</Button>
          <FacebookLogin
            appId="606557539005538"
            onLoginSuccess={handleLoginSuccess}
            onLoginFailure={handleLoginFailure}
          />
        </div>
      </div>
    </div>
  );
}
