import mysql from 'mysql2/promise';
import * as dotenv from "dotenv";
dotenv.config();

async function checkWorkflows() {
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL!,
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        }
    });
    try {
        const [rows] = await connection.execute('SHOW TABLES LIKE "workflows"');
        console.log("Workflows table exists:", (rows as any[]).length > 0);
        
        if ((rows as any[]).length > 0) {
            const [columns] = await connection.execute('DESCRIBE workflows');
            console.log("Workflows columns:", JSON.stringify(columns, null, 2));
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
        process.exit();
    }
}

checkWorkflows();
