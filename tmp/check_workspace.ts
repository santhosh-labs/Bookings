import mysql from "mysql2/promise";
import "dotenv/config";

async function check() {
  if (!process.env.DATABASE_URL) {
    console.error("No DATABASE_URL");
    return;
  }
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  try {
    const [rows]: any = await connection.query("DESCRIBE workspaces");
    console.log("COLUMNS IN workspaces:");
    rows.forEach((row: any) => {
      console.log(`${row.Field}: ${row.Type} (${row.Null})`);
    });
    
    const [data]: any = await connection.query("SELECT * FROM workspaces WHERE id = 1");
    console.log("WORKSPACE 1 DATA:", JSON.stringify(data[0], null, 2));
  } catch (err: any) {
    console.error("ERROR:", err.message);
  }
  await connection.end();
}
check();
