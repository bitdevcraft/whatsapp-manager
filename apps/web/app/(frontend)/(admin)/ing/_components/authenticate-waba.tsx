"use client";

import FacebookLogin from "@/components/facebook-login";
import Script from "next/script";
import axios from "axios";
import React from "react";

import {
  banner,
  clearPersistedBanner,
  getPersistedBanner,
} from "@workspace/ui/components/banner";

const waBannerId = "wa:missing:auth";

export default function AuthenticateWaba() {
  React.useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get<{
        id: string | null;
        teamId: string;
      } | null>("/api/whatsapp/business-account");

      const isBannerPersisted = getPersistedBanner(waBannerId);
      if (isBannerPersisted) {
        banner.warning(<AuthenticateNotice />, {
          dismissible: true,
          autoClose: false,
          persistId: waBannerId,
        });
      }
      if (!response.data?.id && !isBannerPersisted) {
        banner.warning(<AuthenticateNotice />, {
          dismissible: true,
          autoClose: false,
          persistId: waBannerId,
        });
      }

      if (response.data?.id) {
        clearPersistedBanner(waBannerId);
      }
    };

    fetchData();
  }, []);

  return null;
}

function AuthenticateNotice() {
  return (
    <>
      <Script
        src="https://connect.facebook.net/en_US/sdk.js"
        async
        defer
        crossOrigin="anonymous"
      />
      <div className="flex flex-col md:flex-row justify-between p-4 items-center gap-4">
        <div>
          <p className="text-lg font-bold">Important</p>
          <p className="font-light text-xs md:text-sm">
            Linking your account is required to send and receive messages, and
            to use the messaging features
          </p>
          <p className="text-sm font-semibold">Need help? Contact Us</p>
        </div>
        <FacebookLogin appId="606557539005538" />
      </div>
    </>
  );
}
