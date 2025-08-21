import { getTableColumns, SQL, sql } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";

export const buildConflictUpdateColumns = <
  T extends PgTable,
  Q extends keyof T["_"]["columns"],
>(
  table: T,
  columns: Q[]
) => {
  const cls = getTableColumns(table);
  return columns.reduce(
    (acc, column) => {
      const colName = cls[column]?.name;
      if (colName === "tags") {
        // merge old + new tags
        acc[column] = sql`
        (
          SELECT jsonb_agg(DISTINCT elem)
          FROM jsonb_array_elements_text(
            COALESCE(${cls[column]}, '[]'::jsonb) || excluded.${
              // @ts-expect-error column name
              sql.identifier([colName])
            }
          ) elem
        )
      `;
      } else {
        acc[column] = sql.raw(`excluded.${colName}`);
      }
      return acc;
    },
    {} as Record<Q, SQL>
  );
};
