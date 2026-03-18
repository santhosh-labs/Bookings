import { db } from "./db";
import { workspaces } from "../shared/schema";
import { eq } from 'drizzle-orm';

async function testUpdate() {
   try {
     console.log("Updating workspace 1 theme...");
     await db.update(workspaces).set({
         theme: { primaryColor: "#4B4376", backgroundUrl: "some_url", logoUrl: "", headerTitle: "Test", showHeader: true }
     }).where(eq(workspaces.id, 1));
     console.log("Update success!");
     process.exit(0);
   } catch (e: any) {
     console.error("Error SQL:", e.sql);
     console.error("Error Message:", e.message);
     process.exit(1);
   }
}
testUpdate();
