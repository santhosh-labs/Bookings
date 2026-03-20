import "dotenv/config";
import mysql from "mysql2/promise";

async function check() {
    console.log("Connecting to TiDB with SSL...");
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL!,
        ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true }
    });
    console.log("Connected!");
    
    console.log("\nWorkspaces:");
    const [wRows]: any = await connection.execute("SELECT * FROM workspaces");
    console.log(JSON.stringify(wRows, null, 2));
    
    console.log("\nMemberships:");
    const [mRows]: any = await connection.execute("SELECT * FROM memberships");
    console.log(JSON.stringify(mRows, null, 2));
    
    await connection.end();
}

check().catch(console.error);
