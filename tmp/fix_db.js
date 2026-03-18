const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
    console.log("Running DB fix...");
    const url = process.env.DATABASE_URL || "mysql://root@localhost:3306/saas_scheduler";
    
    try {
        const connection = await mysql.createConnection(url);
        console.log("Connected to DB.");

        // Check columns in workspaces
        const [rows] = await connection.query("DESCRIBE workspaces");
        const hasTheme = rows.some((row) => row.Field === 'theme');

        if (!hasTheme) {
            console.log("Adding 'theme' column to 'workspaces' table...");
            await connection.query("ALTER TABLE workspaces ADD COLUMN theme JSON");
            console.log("Column 'theme' added successfully.");
        } else {
            console.log("Column 'theme' already exists.");
        }

        await connection.end();
    } catch (err) {
        console.error("DB Fix Error:", err.message);
    }
}

fix();
