"use server";

import { withTenantTransaction } from "@workspace/db/tenant";
import { getUserWithTeam } from "@/lib/db/queries";
import { toast } from "sonner";
import { contactsTable } from "@workspace/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { revalidateTag, unstable_noStore } from "next/cache";
import { getErrorMessage } from "@/lib/handle-error";

export async function deleteContact(input: { id: string }) {
  unstable_noStore();
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    toast.error("There is no team");
    return {
      data: null,
      error: null,
    };
  }

  try {
    await withTenantTransaction(userWithTeam.teamId, async (tx) => {
      await tx.delete(contactsTable).where(eq(contactsTable.id, input.id));
    });

    revalidateTag(`contacts:${userWithTeam?.teamId}`);

    return {
      data: null,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
}

export async function deleteContacts(input: { ids: string[] }) {
  unstable_noStore();
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    toast.error("There is no team");
    return {
      data: null,
      error: null,
    };
  }

  try {
    await withTenantTransaction(userWithTeam.teamId, async (tx) => {
      await tx
        .delete(contactsTable)
        .where(inArray(contactsTable.id, input.ids));
    });

    revalidateTag(`contacts:${userWithTeam?.teamId}`);

    return {
      data: null,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: getErrorMessage(error),
    };
  }
}

export async function updateContact(input: { id: string; tags?: string[] }) {
  unstable_noStore();
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    toast.error("There is no team");
    return {
      data: null,
      error: null,
    };
  }

  try {
    await withTenantTransaction(userWithTeam.teamId, async (tx) => {
      await tx
        .update(contactsTable)
        .set({
          tags: sql`
                        (SELECT jsonb_agg(DISTINCT elem)
                         FROM jsonb_array_elements_text(
                                      COALESCE(${contactsTable.tags}, '[]'::jsonb) || ${JSON.stringify(input.tags)}::jsonb
                              ) elem)
                    `,
        })
        .where(eq(contactsTable.id, input.id));
    });

    revalidateTag(`contacts:${userWithTeam?.teamId}`);

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function updateContacts(input: {
  ids: string[];
  tags?: string[];
}) {
  unstable_noStore();
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    toast.error("There is no team");
    return {
      data: null,
      error: null,
    };
  }

  try {
    await withTenantTransaction(userWithTeam.teamId, async (tx) => {
      await tx
        .update(contactsTable)
        .set({
          tags: sql`
                        (SELECT jsonb_agg(DISTINCT elem)
                         FROM jsonb_array_elements_text(
                                      COALESCE(${contactsTable.tags}, '[]'::jsonb) || ${JSON.stringify(input.tags)}::jsonb
                              ) elem)
                    `,
        })
        .where(inArray(contactsTable.id, input.ids));
    });

    revalidateTag(`contacts:${userWithTeam?.teamId}`);

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}

export async function removeContactTags(input: { ids: string[]; tag: string }) {
  unstable_noStore();
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam?.teamId) {
    toast.error("There is no team");
    return {
      data: null,
      error: null,
    };
  }

  try {
    await withTenantTransaction(userWithTeam.teamId, async (tx) => {
      await tx
        .update(contactsTable)
        .set({
          tags: sql`
                        (SELECT jsonb_agg(DISTINCT elem)
                         FROM jsonb_array_elements_text(
                                      COALESCE(${contactsTable.tags}, '[]'::jsonb) - ${input.tag}
                              ) elem)
                    `,
        })
        .where(inArray(contactsTable.id, input.ids));
    });

    revalidateTag(`contacts:${userWithTeam?.teamId}`);

    return {
      data: null,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: getErrorMessage(err),
    };
  }
}
