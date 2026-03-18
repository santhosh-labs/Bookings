import mysql from "mysql2/promise";
import "dotenv/config";

async function check() {
  if (!process.env.DATABASE_URL) {
    console.error("No DATABASE_URL");
    return;
  }
  const connection = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true
    }
  });
  try {
    const [rows]: any = await connection.query("DESCRIBE workspaces");
    console.log("COLUMNS IN workspaces:");
    rows.forEach((row: any) => {
      console.log(`- ${row.Field} (${row.Type})`);
    });
  } catch (err: any) {
    console.error("ERROR:", err.message);
  }
  await connection.end();
}
check();
