import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { getConfig } from "./environments";
import * as schema from "../schema";

// dotenv.config({ path: "../../.env" });

// Get environment-specific configuration
const config = getConfig();

// Database connection config
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Client for migrations
export const migrationClient = postgres(connectionString, {
  max: 1,
  ssl: config.database.ssl,
});

// Client for queries
export const queryClient = postgres(connectionString, {
  max: config.database.maxConnections,
  idle_timeout: config.database.idleTimeout,
  ssl: config.database.ssl,
});

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
