const { readFileSync } = require("fs");
const { resolve } = require("path");
const { Client } = require("pg");

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  const filePath = resolve(__dirname, "../supabase/migrations/00001_initial_schema.sql");
  const sql = readFileSync(filePath, "utf-8");

  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log("Running migration: 00001_initial_schema.sql");
    await client.query(sql);
    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
