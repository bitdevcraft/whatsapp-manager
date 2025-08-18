/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from "@/env/server";
import axios from "axios";

const whatsappAxios = axios.create({
  baseURL: `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}`,
  headers: {
    Authorization: `Bearer ${env.WHATSAPP_API_ACCESS_TOKEN}`,
  },
});

const waApi = {
  sendMessage: (message: any) =>
    whatsappAxios.post(`${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, message),
  syncTemplate: () =>
    whatsappAxios.get<any>(
      `/${env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`
    ),
  createTemplate: () =>
    whatsappAxios.post(
      `/${env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
      {}
    ),
};

export { whatsappAxios, waApi };
