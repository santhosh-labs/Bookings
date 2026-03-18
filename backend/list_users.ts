import "dotenv/config";
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "../shared/schema";

async function listUsers() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL not set");
        return;
    }

    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        const db = drizzle(connection, { schema, mode: "default" });

        const users = await db.select().from(schema.staff);
        console.log("Current Users in DB:");
        users.forEach(u => {
            console.log(`- ID: ${u.id}, Username: ${u.username}, Name: ${u.name}, Email: ${u.email}`);
        });
        
        await connection.end();
    } catch (err: any) {
        console.error("Error listing users:", err.message);
    }
}

listUsers();
