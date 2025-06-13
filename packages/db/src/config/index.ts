import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "../schema";

dotenv.config({ path: "../../.env" });

// Database connection config
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Client for migrations and queries
export const migrationClient = postgres(connectionString, { max: 1 });

// Client for queries only
export const queryClient = postgres(connectionString);

// Drizzle ORM instance
export const db = drizzle(queryClient, { schema });

// Migration function
export async function runMigrations() {
  try {
    console.log("Running migrations...");

    const migrationDb = drizzle(migrationClient);

    await migrate(migrationDb, {
      migrationsFolder: "./drizzle",
    });

    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}
