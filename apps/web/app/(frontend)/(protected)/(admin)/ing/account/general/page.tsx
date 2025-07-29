import { auth } from "@workspace/auth";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { AccountInformation } from "./account-information";

export default async function GeneralPage() {
  const headers = await nextHeaders();

  const session = await auth.api.getSession({
    headers,
  });

  if (!session) {
    redirect("/auth/login");
  }

  const { user } = session;

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-foreground mb-6">
        General Settings
      </h1>
      <AccountInformation user={user} />
    </section>
  );
}
