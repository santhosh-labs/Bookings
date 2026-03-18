import { db } from "./backend/db";
import { sql } from "drizzle-orm";

async function checkTables() {
    try {
        const result = await db.execute(sql`SHOW TABLES`);
        console.log("Tables:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error checking tables:", error);
    } finally {
        process.exit();
    }
}

checkTables();
