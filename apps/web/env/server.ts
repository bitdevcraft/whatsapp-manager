/* eslint-disable perfectionist/sort-objects */
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    BASE_URL: z.string().url().min(1),
    WEB_SOCKET: z.string().url().min(1),

    ENCRYPTION_KEY: z.string().min(1),

    DATABASE_URL: z.string().url().min(1),

    REDIS_HOST: z.string().min(1),
    REDIS_PORT: z.string().min(1),
    REDIS_PASSWORD: z.string().optional(),

    WHATSAPP_API_ACCESS_TOKEN: z.string().min(1),
    WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
    WHATSAPP_BUSINESS_ACCOUNT_ID: z.string().min(1),
    WHATSAPP_WEBHOOK_SECRET: z.string().min(1),
    WHATSAPP_API_VERSION: z.string().min(1),

    M4D_APP_ID: z.string().min(1),
    META_CLIENT_SECRET: z.string().min(1),
    META_BUSINESS_ID: z.string().min(1),

    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    AUTH_SECRET: z.string().min(1),

    DEBUG: z.preprocess((value) => {
      if (typeof value === "string") {
        return value.trim().toLowerCase() === "true";
      }

      return value === true;
    }, z.boolean()),

    AWS_REGION: z.string().min(1),
    AWS_BUCKET_NAME: z.string().min(1),
    AWS_ACCESS_KEY_ID: z.string().min(1),
    AWS_SECRET_ACCESS_KEY: z.string().min(1),

    RESEND_API_KEY: z.string().min(1),
  },
  runtimeEnv: {
    BASE_URL: process.env.BASE_URL,
    WEB_SOCKET: process.env.WEB_SOCKET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    WHATSAPP_API_ACCESS_TOKEN: process.env.WHATSAPP_API_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    WHATSAPP_WEBHOOK_SECRET: process.env.WHATSAPP_WEBHOOK_SECRET,
    WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION,
    M4D_APP_ID: process.env.M4D_APP_ID,
    META_CLIENT_SECRET: process.env.META_CLIENT_SECRET,
    META_BUSINESS_ID: process.env.META_BUSINESS_ID,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    AUTH_SECRET: process.env.AUTH_SECRET,
    DEBUG: process.env.DEBUG,
    AWS_REGION: process.env.AWS_REGION,
    AWS_BUCKET_NAME: process.env.AWS_BUCKET_NAME,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
});
