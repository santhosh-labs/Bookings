
import "dotenv/config";
import { storage } from "./server/storage";

async function test() {
    console.log("Testing stats...");
    try {
        const stats = await storage.getStats(1);
        console.log("Stats:", JSON.stringify(stats, null, 2));
    } catch (err: any) {
        console.error("Error fetching stats:", err.message);
    }
}

test();
