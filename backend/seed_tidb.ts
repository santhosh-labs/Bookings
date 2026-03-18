import "dotenv/config";
import mysql from "mysql2/promise";

async function seed() {
    const url = process.env.DATABASE_URL!;
    const connection = await mysql.createConnection({
        uri: url,
        ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true }
    });

    console.log("Seeding TiDB database...");

    // Insert default workspace
    const [wsRes]: any = await connection.query(
        `INSERT IGNORE INTO workspaces (id, name, slug, currency, timezone) VALUES (1, 'My Organization', 'my-org', 'USD', 'UTC')`
    );
    console.log("✓ Workspace seeded (id=1)");

    // Insert admin staff - password is "password" hashed
    await connection.query(
        `INSERT IGNORE INTO staff (id, workspace_id, name, username, password, email, role, is_active)
         VALUES (1, 1, 'Administrator', 'admin', 
         'ef609320e83e979c531d0411e73995f5cc1b30588820c02a77ba2e096f2649a2a9e52c803328e7da3e2fd5e3264b4c7310df666014e0474ce2a4cd2736141c21.84a1e9526715f5a898744090b4e05b63',
         'admin@example.com', 'Super Admin', true)`
    );
    console.log("✓ Admin staff seeded (username: admin, password: password)");

    // Insert default availability
    await connection.query(
        `INSERT IGNORE INTO availability (id, workspace_id, timezone, schedule)
         VALUES (1, 1, 'UTC', '{"monday":{"active":true,"slots":[{"start":"09:00","end":"17:00"}]},"tuesday":{"active":true,"slots":[{"start":"09:00","end":"17:00"}]},"wednesday":{"active":true,"slots":[{"start":"09:00","end":"17:00"}]},"thursday":{"active":true,"slots":[{"start":"09:00","end":"17:00"}]},"friday":{"active":true,"slots":[{"start":"09:00","end":"17:00"}]},"saturday":{"active":false,"slots":[]},"sunday":{"active":false,"slots":[]}}')`
    );
    console.log("✓ Default availability seeded");

    // Insert sample services
    await connection.query(
        `INSERT IGNORE INTO services (id, workspace_id, name, duration, price, buffer_time, location, is_active, color, staff_ids, settings)
         VALUES 
         (1, 1, 'Initial Consultation', 30, 50, 0, 'Online', true, '#4B4376', '[1]', '{}'),
         (2, 1, 'Project Review', 60, 120, 0, 'Online', true, '#FF4C4C', '[1]', '{}')`
    );
    console.log("✓ Sample services seeded");

    console.log("\n✅ Database seeding complete!");
    await connection.end();
}

seed().catch(console.error);
