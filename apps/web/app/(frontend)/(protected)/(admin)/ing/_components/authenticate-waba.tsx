"use client";

import {
  banner,
  clearPersistedBanner,
  getPersistedBanner,
} from "@workspace/ui/components/banner";
import axios from "axios";
import Script from "next/script";
import React from "react";

import FacebookLogin from "@/components/facebook-login";

const waBannerId = "wa:missing:auth";

export default function AuthenticateWaba() {
  React.useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get<null | {
        id: null | string;
        teamId: string;
      }>("/api/whatsapp/business-account");

      const isBannerPersisted = getPersistedBanner(waBannerId);
      if (isBannerPersisted) {
        banner.warning(<AuthenticateNotice />, {
          autoClose: false,
          dismissible: true,
          persistId: waBannerId,
        });
      }
      if (!response.data?.id && !isBannerPersisted) {
        banner.warning(<AuthenticateNotice />, {
          autoClose: false,
          dismissible: true,
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
        async
        crossOrigin="anonymous"
        defer
        src="https://connect.facebook.net/en_US/sdk.js"
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
        <FacebookLogin />
      </div>
    </>
  );
}
