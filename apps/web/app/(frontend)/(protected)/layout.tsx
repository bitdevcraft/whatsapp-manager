import { auth } from "@workspace/auth";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";
import { OrganizationProvider } from "@/components/organization-provider";
import { CreateOrganizationForm } from "./(admin)/ing/organization/create/create-organization-form";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headers = await nextHeaders();

  const session = await auth.api.getSession({
    headers,
  });

  if (!session) {
    const pathname = headers.get("x-current-path");
    redirect(`/auth/login?path=${pathname}`);
  }

  if (!session.session.activeOrganizationId) {
    return <CreateOrganizationForm />;
  }

  await auth.api.setActiveOrganization({
    body: {
      organizationId: session.session.activeOrganizationId,
    },
    headers,
  });

  return <OrganizationProvider>{children}</OrganizationProvider>;
}
