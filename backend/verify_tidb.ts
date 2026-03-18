import "dotenv/config";
import mysql from "mysql2/promise";

async function verify() {
    const url = process.env.DATABASE_URL!;
    const connection = await mysql.createConnection({
        uri: url,
        ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true }
    });

    console.log("Connected to TiDB!");

    // Show all tables
    const [tables]: any = await connection.query("SHOW TABLES");
    console.log("\nTables in database:");
    tables.forEach((t: any) => console.log(" -", Object.values(t)[0]));

    // Check workspaces columns
    try {
        const [cols]: any = await connection.query("DESCRIBE workspaces");
        console.log("\nworkspaces columns:");
        cols.forEach((c: any) => console.log(` - ${c.Field}: ${c.Type}`));
    } catch (e: any) {
        console.log("workspaces table not found:", e.message);
    }

    await connection.end();
}

verify().catch(console.error);
