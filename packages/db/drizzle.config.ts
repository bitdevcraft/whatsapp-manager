import { databasePrefix } from "@/constants";
import "dotenv/config";

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./src/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: [`${databasePrefix}_*`],
});
