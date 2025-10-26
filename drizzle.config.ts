import { defineConfig } from "drizzle-kit";

// Remove the check for DATABASE_URL if you prefer to handle it differently
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite", // Change from "postgresql" to "sqlite"
  dbCredentials: {
    url: process.env.DATABASE_URL, // Make sure this points to your SQLite Cloud database URL
  },
});
