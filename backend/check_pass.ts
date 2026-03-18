import "dotenv/config";
import mysql from 'mysql2/promise';

async function checkPassword() {
    if (!process.env.DATABASE_URL) return;
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        const [rows]: any = await connection.execute("SELECT password FROM staff WHERE id = 1");
        console.log("Password for ID 1:", rows[0]?.password);
        await connection.end();
    } catch (err: any) {
        console.error("Error:", err.message);
    }
}
checkPassword();
