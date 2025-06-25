import { sql } from "drizzle-orm";
import { db } from "..";

/**
 * Extract the type of the `tx` parameter that `db.transaction` gives you.
 */
type Tx = Parameters<typeof db.transaction>[0] extends (
  tx: infer T,
) => Promise<unknown>
  ? T
  : never;

/**
 * Run a transactional block scoped to a given tenant.
 * Notice that fn now takes a `tx: Tx`, not `typeof db`.
 */
export async function withTenantTransaction<T>(
  tenantId: string,
  fn: (tx: Tx) => Promise<T>,
): Promise<T> {
  return await db.transaction(async (tx) => {
    // 1) Scope this transaction’s session to the tenant
    await tx.execute(
      sql`SET LOCAL app.current_tenant = ${sql.raw(`'${tenantId}'`)}`,
    );

    // VERIFY it is set:
    // @ts-ignore
    const [{ value }] = await tx
      .select({
        value: sql`current_setting
                ('app.current_tenant')`,
      })
      .from(sql`(SELECT 1)`);
    console.log("session var is:", value);
    // 2) Run your logic on the transaction client
    const result = await fn(tx);

    // 3) Commit happens automatically if no error is thrown
    return result;
  });
}
