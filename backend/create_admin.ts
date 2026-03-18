import "dotenv/config";
import mysql from 'mysql2/promise';
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function createAdmin() {
    if (!process.env.DATABASE_URL) return;
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        
        const username = "admin";
        const password = "password123";
        const hashedPassword = await hashPassword(password);
        
        // Ensure workspace exists
        const [workspaces]: any = await connection.execute("SELECT id FROM workspaces LIMIT 1");
        let workspaceId = workspaces[0]?.id;
        
        if (!workspaceId) {
            const [wsResult]: any = await connection.execute(
                "INSERT INTO workspaces (name, slug, currency, timezone) VALUES (?, ?, ?, ?)",
                ["Admin Workspace", "admin", "USD", "UTC"]
            );
            workspaceId = wsResult.insertId;
        }

        // Check if admin exists
        const [existing]: any = await connection.execute("SELECT id FROM staff WHERE username = ?", [username]);
        if (existing.length > 0) {
            await connection.execute("UPDATE staff SET password = ? WHERE username = ?", [hashedPassword, username]);
            console.log("Admin password updated to 'password123'");
        } else {
            await connection.execute(
                "INSERT INTO staff (workspace_id, name, username, password, email, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [workspaceId, "Administrator", username, hashedPassword, "admin@example.com", "Admin", 1]
            );
            console.log("Admin user created with username 'admin' and password 'password123'");
        }
        
        await connection.end();
    } catch (err: any) {
        console.error("Error:", err.message);
    }
}
createAdmin();
