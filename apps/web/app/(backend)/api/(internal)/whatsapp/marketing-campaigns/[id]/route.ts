import { db } from "@workspace/db/index";
import { marketingCampaignsTable, templatesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await params;

  try {
    const data = await db.transaction(async (tx) => {
      const data = await tx.query.marketingCampaignsTable.findFirst({
        where: eq(marketingCampaignsTable.id, id),
        with: {
          template: true,
        },
      });

      return { data };
    });
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response("", { status: 400 });
  }
}
