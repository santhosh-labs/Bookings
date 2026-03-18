import mysql from 'mysql2/promise';
import * as dotenv from "dotenv";
dotenv.config();

async function checkServices() {
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL!,
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        }
    });
    try {
        const [columns] = await connection.execute('DESCRIBE services');
        console.log("Services columns:", JSON.stringify(columns, null, 2));
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
        process.exit();
    }
}

checkServices();
