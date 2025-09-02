"use server";

import { headers } from "next/headers";

import { authClient } from "@/lib/auth/auth-client";

export const getUser = async () => {
  const headerList = await headers();
  const session = await authClient.getSession({
    fetchOptions: {
      headers: Object.fromEntries(headerList.entries()),
    },
  });
  return session.data;
};
