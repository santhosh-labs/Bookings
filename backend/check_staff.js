import mysql from "mysql2/promise";
import "dotenv/config";

async function check() {
  const conn = await mysql.createConnection({
     uri: process.env.DATABASE_URL,
     ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true }
  });
  const [rows] = await conn.query("SELECT id, username, password FROM staff");
  console.log(rows);
  await conn.end();
}
check();
