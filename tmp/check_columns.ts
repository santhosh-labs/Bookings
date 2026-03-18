import "dotenv/config";
import mysql from 'mysql2/promise';

async function check() {
    console.log("Checking database columns...");
    const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/saas_scheduler";
    
    try {
        const connection = await mysql.createConnection(url);
        const [rows]: any = await connection.query("DESCRIBE workspaces");
        console.log("Columns in 'workspaces' table:");
        rows.forEach((row: any) => {
            console.log(`- ${row.Field}: ${row.Type}`);
        });
        await connection.end();
    } catch (err: any) {
        console.error("Error:", err.message);
    }
}

check();
