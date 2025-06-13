import { TagsFormValues } from "@/features/tags/_lib/schema";
import { getUserWithTeam } from "@/lib/db/queries";
import { db } from "@workspace/db/config";
import { tagsTable, NewTag } from "@workspace/db/schema";
import { withTenantTransaction } from "@workspace/db/tenant";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const userWithTeam = await getUserWithTeam();

  if (!userWithTeam) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (!userWithTeam.teamId) {
    return new Response("", {
      status: 400,
      statusText: "No Team",
    });
  }

  const body = (await request.json()) as TagsFormValues;

  try {
    const data = await withTenantTransaction(
      userWithTeam?.teamId,
      async (tx) => {
        const data = await tx.insert(tagsTable).values({
          name: body.name,
          teamId: userWithTeam.teamId!,
        });

        return {
          data,
        };
      }
    );

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error: any) {
    console.error(error.message);
    return new Response(JSON.stringify(error), {
      status: 400,
      statusText: error.message,
    });
  }
}
