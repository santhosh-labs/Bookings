import "dotenv/config";
import mysql from "mysql2/promise";

const schema = `
CREATE TABLE IF NOT EXISTS workspaces (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  logo TEXT,
  currency VARCHAR(20) NOT NULL DEFAULT 'USD',
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  theme JSON
);

CREATE TABLE IF NOT EXISTS staff (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspace_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  avatar TEXT,
  phone VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  designation VARCHAR(255),
  gender VARCHAR(20),
  date_of_birth VARCHAR(20),
  additional_info TEXT
);

CREATE TABLE IF NOT EXISTS services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspace_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  duration INT NOT NULL,
  price INT NOT NULL,
  buffer_time INT NOT NULL,
  location VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  description TEXT,
  color VARCHAR(20),
  category VARCHAR(50),
  schedule_type VARCHAR(50),
  staff_ids JSON NOT NULL,
  settings JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspace_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  total_bookings INT DEFAULT 0,
  last_booking VARCHAR(50),
  joined_date VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspace_id INT NOT NULL,
  service_id INT NOT NULL,
  staff_id INT,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  date VARCHAR(50) NOT NULL,
  time VARCHAR(50) NOT NULL,
  duration INT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Upcoming',
  notes TEXT,
  price INT NOT NULL,
  metadata JSON
);

CREATE TABLE IF NOT EXISTS availability (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspace_id INT NOT NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  schedule JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS workflows (
  id INT PRIMARY KEY AUTO_INCREMENT,
  workspace_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  trigger VARCHAR(50) NOT NULL,
  settings JSON NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);
`;

async function createTables() {
    const url = process.env.DATABASE_URL!;
    const connection = await mysql.createConnection({
        uri: url,
        ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
        multipleStatements: true
    });

    console.log("Connected to TiDB! Creating tables...");
    
    // Run each statement individually
    const statements = schema.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
        try {
            await connection.query(stmt);
            const tableName = stmt.match(/TABLE IF NOT EXISTS (\w+)/)?.[1];
            if (tableName) console.log(`  ✓ ${tableName}`);
        } catch (e: any) {
            console.error(`  ✗ Error: ${e.message}`);
        }
    }

    console.log("\nAll tables created successfully!");
    await connection.end();
}

createTables().catch(console.error);
