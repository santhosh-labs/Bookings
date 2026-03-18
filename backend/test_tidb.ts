import { db } from "./db.js";
import { workspaces } from "../shared/schema.js";

async function verify() {
    try {
        console.log("Testing connection...");
        const res = await db.select().from(workspaces).limit(1);
        console.log("TiDB Connection successful!", res);
        process.exit(0);
    } catch (err: any) {
        console.error("Connection failed:", err.message);
        process.exit(1);
    }
}
verify();
