import * as dotenv from "dotenv";
dotenv.config();
import { storage } from "./storage";
import { hashPassword } from "./auth";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    const password = await hashPassword("Password123!");

    // 1. Create Users
    console.log("Checking users...");
    async function getOrCreateUser(name: string, email: string) {
      let user = await storage.getUserByEmail(email);
      if (!user) {
        console.log(`Creating user: ${name}`);
        user = await storage.createUser({ name, email, password });
      }
      return user;
    }

    const ownerUser = await getOrCreateUser("Alice Owner", "owner@example.com");
    const staffUser = await getOrCreateUser("Bob Staff", "staff@example.com");
    const multiUser = await getOrCreateUser("Charlie Multi", "multi@example.com");

    // 2. Create Workspaces
    console.log("Checking workspaces...");
    async function getOrCreateWorkspace(name: string, slug: string, ownerId: number) {
      let ws = await storage.getWorkspaceBySlug(slug);
      if (!ws) {
        console.log(`Creating workspace: ${name}`);
        ws = await storage.createWorkspace({ name, slug }, ownerId);
      }
      return ws;
    }

    const workspace1 = await getOrCreateWorkspace("Acme Bookings", "acme-bookings", ownerUser.id);
    const workspace2 = await getOrCreateWorkspace("Tech Solutions", "tech-solutions", ownerUser.id);

    // 3. Add Memberships
    console.log("Adding memberships...");
    async function safeAddMember(userId: number, workspaceId: number, role: string) {
        const members = await storage.getMemberships(workspaceId);
        if (!members.some(m => m.userId === userId)) {
            await storage.createMembership({ userId, workspaceId, role });
        }
    }

    await safeAddMember(staffUser.id, workspace1.id, "STAFF");
    await safeAddMember(multiUser.id, workspace1.id, "STAFF");
    await safeAddMember(multiUser.id, workspace2.id, "STAFF");

    console.log("✅ Seeding complete!");
    console.log("\nMock Logins (Password: Password123!):");
    console.log("--------------------------------------");
    console.log("1. Owner (Alice): owner@example.com (Access to Acme & Tech)");
    console.log("2. Staff (Bob): staff@example.com (Access to Acme)");
    console.log("3. Multi-org Staff (Charlie): multi@example.com (Access to Acme & Tech)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
