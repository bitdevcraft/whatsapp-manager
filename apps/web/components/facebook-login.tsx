"use client";

import { IconBrandWhatsapp } from "@tabler/icons-react";
import {
  EmbedSignUpFlowEventType,
  EmbedSignUpLoginSuccess,
  EmbedSignUpObject,
  EmbeddedSignUpAuthorizedObject,
} from "@workspace/shared";
import { Button } from "@workspace/ui/components/button";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";

interface FacebookLoginProps {
  appId: string;
  onLoginSuccess: (response: any) => void;
  onLoginFailure: (error: string) => void;
}

const FacebookLogin: React.FC<FacebookLoginProps> = ({
  appId,
  onLoginSuccess,
  onLoginFailure,
}) => {
  const [fbLoaded, setFbLoaded] = useState(false);
  const loginResponseRef = useRef<EmbedSignUpLoginSuccess | null>(null);
  const embedDataRef = useRef<EmbedSignUpObject | null>(null);
  const submittedRef = useRef(false);

  function checkReady() {
    if (submittedRef.current) return;

    const auth = loginResponseRef.current;
    const signUp = embedDataRef.current;

    if (auth && signUp) {
      submittedRef.current = true;

      const data: EmbeddedSignUpAuthorizedObject = {
        signUp,
        auth,
      };

      axios
        .post("/api/wa-embedded-signup", data)
        .then(() => {
          onLoginSuccess("");
        })
        .catch((err) => {
          console.error("Signup failed:", err);
          onLoginFailure("Signup failed");
        });
    }
  }

  // Dynamically load the Facebook SDK client-side only
  useEffect(() => {
    // @ts-ignore
    if (typeof window !== "undefined") {
      // @ts-ignore
      window.fbAsyncInit = () => {
        // @ts-ignore
        window.FB.init({
          appId,
          cookie: true,
          xfbml: true,
          version: "v22.0",
        });
        // Resolve the promise when the SDK is loaded
        // resolve();
        // @ts-ignore
        window.FB.AppEvents.logPageView();
      };
      setFbLoaded(true);
    }
  }, [appId]);

  useEffect(() => {
    const messageEvent = (event: any) => {
      if (!event.origin.endsWith("facebook.com")) return;
      try {
        const data = JSON.parse(event.data);
        console.log(data);
        if (
          data.type === "WA_EMBEDDED_SIGNUP" &&
          data.event === EmbedSignUpFlowEventType.Finish
        ) {
          embedDataRef.current = data;
          checkReady();
        }
      } catch {
        console.log("Error message event: ", event.data); // remove after testing
        // your code goes here
      }
    };
    // Adding event listener
    if (typeof window !== "undefined") {
      window.addEventListener("message", messageEvent);
    }

    // Cleanup the event listener when the component is unmounted
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("message", messageEvent);
      }
    };
  }, []);

  const handleLogin = () => {
    // @ts-ignore
    if (typeof window !== "undefined" && window.FB) {
      // @ts-ignore
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            loginResponseRef.current = response;
            checkReady();
          } else {
            onLoginFailure("User cancelled login or did not fully authorize.");
          }
        },
        {
          config_id: "2166580990454604", // configuration ID goes here
          response_type: "code", // must be set to 'code' for System User access token
          override_default_response_type: true, // when true, any response types passed in the "response_type" will take precedence over the default types
          extras: {
            setup: {},
            featureType: "whatsapp_business_app_onboarding",
            sessionInfoVersion: "3",
          },
        }
      );
    }
  };

  return (
    <div>
      <Button
        onClick={handleLogin}
        className="bg-[#25D366] text-white h-16 w-96"
        disabled={!fbLoaded}
      >
        <IconBrandWhatsapp size={40} />
        {fbLoaded ? "Authenticate WhatsApp Business Account" : "Loading"}
      </Button>
    </div>
  );
};

export default FacebookLogin;
