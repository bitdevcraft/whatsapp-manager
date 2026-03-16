import { contactsTable, NewContact } from "@workspace/db";
import { withTenantTransaction } from "@workspace/db/index";
import { buildConflictUpdateColumns } from "@workspace/db/lib";
import { revalidateTag } from "next/cache";

import { getUserWithTeam } from "@/lib/db/queries";

export async function POST(request: Request) {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  const data = (await request.json()) as {
    email: string;
    name: string;
    phoneNumber: string;
    tags: string[];
  }[];

  const { teamId } = userWithTeam;

  const contacts: NewContact[] = data.map((d) => {
    const temp: NewContact = {
      email: d.email,
      message: "",
      name: d.name,
      phone: d.phoneNumber.replace(/\D/g, ""),
      tags: d.tags,
      teamId: teamId,
      updatedAt: new Date(),
    };

    return temp;
  });

  const result = await withTenantTransaction(teamId, async (tx) => {
    return await tx
      .insert(contactsTable)
      .values(contacts)
      .onConflictDoUpdate({
        set: buildConflictUpdateColumns(contactsTable, [
          "name",
          "phone",
          "email",
          "tags",
          "updatedAt",
        ]),
        target: [contactsTable.teamId, contactsTable.phone],
      })
      .returning();
  });

  revalidateTag(`contacts:${teamId}`, "max");

  return new Response(JSON.stringify(result), { status: 200 });
}
