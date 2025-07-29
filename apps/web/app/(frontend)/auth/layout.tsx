import { auth } from "@workspace/auth";
import { headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headers = await nextHeaders();

  const session = await auth.api.getSession({
    headers,
  });

  console.log(session);

  if (session) {
    redirect(`/ing/dashboard`);
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      {children}
    </div>
  );
}
