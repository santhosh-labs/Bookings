import "dotenv/config";
import mysql from "mysql2/promise";

async function fix() {
  if (!process.env.DATABASE_URL) {
    console.error("No DATABASE_URL");
    return;
  }
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    await connection.query("ALTER TABLE workspaces ADD COLUMN theme JSON");
    console.log("Added theme column");
  } catch (err: any) {
    // Error is ok if column already exists
    console.error("Message:", err.message);
  }
  await connection.end();
}
fix();
