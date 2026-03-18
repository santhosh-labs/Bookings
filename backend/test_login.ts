import "dotenv/config";
import { db } from "./db";
import { staff } from "../shared/schema";
import { eq } from "drizzle-orm";
import { promisify } from "util";
import { scrypt, timingSafeEqual } from "crypto";

const scryptAsync = promisify(scrypt);

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  console.log("Hashed length:", hashed.length, "Salt length:", salt.length);
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

async function testLogin() {
  const [user] = await db.select().from(staff).where(eq(staff.username, "admin"));
  if (!user) {
    console.log("Admin user not found.");
    process.exit(1);
  }
  
  console.log("Stored password:", user.password);
  
  const isValid = await comparePasswords("password", user.password);
  console.log("Is valid 'password'?:", isValid);
  
  process.exit(0);
}

testLogin().catch(console.error);
