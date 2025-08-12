/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const whatsappAxios = axios.create({
  baseURL: `https://graph.facebook.com/${process.env.WHATSAPP_API_VERSION}`,
  headers: {
    Authorization: `Bearer ${process.env.WHATSAPP_API_ACCESS_TOKEN}`,
  },
});

const waApi = {
  sendMessage: (message: any) =>
    whatsappAxios.post(`${process.env.PHONE_NUMBER_ID}/messages`, message),
  syncTemplate: () =>
    whatsappAxios.get<any>(
      `/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`
    ),
  createTemplate: () =>
    whatsappAxios.post(
      `/${process.env.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`,
      {}
    ),
};

export { whatsappAxios, waApi };
