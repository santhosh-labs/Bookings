import crypto from "crypto";
import mysql from "mysql2/promise";
import "dotenv/config";

async function fix() {
  const password = "password";
  const salt = crypto.randomBytes(16).toString("hex");
  crypto.scrypt(password, salt, 64, async (err, derivedKey) => {
    if (err) throw err;
    const newHash = derivedKey.toString("hex") + "." + salt;
    console.log("New Hash Generated.");
    
    const conn = await mysql.createConnection({
       uri: process.env.DATABASE_URL,
       ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true }
    });
    
    await conn.query("UPDATE staff SET password = ? WHERE id = 1", [newHash]);
    console.log("Password updated successfully for admin user!");
    process.exit(0);
  });
}

fix();
