import { redirect } from "next/navigation";

import { SearchParams } from "@/types";

interface SignUpPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function SignUpPage(props: SignUpPageProps) {
  const searchParams = await props.searchParams;
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
      continue;
    }

    if (typeof value === "string") {
      params.set(key, value);
    }
  }

  const query = params.toString();

  redirect(query ? `/auth/signup?${query}` : "/auth/signup");
}
