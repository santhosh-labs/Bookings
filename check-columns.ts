import "dotenv/config";
import mysql from "mysql2/promise";

async function check() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL!);
    const [rows] = await connection.execute("DESCRIBE services");
    console.log(rows);
    await connection.end();
}

check().catch(console.error);
