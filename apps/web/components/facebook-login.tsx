"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";

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
      console.log(event);
      if (!event.origin.endsWith("facebook.com")) return;
      try {
        const data = JSON.parse(event.data);
        console.log(data);
        if (data.type === "WA_EMBEDDED_SIGNUP") {
          console.log("Success message event: ", data); // remove after testing
          // your code goes here
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

  const embedSignup = async (code: string) => {
    await axios.post("/api/wa-embedded-signup", { code });
  };

  const handleLogin = () => {
    // @ts-ignore
    if (typeof window !== "undefined" && window.FB) {
      // @ts-ignore
      window.FB.login(
        (response: any) => {
          if (response.authResponse) {
            embedSignup(response.authResponse.code);
            onLoginSuccess(response);
          } else {
            onLoginFailure("User cancelled login or did not fully authorize.");
          }
        },
        {
          config_id: "1197042981737724", // configuration ID goes here
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
      {fbLoaded ? (
        <button onClick={handleLogin}>Login with Facebook</button>
      ) : (
        <p>Loading Facebook SDK...</p>
      )}
    </div>
  );
};

export default FacebookLogin;
