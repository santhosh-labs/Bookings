import { storage } from "./storage";

async function testStorage() {
  try {
    const updated = await storage.updateWorkspace(1, {
      theme: { primaryColor: "#4B4376", backgroundUrl: "some_url", logoUrl: "", headerTitle: "Testing TiDB Update", showHeader: true }
    });
    console.log("Storage update successful!", updated);
    process.exit(0);
  } catch (err: any) {
    console.error("Storage update failed:", err.message);
    process.exit(1);
  }
}
testStorage();
