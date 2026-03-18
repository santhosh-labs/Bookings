import crypto from "crypto";
import mysql from "mysql2/promise";
import "dotenv/config";
import { promisify } from "util";

const scryptAsync = promisify(crypto.scrypt);

async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return crypto.timingSafeEqual(hashedBuf, suppliedBuf);
}

async function testLogin() {
  try {
    const conn = await mysql.createConnection({
       uri: process.env.DATABASE_URL,
       ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true }
    });
    
    const [rows] = await conn.query("SELECT * FROM staff WHERE username = ?", ["admin"]);
    if (rows.length === 0) {
      console.log("Admin user not found.");
      process.exit(1);
    }
    
    const user = rows[0];
    console.log("Stored password hash:", user.password);
    
    const isValid = await comparePasswords("password", user.password);
    console.log("Is valid 'password'?:", isValid);
    
    await conn.end();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

testLogin();
