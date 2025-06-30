import { getContacts } from "@/features/contacts/get-users";
import { getUserWithTeam } from "@/lib/db/queries";
import { contactsTable, NewContact } from "@workspace/db";
import { withTenantTransaction } from "@workspace/db/index";
import { buildConflictUpdateColumns } from "@workspace/db/lib";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await getContacts();
  return new Response(JSON.stringify(result), { status: 200 });
}

export async function POST(request: Request) {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  const data = (await request.json()) as {
    name: string;
    phoneNumber: string;
    email: string;
  }[];

  const { teamId } = userWithTeam;

  const contacts: NewContact[] = data.map((d) => {
    const temp: NewContact = {
      name: d.name,
      teamId: teamId,
      email: d.email,
      phone: d.phoneNumber,
      message: "",
    };

    return temp;
  });

  const result = await withTenantTransaction(teamId, async (tx) => {
    return await tx
      .insert(contactsTable)
      .values(contacts)
      .onConflictDoUpdate({
        target: [contactsTable.teamId, contactsTable.phone],
        set: buildConflictUpdateColumns(contactsTable, [
          "name",
          "phone",
          "email",
        ]),
      })
      .returning();
  });

  revalidateTag(`contacts:${teamId}`);

  return new Response(JSON.stringify(result), { status: 200 });
}
