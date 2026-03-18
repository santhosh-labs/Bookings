
import "dotenv/config";
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "./shared/schema";

async function check() {
    if (!process.env.DATABASE_URL) return;
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        const db = drizzle(connection, { schema, mode: "default" });

        const b = await db.select().from(schema.bookings);
        console.log("Bookings count:", b.length);
        console.log("Bookings:", JSON.stringify(b, null, 2));
        await connection.end();
    } catch (err: any) {
        console.error("Error:", err.message);
    }
}

check();
