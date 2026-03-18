import mysql from 'mysql2/promise';
import * as dotenv from "dotenv";
dotenv.config();

async function initDb() {
    const connection = await mysql.createConnection({
        uri: process.env.DATABASE_URL!,
        ssl: {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true
        }
    });
    try {
        console.log("Creating workflows table...");
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS workflows (
                id INT AUTO_INCREMENT PRIMARY KEY,
                workspace_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                \`trigger\` VARCHAR(50) NOT NULL,
                settings JSON NOT NULL,
                is_active BOOLEAN NOT NULL DEFAULT TRUE
            )
        `);
        console.log("Successfully created/verified workflows table.");

        console.log("Creating notifications table...");
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type VARCHAR(50) NOT NULL,
                is_read BOOLEAN NOT NULL DEFAULT FALSE,
                created_at VARCHAR(50) NOT NULL
            )
        `);
        console.log("Successfully created/verified notifications table.");
        
    } catch (error) {
        console.error("Error initializing database:", error);
    } finally {
        await connection.end();
        process.exit();
    }
}

initDb();
