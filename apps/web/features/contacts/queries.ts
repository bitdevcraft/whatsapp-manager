import { unstable_cache } from "@/lib/unstable-cache";
import { GetSchema } from "@/lib/validations";
import { db } from "@workspace/db";
import {
  and,
  asc,
  count,
  desc,
  gt,
  gte,
  ilike,
  inArray,
  lte,
  sql,
} from "drizzle-orm";
import { contactsTable } from "@workspace/db/schema/contacts";
import { filterColumns } from "@workspace/ui/lib/filter-columns";
import { text } from "drizzle-orm/mysql-core";

export async function getContacts(input: GetSchema) {
  return await unstable_cache(
    async () => {
      try {
        console.log("Render", JSON.stringify(input));
        const offset = (input.page - 1) * input.perPage;

        const { data, total } = await db.transaction(async (tx) => {
          const data = await tx
            .select()
            .from(contactsTable)
            .limit(input.perPage)
            .offset(offset);

          const total = await tx
            .select({
              count: count(),
            })
            .from(contactsTable)
            .execute()
            .then((res) => res[0]?.count ?? 0);

          return {
            data,
            total,
          };
        });

        const pageCount = Math.ceil(total / input.perPage);
        return { data, pageCount };
      } catch (error) {
        console.error(error);
        return { data: [], pageCount: 0 };
      }
    },
    [JSON.stringify(input)],
    {
      revalidate: 1,
      tags: ["contacts"],
    }
  )();
}
