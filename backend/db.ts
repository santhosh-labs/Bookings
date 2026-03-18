import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";
import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL must be set. Example: mysql://root@localhost:3306/saas_scheduler",
    );
}

export const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('tidbcloud.com') ? {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});
export const db = drizzle(pool, { schema, mode: "default" });
