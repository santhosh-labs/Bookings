import "dotenv/config";
import { db } from "./db";
import { hashPassword } from "./auth";
import { staff } from "../shared/schema";
import { eq } from "drizzle-orm";

async function fix() {
  try {
    const newHash = await hashPassword("password");
    await db.update(staff).set({ password: newHash }).where(eq(staff.username, "admin"));
    console.log("Password updated successfully for admin user!");
    process.exit(0);
  } catch (err: any) {
    console.error("Failed to update password:", err.message);
    process.exit(1);
  }
}

fix();
