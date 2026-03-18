import "dotenv/config";
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "./shared/schema";

async function check() {
    console.log("Checking MySQL state...");
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL not set");
        return;
    }

    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        const db = drizzle(connection, { schema, mode: "default" });

        const wsCount = await db.select().from(schema.workspaces);
        console.log("Workspaces:", wsCount.length);
        if (wsCount.length === 0) {
            console.log("Seeding workspace...");
            await db.insert(schema.workspaces).values({
                name: "Default Workspace",
                slug: "default",
                currency: "USD",
                timezone: "UTC"
            });
            console.log("Workspace seeded.");
        }

        const staffCount = await db.select().from(schema.staff);
        console.log("Staff:", staffCount.length);
        if (staffCount.length === 0) {
            console.log("Seeding staff...");
            const [firstWs] = await db.select().from(schema.workspaces).limit(1);
            await db.insert(schema.staff).values({
                workspaceId: firstWs.id,
                name: "Santhosh S",
                email: "san.cloudx.io@gmail.com",
                role: "Super Admin",
                isActive: true
            });
            console.log("Staff seeded.");
        }
        
        console.log("DB Check Complete.");
        await connection.end();
    } catch (err: any) {
        console.error("DB Error:", err.message);
        console.log("\nTIP: Make sure you have created the database in phpMyAdmin (XAMPP):");
        console.log("1. Open phpMyAdmin");
        console.log("2. Click 'New'");
        console.log("3. Database name: saas_scheduler");
        console.log("4. Click 'Create'");
    }
}

check();
