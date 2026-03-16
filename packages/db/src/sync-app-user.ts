import "dotenv/config";

import postgres from "postgres";

import { loadAppUserSyncEnv } from "./env";

function quoteIdentifier(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function quoteLiteral(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

async function syncAppUser() {
  const env = loadAppUserSyncEnv();
  const sql = postgres(env.databaseUrl, { max: 1 });

  try {
    const password = quoteLiteral(env.postgresAppPassword);
    const role = quoteIdentifier(env.postgresAppUser);
    const database = quoteIdentifier(env.databaseName);
    const existingRole = await sql<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM pg_roles
        WHERE rolname = ${env.postgresAppUser}
      ) AS "exists"
    `;

    if (existingRole[0]?.exists) {
      await sql.unsafe(`ALTER ROLE ${role} WITH PASSWORD ${password}`);
    } else {
      await sql.unsafe(
        `CREATE ROLE ${role} WITH LOGIN PASSWORD ${password} NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION INHERIT`
      );
    }

    await sql.unsafe(`GRANT CONNECT ON DATABASE ${database} TO ${role}`);
    await sql.unsafe(`GRANT USAGE ON SCHEMA public TO ${role}`);
    await sql.unsafe(
      `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${role}`
    );
    await sql.unsafe(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${role}`
    );
    await sql.unsafe(
      `GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${role}`
    );
    await sql.unsafe(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${role}`
    );

    console.log(`Synced database role ${env.postgresAppUser} from environment.`);
  } finally {
    await sql.end();
  }
}

syncAppUser().catch((error) => {
  console.error("Failed to sync app user:", error);
  process.exit(1);
});
