import mysql from "mysql2/promise";
import "dotenv/config";

async function check() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL!);
  try {
    const [rows]: any = await connection.query("SHOW COLUMNS FROM workspaces");
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
