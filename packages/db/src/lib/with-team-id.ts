import { PgSelect } from "drizzle-orm/pg-core";

function withTeam<T extends PgSelect>(
  qb: T,
  page: number = 1,
  pageSize: number = 10
) {
  return qb.limit(pageSize).offset((page - 1) * pageSize);
}
