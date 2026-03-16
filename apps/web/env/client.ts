import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_FACEBOOK_APP_ID: z.string().min(1),
    NEXT_PUBLIC_FACEBOOK_CONFIG_ID: z.string().min(1),
    NEXT_PUBLIC_WEB_SOCKET: z.string().min(1),
    NEXT_PUBLIC_WEB_URL: z.string().min(1),
  },
  runtimeEnv: {
    NEXT_PUBLIC_FACEBOOK_APP_ID: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
    NEXT_PUBLIC_FACEBOOK_CONFIG_ID: process.env.NEXT_PUBLIC_FACEBOOK_CONFIG_ID,
    NEXT_PUBLIC_WEB_SOCKET: process.env.NEXT_PUBLIC_WEB_SOCKET,
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
  },
});
